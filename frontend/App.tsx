
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Pagination from './components/Pagination';

import { API_BASE_URL, PROXY_URL, fetchWithRetry } from './utils';

import type { SearchResult, AIResponseData } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(false); // For search actions
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [results, setResults] = useState<SearchResult[]>([]);
  
  const [aiResponse, setAiResponse] = useState<AIResponseData | null>(null);
  const [isAiResponseLoading, setIsAiResponseLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10; // Hardcoded for simplicity

  const resultRefs = useRef(new Map<number, HTMLDivElement>());

  // Fetch initial titles to populate the list quickly
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const titlesUrl = `${API_BASE_URL}/get_titles`;
        const titlesResponse = await fetch(`${PROXY_URL}${encodeURIComponent(titlesUrl)}`);
        if (!titlesResponse.ok) throw new Error(`Failed to fetch titles, status: ${titlesResponse.status}`);
        
        const titles: string[] = await titlesResponse.json();
        
        const placeholderResults: SearchResult[] = titles.map((title, index) => ({
          id: index,
          title: title,
          url: '#',
          description: 'Loading details...',
          summary: '',
          source: "Loading...",
          tags: [],
          publicationDate: new Date().toISOString(), // Placeholder
          authors: [],
          type: 'Indexing...',
          species: [],
          experimentType: 'Uncategorized',
          citationCount: 0,
          status: null,
          isLoading: true,
        }));
        setResults(placeholderResults);
      } catch (error) {
        console.error("Failed to fetch initial titles:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchTitles();
  }, []);

  const idfScores = useMemo(() => {
    const documents = results.filter(r => !r.isLoading);
    const documentFrequencies = new Map<string, number>();
    const totalDocuments = documents.length;
    // FIX: Provide explicit generic types to new Map() to ensure correct type inference for idfScores.
    if (totalDocuments === 0) return new Map<string, number>();

    documents.forEach(doc => {
      const docText = [
        doc.title, doc.description, doc.summary, ...doc.tags, ...doc.authors, ...doc.species,
      ].filter(Boolean).join(' ').toLowerCase();
      
      const uniqueTokensInDoc = new Set(docText.split(/[\s.,;:-]+/).filter(token => token && token.length > 1));
      
      uniqueTokensInDoc.forEach(token => {
        documentFrequencies.set(token, (documentFrequencies.get(token) || 0) + 1);
      });
    });
    
    const idf = new Map<string, number>();
    for (const [word, freq] of documentFrequencies.entries()) {
      idf.set(word, Math.log(totalDocuments / freq));
    }
    return idf;
  }, [results]);

  const handleSearch = useCallback((queryOverride?: string) => {
    const termToSearch = typeof queryOverride === 'string' ? queryOverride : searchTerm;
    if (!termToSearch.trim()) return;

    setIsLoading(true);
    setActiveSearchTerm(termToSearch);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [searchTerm]);

  const handleBrowse = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setCurrentPage(1);
  };

  const filteredResults = useMemo(() => {
    let intermediateResults = results;
    
    const allSearchTokens = activeSearchTerm
      .toLowerCase()
      .split(/[\s.,;:-]+/)
      .filter(token => token && token.length > 1);
      
    if (allSearchTokens.length > 0) {
        const scoredResults = intermediateResults.map(result => {
            let score = 0;
            const title = result.title.toLowerCase();
            const content = result.isLoading ? '' : [
                result.description, result.summary, ...result.tags, ...result.authors, ...result.species,
            ].filter(Boolean).join(' ').toLowerCase();

            allSearchTokens.forEach(token => {
                const idf = idfScores.get(token) || 0.1;
                const titleWeight = 5 + (idf * 5);
                const contentWeight = 1 + (idf * 2);
                
                const singularToken = token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : null;
                const titleMatch = title.includes(token) || (singularToken && title.includes(singularToken));
                const contentMatch = !result.isLoading && (content.includes(token) || (singularToken && content.includes(singularToken)));

                if (titleMatch) score += titleWeight;
                if (contentMatch) score += contentWeight;
            });
            
            return { result, score };
        });
        
        intermediateResults = scoredResults
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.result);
    }

    return intermediateResults;
  }, [results, activeSearchTerm, idfScores]);
  
  const displayedResults = useMemo(() => {
    if (activeSearchTerm) {
        return filteredResults;
    }
    
    return results;
  }, [filteredResults, results, activeSearchTerm]);
  
  useEffect(() => {
    if (!activeSearchTerm.trim() || isLoading) {
      setAiResponse(null);
      return;
    }

    const handler = setTimeout(() => {
      if (filteredResults.length >= 50) {
        setAiResponse(null);
        setIsAiResponseLoading(false);
        return;
      }
        
      const generateAiResponse = async () => {
        setIsAiResponseLoading(true);
        setAiResponse(null); 

        const topFiveForAI = filteredResults.slice(0, 5);

        if (topFiveForAI.length === 0) {
            setAiResponse({ feedback: "No documents were found to analyze for this query.", recommendations: []});
            setIsAiResponseLoading(false);
            return;
        }

        const fetchDetailsForPrompt = async (title: string): Promise<Partial<SearchResult>> => {
            try {
                const dataUrl = `${API_BASE_URL}/get_dataset_data?title=${encodeURIComponent(title)}`;
                const dataResponse = await fetchWithRetry(`${PROXY_URL}${encodeURIComponent(dataUrl)}`);
                const data = await dataResponse.json();
                return {
                    description: data.description || '',
                };
            } catch (error) {
                console.error(`Error fetching details for AI prompt for title: ${title}`, error);
                return { description: 'Error loading details for AI summary.' };
            }
        };
        
        const hydratedTopFive = await Promise.all(
            topFiveForAI.map(async (result) => {
                if (result.isLoading) {
                    const details = await fetchDetailsForPrompt(result.title);
                    return { ...result, ...details, isLoading: false };
                }
                return result;
            })
        );

        const topResults = hydratedTopFive
            .map(r => `ID: ${r.id}, Title: ${r.title}, Description: ${r.description}`)
            .join('\n\n');

        if (topResults.length === 0) {
          setAiResponse({ feedback: "No fully-loaded documents were found to analyze for this query. Results may still be loading.", recommendations: []});
          setIsAiResponseLoading(false);
          return;
        }

        const prompt = `Based on the user's search query "${activeSearchTerm}", analyze the following search results. Provide a short, concise feedback summary in one sentence. Then, recommend up to 3 of the most relevant results by their ID and include a brief reason for each recommendation.

        Search Results:
        ${topResults}`;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  feedback: { type: Type.STRING },
                  recommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.NUMBER },
                        reason: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          });
          const jsonText = response.text.trim();
          const parsedResponse = JSON.parse(jsonText);
          setAiResponse(parsedResponse);
        } catch (error) {
          console.error("Error generating AI response:", error);
          setAiResponse({ feedback: "An error occurred while analyzing the results. Please try again.", recommendations: []});
        } finally {
          setIsAiResponseLoading(false);
        }
      };

      generateAiResponse();
    }, 1000); 

    return () => {
      clearTimeout(handler);
    };
  }, [activeSearchTerm, isLoading, filteredResults]);

  const totalPages = Math.ceil(displayedResults.length / resultsPerPage);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    return displayedResults.slice(startIndex, startIndex + resultsPerPage);
  }, [displayedResults, currentPage, resultsPerPage]);
  
  useEffect(() => {
    const fetchVisibleData = () => {
      const resultsToFetch = paginatedResults.filter(r => r.isLoading);
      if (resultsToFetch.length === 0) return;

      resultsToFetch.forEach(async (result) => {
        try {
          const dataUrl = `${API_BASE_URL}/get_dataset_data?title=${encodeURIComponent(result.title)}`;
          const dataResponse = await fetchWithRetry(`${PROXY_URL}${encodeURIComponent(dataUrl)}`);

          const data = await dataResponse.json();
          
          let source = data.Source || 'N/A';
          if (source === 'N/A' && data.Link) {
              try {
                  source = new URL(data.Link).hostname.replace(/^www\./, '');
              } catch (e) { console.warn("Invalid URL for source:", data.Link) }
          }

          const fetchedData = {
            title: data.Title,
            url: data.Link,
            description: data.description || '',
            summary: data.Summary || '',
            source: source,
            tags: data.tags || [],
            authors: data.authors || [],
            type: data.doc_type ? data.doc_type.charAt(0).toUpperCase() + data.doc_type.slice(1) : 'Uncategorized',
          };
          
          setResults(prev => prev.map(r => r.id === result.id ? { ...r, ...fetchedData, isLoading: false } : r));

        } catch (error) {
          console.error(`Error fetching details for title: ${result.title}`, error);
          setResults(prev => prev.map(r => r.id === result.id ? { ...r, type: 'Error', description: 'Failed to load details.', isLoading: false } : r));
        }
      });
    };

    fetchVisibleData();
  }, [paginatedResults]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearchTerm]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleScrollToResult = (id: number) => {
    const resultIndex = displayedResults.findIndex(r => r.id === id);
    if (resultIndex === -1) {
      console.warn(`Result with id ${id} not found.`);
      return;
    }

    const targetPage = Math.floor(resultIndex / resultsPerPage) + 1;
    
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
      // Use a timeout to wait for the page to update before scrolling
      setTimeout(() => {
        const element = resultRefs.current.get(id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      const element = resultRefs.current.get(id);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    handleSearch(tag);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
            <SearchBar 
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                onSearch={() => handleSearch()}
                isLoading={isLoading}
                onBrowse={handleBrowse}
            />
            <div className="text-sm text-gray-600">
              {displayedResults.length} results found
            </div>
            <div className="w-full">
                <SearchResults 
                    paginatedResults={paginatedResults}
                    allFilteredResults={displayedResults}
                    isLoading={isLoading}
                    isInitialLoading={isInitialLoading}
                    aiResponse={aiResponse}
                    isAiResponseLoading={isAiResponseLoading}
                    searchTerm={activeSearchTerm}
                    onScrollToResult={handleScrollToResult}
                    resultRefs={resultRefs}
                    onTagClick={handleTagClick}
                />
                {totalPages > 1 && (
                    <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
