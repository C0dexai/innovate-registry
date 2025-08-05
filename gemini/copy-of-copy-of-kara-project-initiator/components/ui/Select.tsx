
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (string | { value: string; label: string })[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
  return (
    <div className={className}>
      <label htmlFor={props.id || props.name} className="block text-sm font-medium text-dark-base-content/80 mb-1">
        {label}
      </label>
      <select
        className="block w-full bg-dark-base-200/50 border-dark-base-300/70 rounded-md shadow-sm 
                   focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm p-2
                   transition-colors duration-200"
        {...props}
      >
        {options.map((option, index) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          return (
            <option key={typeof option === 'string' ? option : option.value + index} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};