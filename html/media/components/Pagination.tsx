import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-800/80 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 hover:text-cyan-300 transition-all duration-200 border border-gray-700 hover:border-cyan-400/50 hover:shadow-[0_0_8px_rgba(0,255,255,0.3)]"
      >
        Previous
      </button>
      <span className="text-gray-400 font-semibold">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-800/80 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 hover:text-cyan-300 transition-all duration-200 border border-gray-700 hover:border-cyan-400/50 hover:shadow-[0_0_8px_rgba(0,255,255,0.3)]"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
