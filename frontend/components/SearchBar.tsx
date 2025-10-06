import React from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  onBrowse: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchTermChange, onSearch, isLoading, onBrowse }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Explore space biology data..."
        disabled={isLoading}
        className="w-full pl-5 pr-40 py-4 text-lg text-black bg-white border border-gray-300 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all duration-300 placeholder-gray-500"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <button
            onClick={onBrowse}
            disabled={isLoading}
            className="h-12 px-5 bg-gray-200 flex items-center justify-center text-black hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Browse all results"
        >
            Browse
        </button>
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="h-12 w-12 bg-black flex items-center justify-center text-white hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
          aria-label="Search"
        >
          <SearchIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;