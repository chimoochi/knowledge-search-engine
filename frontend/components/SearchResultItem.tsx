
import React, { useState } from 'react';
import type { SearchResult } from '../types';
import { ExternalLinkIcon } from './icons';
import CitationModal from './CitationModal';

interface SearchResultItemProps {
  result: SearchResult;
  index: number;
  onTagClick: (tag: string) => void;
}

const SearchResultItem = React.forwardRef<HTMLDivElement, SearchResultItemProps>(
  ({ result, index, onTagClick }, ref) => {
    const [showCitationModal, setShowCitationModal] = useState(false);

    const getStatusChipColor = (status: SearchResult['status']) => {
      switch (status) {
          case 'Ongoing': return 'bg-gray-200 text-gray-800';
          case 'Completed': return 'bg-gray-200 text-gray-800';
          default: return 'hidden';
      }
    }
    
    return (
      <>
      <div 
          ref={ref}
          className={`bg-white border border-gray-200 p-6 transition-all duration-300 hover:border-gray-300 ${!result.isLoading && 'hover:bg-gray-50'}`}
          style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
      >
          <style>
          {`
              @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
              }
          `}
          </style>
        <div className="flex justify-between items-start mb-1">
          <a href={result.isLoading ? undefined : result.url} target="_blank" rel="noopener noreferrer" className={`text-gray-900 flex items-center gap-2 pr-4 text-xl font-semibold ${!result.isLoading ? 'hover:underline hover:text-black' : 'cursor-default'}`}>
            {result.title}
            {!result.isLoading && <ExternalLinkIcon className="h-4 w-4 flex-shrink-0" />}
          </a>
          
          {result.isLoading ? (
            <div className="flex items-center gap-4 flex-shrink-0 animate-pulse">
                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-shrink-0">
                <button onClick={() => setShowCitationModal(true)} className="text-sm text-gray-600 hover:text-black hover:underline" aria-label="Cite result">
                    Cite
                </button>
            </div>
          )}
        </div>

        {result.isLoading ? (
            <div className="text-sm text-gray-500 mb-2 flex flex-wrap items-center gap-x-2 animate-pulse">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <span className="hidden sm:inline">|</span> 
              <div className="w-40 h-4 bg-gray-200 rounded"></div>
            </div>
        ) : (
            <div className="text-sm text-gray-500 mb-2 flex flex-wrap items-center gap-x-2">
                <span className="truncate max-w-xs">By {result.authors.join(', ')}</span>
                {result.journal && <><span className="hidden sm:inline">|</span><span className="italic">{result.journal}</span></>}
                {result.citationCount > 0 && 
                    <>
                    <span className="hidden sm:inline">|</span> 
                    <span>{result.citationCount} Citations</span>
                    </>
                }
            </div>
        )}

        {result.isLoading ? (
            <div className="space-y-2 mb-4 animate-pulse">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-11/12 h-4 bg-gray-200 rounded"></div>
            </div>
        ) : (
            <p className="text-gray-600 mb-4">{result.description}</p>
        )}
        
        {result.isLoading ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-pulse">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
                <div className="w-24 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="flex-shrink-0 flex flex-wrap gap-2 text-sm text-right">
                <div className="w-28 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
        ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="flex flex-wrap gap-2 items-center">
                {result.tags.map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => onTagClick(tag)}
                    className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 hover:bg-gray-300 hover:text-black transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex-shrink-0 flex flex-wrap gap-2 text-sm text-right">
                  {result.status && <span className={`italic px-2 py-1 ${getStatusChipColor(result.status)}`}>{result.status}</span>}
                  {result.experimentType !== 'Uncategorized' && <span className="bg-gray-200 text-gray-600 italic px-2 py-1">{result.experimentType}</span>}
                  <span className="bg-gray-100 text-gray-600 italic px-2 py-1">{result.type}</span>
                  <span className="text-gray-500 italic px-2 py-1">{result.source}</span>
              </div>
            </div>
        )}
      </div>
      {!result.isLoading && showCitationModal && <CitationModal result={result} onClose={() => setShowCitationModal(false)} />}
      </>
    );
  }
);

export default SearchResultItem;
