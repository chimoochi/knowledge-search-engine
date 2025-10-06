import React from 'react';
import { SearchIcon, SparkleIcon } from './icons';

const INSPIRATION_PROMPTS = [
  "Effects of microgravity on the human cardiovascular system",
  "Plant signaling and behavior in microgravity",
  "Space radiation effects on humans",
  "Microbial tracking in the International Space Station",
];

interface SearchInspirationProps {
  onPromptClick: (prompt: string) => void;
}

const SearchInspiration: React.FC<SearchInspirationProps> = ({ onPromptClick }) => {
  return (
    <div className="w-full max-w-4xl text-center mt-8 animate-fade-in">
       <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
      <div className="flex justify-center items-center gap-2">
         <SparkleIcon className="w-6 h-6 text-gray-800" />
         <h2 className="text-2xl font-semibold text-gray-900">Welcome to the Knowledge Engine</h2>
      </div>
      <p className="text-gray-600 mt-2 mb-8">
        Discover insights from NASA's space biology research. Start with a query or explore a suggestion below.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {INSPIRATION_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="p-4 bg-white border border-gray-200 hover:border-gray-800 hover:bg-gray-50 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 group-hover:bg-gray-200 transition-colors">
                <SearchIcon className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-gray-800 group-hover:text-black">{prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchInspiration;
