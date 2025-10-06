import requests
import sqlite3
import time
DB_FILE = "dataset.db"
BASE_URL = "http://localhost:8301" 


def get_unindexed_titles():
    """Gets all titles from the database where Description is NULL."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT Title FROM dataset WHERE Description IS NULL")
    titles = [row[0] for row in c.fetchall()]
    conn.close()
    return titles


def index_titles(titles):
    """Calls the get_dataset_data endpoint for each title."""
    for title in titles:
        time.sleep(.5)
        try:
            response = requests.get(f"{BASE_URL}/get_dataset_data", params={"title": title})
            response.raise_for_status()
            print(f"Successfully indexed: {title}")
        except requests.exceptions.RequestException as e:
            print(f"Error indexing {title}: {e}")


if __name__ == "__main__":
    unindexed_titles = get_unindexed_titles()
    print(f"Found {len(unindexed_titles)} unindexed titles.")
    index_titles(unindexed_titles)
    print("Indexing complete.")
