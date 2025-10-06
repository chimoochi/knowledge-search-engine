
import React from 'react';
import SearchResultItem from './SearchResultItem';
import type { SearchResult, AIResponseData } from '../types';
import { SparkleIcon } from './icons';

interface SearchResultsProps {
  paginatedResults: SearchResult[];
  allFilteredResults: SearchResult[];
  isLoading: boolean;
  isInitialLoading: boolean;
  aiResponse: AIResponseData | null;
  isAiResponseLoading: boolean;
  searchTerm: string;
  onScrollToResult: (id: number) => void;
  resultRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  onTagClick: (tag: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  paginatedResults,
  allFilteredResults,
  isLoading,
  isInitialLoading,
  aiResponse,
  isAiResponseLoading,
  searchTerm,
  onScrollToResult,
  resultRefs,
  onTagClick,
}) => {

  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
           <div key={index} className="bg-white border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="flex items-center gap-4 flex-shrink-0 animate-pulse">
                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2 flex flex-wrap items-center gap-x-2 animate-pulse">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <span className="hidden sm:inline">|</span> 
              <div className="w-40 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2 mb-4 animate-pulse">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-11/12 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-pulse">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
                <div className="w-24 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="flex-shrink-0 flex flex-wrap gap-2 text-sm text-right">
                <div className="w-28 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading results...</p>
      </div>
    );
  }

  const aiResponseSection = (isAiResponseLoading || (aiResponse && searchTerm.trim())) && (
    <div className="bg-white border-2 border-gray-800 p-6 mb-4" style={{ animation: `fadeInUp 0.5s ease-out forwards`, opacity: 0 }}>
      <h3 className="text-lg font-semibold text-black mb-2 flex items-center gap-2">
        <SparkleIcon className="w-5 h-5" />
        AI Response
      </h3>
      {isAiResponseLoading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse w-full rounded"></div>
          <div className="h-4 bg-gray-200 animate-pulse w-5/6 rounded"></div>
        </div>
      ) : (
        aiResponse && (
            <div>
                <p className="text-gray-700 mb-4">{aiResponse.feedback}</p>
                {aiResponse.recommendations?.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Recommended Sources:</h4>
                        <ul className="list-disc list-inside space-y-2">
                            {aiResponse.recommendations.map(rec => {
                                const result = allFilteredResults.find(r => r.id === rec.id);
                                return result ? (
                                    <li key={rec.id}>
                                        <button onClick={() => onScrollToResult(rec.id)} className="text-black font-semibold hover:underline text-left">
                                            {result.title}
                                        </button>
                                        <p className="text-gray-600 text-sm pl-2">{rec.reason}</p>
                                    </li>
                                ) : null;
                            })}
                        </ul>
                    </div>
                )}
            </div>
        )
      )}
    </div>
  );

  if (paginatedResults.length === 0) {
    return (
      <>
        {aiResponseSection}
        <div className="text-center bg-white border border-gray-200 p-12 my-4">
            <h3 className="text-xl font-semibold text-black">No Results Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search query or filters.</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {aiResponseSection}
      {paginatedResults.map((result, index) => (
        <SearchResultItem 
          key={result.id} 
          result={result} 
          index={index}
          onTagClick={onTagClick}
          ref={(el: HTMLDivElement | null) => {
            if (el) {
              resultRefs.current.set(result.id, el);
            } else {
              resultRefs.current.delete(result.id);
            }
          }}
        />
      ))}
    </div>
  );
};

export default SearchResults;
