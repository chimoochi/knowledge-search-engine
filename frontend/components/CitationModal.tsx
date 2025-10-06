import React, { useState, useEffect } from 'react';
import type { SearchResult } from '../types';
import { CopyIcon } from './icons';

interface CitationModalProps {
  result: SearchResult;
  onClose: () => void;
}

type CitationStyle = 'APA' | 'MLA' | 'Chicago';

const CITATION_STYLES: CitationStyle[] = ['APA', 'MLA', 'Chicago'];

const CitationModal: React.FC<CitationModalProps> = ({ result, onClose }) => {
  const [copiedStyle, setCopiedStyle] = useState<CitationStyle | null>(null);

  const getCitation = (citationStyle: CitationStyle): string => {
    const year = new Date(result.publicationDate).getFullYear();
    const authors = result.authors.join(', ');
    const title = result.title;
    const sourceInfo = (result.url && result.url !== '#') ? result.url : (result.journal || result.source);

    switch (citationStyle) {
      case 'MLA':
        // Simplified MLA: Author(s). "Title." Source, Year.
        return `${authors}. "${title}." ${sourceInfo}, ${year}.`;
      case 'Chicago':
        // Simplified Chicago: Author(s). "Title." Source, Year.
        return `${authors}. "${title}." ${sourceInfo}, ${year}.`;
      case 'APA':
      default:
        // Simplified APA: Author(s). (Year). Title. Source.
        return `${authors}. (${year}). ${title}. ${sourceInfo}.`;
    }
  };

  const handleCopy = (style: CitationStyle, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStyle(style);
    setTimeout(() => setCopiedStyle(null), 2000);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
        className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
    >
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        @keyframes slide-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
      <div 
        className="bg-white border border-gray-300 shadow-xl p-6 w-full max-w-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-black">Generate Citation</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-4">
          {CITATION_STYLES.map(style => {
            const citationText = getCitation(style);
            return (
              <div key={style}>
                <h4 className="font-semibold text-gray-800 mb-2">{style}</h4>
                <div className="bg-gray-100 p-4 text-gray-800 relative">
                  <p className="pr-20">{citationText}</p>
                  <button
                    onClick={() => handleCopy(style, citationText)}
                    className="absolute top-1/2 -translate-y-1/2 right-2 bg-gray-200 text-gray-800 px-3 py-1 text-sm hover:bg-gray-300 flex items-center gap-2"
                  >
                    <CopyIcon className="w-4 h-4" />
                    {copiedStyle === style ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CitationModal;
