import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-gray-900/60 border border-fuchsia-500/60 rounded-lg shadow-lg shadow-fuchsia-500/25 backdrop-blur-lg ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-fuchsia-500/60">
          <h3 className="text-lg font-semibold text-fuchsia-300 tracking-wider">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};