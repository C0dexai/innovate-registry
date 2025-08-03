import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-lg border border-[var(--card-border)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 font-semibold text-[var(--text-color)] bg-black/20 hover:bg-black/40 transition-colors rounded-t-lg"
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform text-[var(--neon-purple)] ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;