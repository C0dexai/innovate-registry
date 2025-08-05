import React, { useState, useEffect } from 'react';
import type { Iteration, PreviewState } from '../types';
import { ICONS } from '../constants';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ResponseRenderer } from './ResponseRenderer';
import { LivePreviewPage } from './LivePreviewPage';

interface InferenceStreamProps {
  currentResponse: string;
  iterations: Iteration[];
  isLoading: boolean;
  onToggleBookmark: (id: string) => void;
  onSendToPreview: (iteration: Iteration) => void;
  previewState: PreviewState | null;
  onClosePreview: () => void;
  onPreviewStateChange: (newState: PreviewState) => void;
}

const IterationLog: React.FC<{ iteration: Iteration, onToggleBookmark: (id: string) => void, onSendToPreview: (iteration: Iteration) => void }> = ({ iteration, onToggleBookmark, onSendToPreview }) => {
  const [bundleCopied, setBundleCopied] = useState(false);

  const handleCopyBundle = () => {
    const bundle = `
--- PROMPT BUNDLE: Iteration ${iteration.id} ---

[System Instruction]
${iteration.settings.systemInstruction}

[Few-Shot Example: User]
${iteration.userExample || 'N/A'}

[Few-Shot Example: Model]
${iteration.modelExample || 'N/A'}

[User Prompt]
${iteration.prompt}

[Variables]
${iteration.variables.length > 0 ? JSON.stringify(iteration.variables, null, 2) : 'N/A'}

[Settings]
Temperature: ${iteration.settings.temperature}
Formality: ${iteration.settings.formality}
Conciseness: ${iteration.settings.conciseness}

--- AI RESPONSE ---
${iteration.response}
--- END BUNDLE ---
    `;
    navigator.clipboard.writeText(bundle.trim());
    setBundleCopied(true);
    setTimeout(() => setBundleCopied(false), 2000);
  };

  return (
    <details className="bg-black/20 rounded-lg border border-fuchsia-500/20 mb-4 overflow-hidden transition-all hover:border-fuchsia-500/50 hover:shadow-lg hover:shadow-fuchsia-900/20">
      <summary className="px-4 py-3 cursor-pointer flex justify-between items-center font-semibold text-gray-300 hover:bg-fuchsia-950/20">
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.preventDefault(); onToggleBookmark(iteration.id); }} 
            className={`p-1.5 rounded-full transition-colors ${iteration.bookmarked ? 'text-lime-400 bg-lime-400/10 hover:bg-lime-400/20' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'}`} 
            aria-label="Bookmark iteration"
          >
            {React.cloneElement(ICONS.BOOKMARK, { className: 'h-4 w-4', fill: iteration.bookmarked ? 'currentColor' : 'none' })}
          </button>
          <span>Version {iteration.id.substring(0, 8)}... - {new Date(iteration.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" onClick={() => onSendToPreview(iteration)} aria-label="Live Preview">
             {React.cloneElement(ICONS.PLAY, { className: 'h-4 w-4' })}
           </Button>
           <Button variant="ghost" size="sm" onClick={handleCopyBundle} aria-label="Copy inference bundle">
              {bundleCopied ? (
                <span className="text-xs text-lime-400">Copied!</span>
              ) : (
                React.cloneElement(ICONS.CLIPBOARD, { className: 'h-4 w-4' })
              )}
            </Button>
            <span className="text-gray-500 transform transition-transform duration-200 open:rotate-180">
              {React.cloneElement(ICONS.CHEVRON_DOWN, {className: 'h-5 w-5'})}
            </span>
        </div>
      </summary>
      <div className="p-4 border-t border-fuchsia-500/20 bg-gray-950/30">
        <div className="mb-4">
          <h4 className="font-semibold text-fuchsia-400 mb-2">Response</h4>
          <div className="bg-black/50 p-3 rounded-md">
            <ResponseRenderer content={iteration.response} />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-fuchsia-400 mb-2">Full Prompt Sent to API</h4>
          <div className="bg-black/50 p-3 rounded-md text-xs text-gray-400 font-mono">
            <pre className="whitespace-pre-wrap">{iteration.fullPrompt}</pre>
            <div className="mt-3 pt-3 border-t border-gray-700 text-gray-500">
              <p>System: {iteration.settings.systemInstruction || 'none'}</p>
              <p>Temp: {iteration.settings.temperature}, Formality: {iteration.settings.formality}, Conciseness: {iteration.settings.conciseness}</p>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
};

type ActiveTab = 'log' | 'bookmarks' | 'preview';

export const InferenceStream: React.FC<InferenceStreamProps> = ({
  currentResponse,
  iterations,
  isLoading,
  onToggleBookmark,
  onSendToPreview,
  previewState,
  onClosePreview,
  onPreviewStateChange,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('log');

  useEffect(() => {
    if (previewState && activeTab !== 'preview') {
      setActiveTab('preview');
    }
  }, [previewState]);

  const handleClosePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('log');
    onClosePreview();
  };

  const bookmarkedIterations = iterations.filter(it => it.bookmarked);
  const displayedIterations = activeTab === 'log'
    ? [...iterations].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [...bookmarkedIterations].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const TabButton: React.FC<{tab: ActiveTab, label: string, count?: number}> = ({tab, label, count}) => (
     <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-all duration-300 ${
          activeTab === tab 
            ? 'bg-fuchsia-500 text-black shadow-[0_0_10px_rgba(217,70,239,0.5)]' 
            : 'text-gray-400 bg-gray-900/50 hover:text-white hover:bg-fuchsia-500/20'
        }`}
        aria-current={activeTab === tab ? 'page' : undefined}
      >
        {label}
        {typeof count !== 'undefined' && <span className={`text-xs rounded-full px-2 py-0.5 ml-2 transition-colors ${activeTab === tab ? 'bg-fuchsia-800/80 text-white' : 'bg-gray-700 text-gray-200'}`}>{count}</span>}
    </button>
  );

  return (
    <div className="p-4 flex flex-col h-full bg-black/20">
      <div className="flex-shrink-0 mb-4">
        <Card title="AI Inference Stream">
          <div className="min-h-[150px] bg-black/50 p-3 rounded-md">
            {currentResponse ? (
               <>
                 <ResponseRenderer content={currentResponse} />
                 {isLoading && <span className="inline-block w-2 h-4 bg-fuchsia-400 animate-pulse ml-1"></span>}
               </>
            ) : isLoading ? (
              <div className="flex items-center text-gray-500">
                {React.cloneElement(ICONS.SPINNER, {className: "mr-2 h-5 w-5"})}
                Awaiting AI response...
              </div>
            ) : (
              <p className="text-gray-500">Output will appear here...</p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex-grow flex flex-col overflow-y-hidden">
        <div className="border-b border-gray-700 mb-3 flex-shrink-0">
          <nav className="flex space-x-2" aria-label="Tabs">
             <TabButton tab="log" label="Iteration Log" count={iterations.length} />
             <TabButton tab="bookmarks" label="Bookmarked" count={bookmarkedIterations.length} />
             {previewState && (
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-2 pl-4 pr-2 py-2 text-sm font-semibold rounded-t-md transition-all duration-300 ${
                        activeTab === 'preview' 
                        ? 'bg-fuchsia-500 text-black shadow-[0_0_10px_rgba(217,70,239,0.5)]' 
                        : 'text-gray-400 bg-gray-900/50 hover:text-white hover:bg-fuchsia-500/20'
                    }`}
                    aria-current={activeTab === 'preview' ? 'page' : undefined}
                >
                    {React.cloneElement(ICONS.PLAY, { className: 'h-4 w-4' })}
                    <span>Live Preview</span>
                    <button onClick={handleClosePreview} className="p-1 rounded-full hover:bg-black/20" aria-label="Close Preview">
                        {React.cloneElement(ICONS.CLOSE, { className: 'h-4 w-4' })}
                    </button>
                </button>
             )}
          </nav>
        </div>
        <div className="overflow-y-auto flex-grow">
          {activeTab === 'preview' && previewState ? (
            <LivePreviewPage state={previewState} onStateChange={onPreviewStateChange} />
          ) : displayedIterations.length > 0 ? (
            displayedIterations.map(it => <IterationLog key={it.id} iteration={it} onToggleBookmark={onToggleBookmark} onSendToPreview={onSendToPreview} />)
          ) : (
            <p className="text-gray-500 text-sm text-center mt-8">
              {activeTab === 'log' ? 'Run a prompt to start logging iterations.' : 'No bookmarked iterations yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};