import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`
        flex items-center justify-center px-6 py-3 border border-transparent 
        text-base font-bold rounded-md text-black bg-brand-primary 
        hover:bg-brand-primary hover:shadow-glow-blue focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-brand-secondary focus:ring-offset-dark-base-100
        disabled:bg-dark-base-300 disabled:cursor-not-allowed disabled:text-dark-base-content/50 disabled:shadow-none
        transition-all duration-300 ease-in-out
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};