import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getPaginationItems = (currentPage: number, totalPages: number): (string | number)[] => {
  // If there are 7 or fewer pages, show all of them.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pageNeighbours = 1;
  const pages = new Set<number>();
  
  // Always add first, last, and current page
  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage);

  // Add neighbours
  for (let i = 1; i <= pageNeighbours; i++) {
      if (currentPage - i > 0) pages.add(currentPage - i);
      if (currentPage + i <= totalPages) pages.add(currentPage + i);
  }
  const sortedPages = Array.from(pages).sort((a, b) => a - b);

  const pagesWithGaps: (string|number)[] = [];
  let prevPage = 0;
  for (const page of sortedPages) {
      if (prevPage) {
          // If there's a gap of one page, fill it in.
          if (page - prevPage === 2) {
              pagesWithGaps.push(prevPage + 1);
          // If the gap is larger, add an ellipsis.
          } else if (page - prevPage > 2) {
              pagesWithGaps.push('...');
          }
      }
      pagesWithGaps.push(page);
      prevPage = page;
  }
  return pagesWithGaps;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = getPaginationItems(currentPage, totalPages);

  return (
    <nav className="flex justify-center my-8">
      <ul className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            aria-label="Go to previous page"
          >
            Previous
          </button>
        </li>
        {pageNumbers.map((item, index) => (
          <li key={`${item}-${index}`}>
            {typeof item === 'number' ? (
              <button
                onClick={() => onPageChange(item)}
                className={`px-3 py-1 transition-colors border ${
                  currentPage === item
                    ? 'bg-black text-white font-bold border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
                aria-current={currentPage === item ? 'page' : undefined}
              >
                {item}
              </button>
            ) : (
              <span className="px-3 py-1 text-gray-500" aria-hidden="true">...</span>
            )}
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            aria-label="Go to next page"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;