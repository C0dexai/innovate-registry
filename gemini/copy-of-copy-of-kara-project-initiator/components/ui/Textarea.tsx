
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className, ...props }) => {
  return (
    <div className={className}>
      <label htmlFor={props.id || props.name} className="block text-sm font-medium text-dark-base-content/80 mb-1">
        {label}
      </label>
      <textarea
        rows={3}
        className="block w-full bg-dark-base-200/50 border-dark-base-300/70 rounded-md shadow-sm 
                   focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm p-2
                   transition-colors duration-200"
        {...props}
      ></textarea>
    </div>
  );
};