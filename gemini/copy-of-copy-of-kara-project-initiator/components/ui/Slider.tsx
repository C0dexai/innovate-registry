
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helpText?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, helpText, className, ...props }) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-dark-base-content/80">
          {label}
        </label>
        <span className="text-sm font-bold text-brand-primary">{props.value}</span>
      </div>
      <input
        type="range"
        className="w-full h-2 bg-dark-base-300 rounded-lg appearance-none cursor-pointer 
                   accent-brand-secondary"
        {...props}
      />
      {helpText && <p className="text-xs text-dark-base-content/60 mt-1">{helpText}</p>}
    </div>
  );
};