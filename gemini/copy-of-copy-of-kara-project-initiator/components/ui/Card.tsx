import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-black/30 backdrop-blur-xl border border-dark-base-300/30 rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};