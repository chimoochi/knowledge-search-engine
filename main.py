from fastapi import FastAPI, HTTPException, Query
import json
import os
import requests
from bs4 import BeautifulSoup
import sqlite3
from dotenv import load_dotenv
# https://api.biosearchengine.earth
load_dotenv()
app = FastAPI()

DB_FILE = "dataset.db"


def init_db():
    """Initializes the database and creates the dataset table."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS dataset (
            Title TEXT PRIMARY KEY,
            Link TEXT,
            Description TEXT,
            Tags TEXT,
            doc_type TEXT,
            Authors TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def sync_json_to_db():
    """Syncs the data from all JSON files in the datasets directory to the database."""
    try:
        datasets_dir = "datasets"
        for filename in os.listdir(datasets_dir):
            if filename.endswith(".json"):
                dataset_path = os.path.join(datasets_dir, filename)
                with open(dataset_path, "r") as f:
                    data = json.load(f)

                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()

                for item in data:
                    c.execute(
                        "INSERT OR IGNORE INTO dataset (Title, Link, Description, Tags, doc_type, Authors) VALUES (?, ?, ?, ?, ?, ?)",
                        (
                            item.get("Title"),
                            item.get("Link"),
                            item.get("Description"),
                            json.dumps(item.get("Tags")),
                            item.get("doc_type"),
                            json.dumps(item.get("Authors")),
                        ),
                    )

                conn.commit()
                conn.close()

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="datasets directory not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


init_db()
sync_json_to_db()


@app.get("/get_titles")
def get_titles():
    """n    Returns a list of all dataset titles from the database."""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT Title FROM dataset")
        titles = [row[0] for row in c.fetchall()]
        conn.close()
        return titles

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get_dataset_data")
def get_dataset_data(
    title: str = Query(
        ..., description="The title of the dataset item to get data for."
    ),
):
    """
    Takes a 'title' as a query parameter and will return data about that dataset item.
    If the dataset item has no description or tags, it will try to fetch them from the link.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT * FROM dataset WHERE Title = ?", (title,))
        row = c.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Dataset item not found.")

        item = {
            "Title": row[0],
            "Link": row[1],
            "description": row[2],
            "tags": json.loads(row[3]) if row[3] else [],
            "doc_type": row[4],
            "authors": json.loads(row[5]) if row[5] else [],
        }

        if not item.get("description") or not item.get("tags"):
            try:
                response = requests.get(
                    item.get("Link"), headers={"User-Agent": "Mozilla/5.0"}
                )
                response.raise_for_status()
                soup = BeautifulSoup(response.content, "html.parser")
                main_body = soup.find(id="article-container")
                if not main_body:
                    raise HTTPException(
                        status_code=500,
                        detail="Could not find article-container in the page.",
                    )
                text = main_body.get_text()

                gemini_api_key = os.environ.get("GEMINI_API_KEY")
                if not gemini_api_key:
                    raise HTTPException(
                        status_code=500, detail="GEMINI_API_KEY not set"
                    )

                headers = {
                    "x-goog-api-key": gemini_api_key,
                    "Content-Type": "application/json",
                }
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": f'Given the text from a research paper, provide a short description (2 sentances max, concise), a list of relevant tags (5 max, concise), a list of authors, and the document type (e.g., lit reviews, experimental, meta analysis) in a JSON format: {{"description": "...", "tags": [...], "authors": [...], "doc_type": "..."}}. Text: {text}'
                                }
                            ]
                        }
                    ]
                }
                gemini_response = requests.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
                    headers=headers,
                    json=payload,
                )
                gemini_response.raise_for_status()
                gemini_data = gemini_response.json()
                text_response = gemini_data["candidates"][0]["content"]["parts"][0][
                    "text"
                ]
                if text_response.startswith("```json"):
                    text_response = text_response.replace("```json", "").replace(
                        "```", ""
                    )
                try:
                    generated_json = json.loads(text_response)
                except json.JSONDecodeError:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Invalid JSON response from Gemini API: {text_response}",
                    )

                new_item = {
                    "Title": item.get("Title"),
                    "Link": item.get("Link"),
                    "description": generated_json.get("description"),
                    "tags": generated_json.get("tags"),
                    "doc_type": generated_json.get("doc_type"),
                    "authors": generated_json.get("authors"),
                }

                update_dataset_in_db(title, new_item)

                return new_item

            except requests.exceptions.RequestException as e:
                raise HTTPException(status_code=500, detail=f"Error fetching link: {e}")
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Error processing link: {e}"
                )

        return item

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def update_dataset_in_db(title: str, new_data: dict):
    """Updates a dataset item in the database."""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute(
            "UPDATE dataset SET Description = ?, Tags = ?, doc_type = ?, Authors = ? WHERE Title = ?",
            (
                new_data.get("description"),
                json.dumps(new_data.get("tags")),
                new_data.get("doc_type"),
                json.dumps(new_data.get("authors")),
                title,
            ),
        )
        conn.commit()
        conn.close()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/is_indexed")
def is_indexed(title: str = Query(..., description="The title to check.")):
    """
    Checks if a dataset item is indexed (has description and tags).
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT Description, Tags FROM dataset WHERE Title = ?", (title,))
        row = c.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Dataset item not found.")

        description, tags = row
        if description and tags:
            return {"indexed": True}
        else:
            return {"indexed": False}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8301)