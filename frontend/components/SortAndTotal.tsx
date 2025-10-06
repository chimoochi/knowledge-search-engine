import React from 'react';
import { ExportIcon, GraphIcon, ListIcon } from './icons';

interface SortAndTotalProps {
  total: number;
  sortOption: string;
  setSortOption: (option: string) => void;
  view: 'list' | 'graph';
  setView: (view: 'list' | 'graph') => void;
  activeTab: 'all' | 'bookmarked';
  onTabChange: (tab: 'all' | 'bookmarked') => void;
  bookmarkedCount: number;
  resultsPerPage: number;
  setResultsPerPage: (count: number) => void;
}

const SortAndTotal: React.FC<SortAndTotalProps> = ({ total, sortOption, setSortOption, view, setView, activeTab, onTabChange, bookmarkedCount, resultsPerPage, setResultsPerPage }) => {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-4">
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => onTabChange('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'all' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
                All Results
            </button>
            <button 
                onClick={() => onTabChange('bookmarked')}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'bookmarked' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
                Bookmarked 
                {bookmarkedCount > 0 && <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5">{bookmarkedCount}</span>}
            </button>
        </div>
        {activeTab === 'all' && (
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                <p>{total} results found</p>
                <div className="flex items-center flex-wrap justify-end gap-x-4 gap-y-2 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                        <label htmlFor="sort-select">Sort by:</label>
                        <select
                            id="sort-select"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="bg-white border border-gray-300 px-2 py-1 text-black text-sm"
                        >
                            <option value="relevance">Relevance</option>
                        </select>
                    </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="per-page-select">Per page:</label>
                        <select
                            id="per-page-select"
                            value={resultsPerPage}
                            onChange={(e) => setResultsPerPage(Number(e.target.value))}
                            className="bg-white border border-gray-300 px-2 py-1 text-black text-sm"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                         <button className="flex items-center gap-1 hover:text-black transition-colors"><ExportIcon className="w-4 h-4" /> Export</button>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-200 p-1">
                        <button onClick={() => setView('list')} className={`p-1 ${view === 'list' ? 'bg-black text-white' : 'hover:bg-gray-300'}`} aria-label="List view">
                            <ListIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => setView('graph')} className={`p-1 ${view === 'graph' ? 'bg-black text-white' : 'hover:bg-gray-300'}`} aria-label="Graph view">
                            <GraphIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SortAndTotal;