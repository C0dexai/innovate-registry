import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon, WandIcon, LoadingSpinnerIcon } from './icons';

interface OutputSectionProps {
  prompt: string;
  onBuild: () => void;
  isBuilding: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({ prompt, onBuild, isBuilding }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
  };

  return (
    <div className="glass-card rounded-lg border-[var(--border-color)] h-full flex flex-col">
        <div className="p-4 flex justify-between items-center border-b border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">Generated Prompt</h2>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-background-offset)] hover:bg-[var(--color-background)] text-[var(--color-text)] font-semibold rounded-md shadow-sm transition-colors border border-[var(--border-color)]"
                >
                    {copied ? (
                        <>
                            <CheckIcon className="w-5 h-5 text-[var(--color-success)]" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-5 h-5" />
                            Copy
                        </>
                    )}
                </button>
                 <button
                    onClick={onBuild}
                    disabled={isBuilding}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black font-bold rounded-md shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all transform hover:scale-105 disabled:bg-[var(--color-primary)]/50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isBuilding ? (
                    <>
                        <LoadingSpinnerIcon className="w-5 h-5 animate-spin" />
                        Building...
                    </>
                    ) : (
                    <>
                        <WandIcon className="w-5 h-5" />
                        Build Component
                    </>
                    )}
                </button>
            </div>
      </div>
      <textarea
        readOnly
        value={prompt}
        className="w-full flex-grow bg-[var(--color-background)] p-4 text-[var(--color-text)] font-mono text-sm focus:outline-none resize-none rounded-b-lg selection:bg-[var(--color-primary)] selection:text-black"
        placeholder="Your generated prompt will appear here..."
        style={{ fontFamily: "'Fira Code', monospace" }}
      />
    </div>
  );
};

export default OutputSection;