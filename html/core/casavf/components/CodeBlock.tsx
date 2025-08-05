
import React from 'react';

interface CodeBlockProps {
  content: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content, language }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="bg-slate-900/70 rounded-lg mt-4 border border-slate-700 max-h-72 overflow-y-auto">
      <div className="flex justify-between items-center px-4 py-1.5 bg-slate-800/80 rounded-t-lg border-b border-slate-700">
        <span className="text-xs font-mono text-red-400 uppercase">{language}</span>
        <button 
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          aria-label="Copy code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>
      <pre className="p-4 text-sm text-neutral-300 font-mono whitespace-pre-wrap break-words">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
