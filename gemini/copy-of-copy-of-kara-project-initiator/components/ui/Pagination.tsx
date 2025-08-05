
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    onPageChange(Math.max(1, currentPage - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  };

  return (
    <nav className={`flex items-center justify-between mt-4 ${className}`} aria-label="Pagination">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm font-medium text-dark-base-content/80 bg-dark-base-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-base-300/80"
      >
        Previous
      </button>
      <div className="text-sm text-dark-base-content/60">
        Page {currentPage} of {totalPages}
      </div>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm font-medium text-dark-base-content/80 bg-dark-base-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-base-300/80"
      >
        Next
      </button>
    </nav>
  );
};
