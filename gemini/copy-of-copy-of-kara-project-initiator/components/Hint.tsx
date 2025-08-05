import React from 'react';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface HintProps {
  onGetHint: () => void;
  isLoading: boolean;
  text?: string;
  fieldId: string;
}

export const Hint: React.FC<HintProps> = ({ onGetHint, isLoading, text, fieldId }) => {
  return (
    <div className="mt-2 text-sm">
      <button 
        onClick={onGetHint} 
        disabled={isLoading}
        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-dark-base-content/70 bg-dark-base-300/50 hover:bg-dark-base-300/80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-accent focus:ring-offset-dark-base-200 disabled:opacity-60 disabled:cursor-wait transition-colors"
        aria-controls={`hint-text-${fieldId}`}
        aria-expanded={!!text}
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="w-3.5 h-3.5 animate-spin"/> Thinking...
          </>
        ) : (
          <>
            <LightbulbIcon className="w-3.5 h-3.5"/> 
            {text ? 'Regenerate Hint' : 'Get AI Hint'}
          </>
        )}
      </button>
      {text && !isLoading && (
        <div 
          id={`hint-text-${fieldId}`}
          className="mt-2 p-3 bg-dark-base-100/30 rounded-lg border border-dark-base-300/50 flex items-start gap-3"
        >
          <SparklesIcon className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
          <p className="text-dark-base-content/90">{text}</p>
        </div>
      )}
    </div>
  );
};
