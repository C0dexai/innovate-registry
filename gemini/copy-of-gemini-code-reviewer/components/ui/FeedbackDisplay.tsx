import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import type { OpenFile, Suggestion } from '../../types.ts';
import { parseSuggestions } from '../../utils/parsing.ts';
import { Loader, ExclamationTriangleIcon, LightBulbIcon, CheckIcon, PencilSquareIcon } from './Icons.tsx';

interface FeedbackDisplayProps {
  feedback: string;
  isLoading: boolean;
  error: string | null;
  activeFile?: OpenFile;
  onApplySuggestion: (originalCode: string, suggestedCode: string) => void;
}

const DiffViewer: React.FC<{ originalCode: string; suggestedCode: string; language?: string; }> = ({ originalCode, suggestedCode, language = 'plaintext' }) => {
  return (
    <div className="mt-3 border border-slate-700 rounded-lg overflow-hidden h-64">
        <Editor
            height="100%"
            original={originalCode}
            modified={suggestedCode}
            language={language}
            theme="vs-dark"
            options={{
                readOnly: true,
                renderSideBySide: true,
                scrollBeyondLastLine: false,
                minimap: { enabled: false }
            }}
        />
    </div>
  );
};

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, isLoading, error, activeFile, onApplySuggestion }) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 p-6">
          <Loader className="w-8 h-8"/>
          <p className="text-lg font-medium">Analyzing your code...</p>
          <p className="text-sm">Gemini is thinking hard to provide the best feedback.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400 text-center p-6">
            <ExclamationTriangleIcon className="w-12 h-12" />
          <p className="text-lg font-bold">An Error Occurred</p>
          <p className="bg-red-900/50 border border-red-500/50 rounded-md p-3 font-mono text-sm">{error}</p>
        </div>
      );
    }
    
    if (feedback) {
       const suggestions = parseSuggestions(feedback);
       const activeFileContent = activeFile?.content;
       return (
         <div className="p-4 md:p-6 overflow-y-auto space-y-6">
           {suggestions.map(suggestion => {
             const isApplicable = suggestion.originalCode && suggestion.suggestedCode && activeFileContent?.includes(suggestion.originalCode);
             const isApplied = suggestion.originalCode && suggestion.suggestedCode && !activeFileContent?.includes(suggestion.originalCode) && activeFileContent?.includes(suggestion.suggestedCode);

             return (
                <div key={suggestion.id} className="bg-slate-900/50 border border-slate-700/80 rounded-lg p-4">
                  <h2 className="text-xl font-bold text-violet-400 mb-2">{suggestion.heading}</h2>
                  {suggestion.description && (
                    <div className="prose prose-invert prose-slate max-w-none font-sans text-slate-300 mb-4" dangerouslySetInnerHTML={{ __html: suggestion.description.replace(/\n/g, '<br />') }}></div>
                  )}
                  
                  {suggestion.originalCode && suggestion.suggestedCode ? (
                    <>
                      <DiffViewer originalCode={suggestion.originalCode} suggestedCode={suggestion.suggestedCode} language={suggestion.language} />
                      <div className="mt-4 flex justify-end">
                        {isApplied ? (
                             <button disabled className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-green-600/50 text-green-300 cursor-not-allowed">
                                <CheckIcon className="w-5 h-5" />
                                Applied
                             </button>
                        ) : (
                             <button 
                                onClick={() => onApplySuggestion(suggestion.originalCode!, suggestion.suggestedCode!)}
                                disabled={!isApplicable}
                                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors"
                                title={isApplicable ? "Apply this change to your code" : "Suggestion cannot be applied (code may have changed)"}
                             >
                                <PencilSquareIcon className="w-5 h-5" />
                                Apply Suggestion
                             </button>
                        )}
                      </div>
                    </>
                  ) : suggestion.suggestedCode ? (
                     <pre className="bg-slate-950 border border-slate-700 rounded-md p-4 my-2 font-mono text-sm overflow-x-auto"><code>{suggestion.suggestedCode}</code></pre>
                  ) : null}
                </div>
             )
           })}
         </div>
       );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 p-6">
        <LightBulbIcon className="w-12 h-12" />
        <p className="text-lg font-medium">Feedback will appear here</p>
        <p className="text-sm text-center">Submit your code to get an AI-powered review.</p>
      </div>
    );
};

export default FeedbackDisplay;
