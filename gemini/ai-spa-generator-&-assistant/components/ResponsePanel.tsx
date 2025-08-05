import React, { useState, useEffect } from 'react';
import { AIResponse, ActiveTab } from '../types';
import { SpinnerIcon, PanelRightCloseIcon, ClipboardIcon, CheckIcon, LightbulbIcon } from './icons';
import WelcomeView from './WelcomeView';

interface ResponsePanelProps {
  response: AIResponse;
  hasResponse: boolean;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isLoading: boolean;
  error: string | null;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
  suggestedPrompts: string[];
  onExamplePromptClick: (prompt: string) => void;
  aiHint: string | null;
}

const TabButton: React.FC<{
  label: string;
  tabName: ActiveTab;
  activeTab: ActiveTab;
  onClick: (tab: ActiveTab) => void;
}> = ({ label, tabName, activeTab, onClick }) => {
  const isActive = activeTab === tabName;
  return (
    <button
      onClick={() => onClick(tabName)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
        isActive
          ? 'bg-primary text-dark font-bold shadow-glow-blue'
          : 'bg-neon-input hover:bg-neon-input/50 text-text-main'
      }`}
    >
      {label}
    </button>
  );
};

const ResponsePanel: React.FC<ResponsePanelProps> = ({
  response,
  hasResponse,
  activeTab,
  onTabChange,
  isLoading,
  error,
  onToggleCollapse,
  isCollapsed,
  suggestedPrompts,
  onExamplePromptClick,
  aiHint,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  if (isCollapsed) {
    return null;
  }

  const handleCopy = () => {
    if (!hasResponse) return;
    const contentToCopy = activeTab === 'code' ? response.codeContent : response.previewContent;
    navigator.clipboard.writeText(contentToCopy).then(() => {
        setIsCopied(true);
    }).catch(err => {
        console.error("Failed to copy content: ", err);
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neon-input/80 z-10">
          <SpinnerIcon />
          <span className="mt-2 text-text-main">Generating...</span>
        </div>
      );
    }
    if (error && !isLoading) {
      return <div className="p-4 font-mono text-sm text-red-400 whitespace-pre-wrap">{error}</div>;
    }
    if (!hasResponse) {
      return <WelcomeView onExamplePromptClick={onExamplePromptClick} />;
    }

    // Set a consistent dark background for the iframe content
    const previewDoc = `
      <html>
        <head>
          <style>
            body { 
              background-color: #1a1a1a; 
              color: #e0e0e0; 
              font-family: sans-serif;
              padding: 1rem;
              margin: 0;
            } 
            a { color: #00f6ff; }
            pre { background-color: #0a0a0a; padding: 1em; border-radius: 8px; border: 1px solid rgba(157, 0, 255, 0.2); }
            code { font-family: monospace; font-size: 0.9em; }
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: #0a0a0a; }
            ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; border: 1px solid #0a0a0a; box-shadow: 0 0 2px #ffffff, 0 0 4px #ffffff, 0 0 6px #00f6ff; }
            ::-webkit-scrollbar-thumb:hover { background: #ffffff; }
            html { scrollbar-color: #e0e0e0 #0a0a0a; scrollbar-width: thin; }
          </style>
        </head>
        <body>
          ${response.previewContent}
        </body>
      </html>`;

    return (
      <>
        <iframe
          title="AI Preview"
          srcDoc={previewDoc}
          className={`w-full h-full border-0 bg-neon-input ${activeTab !== 'preview' ? 'hidden' : ''}`}
          sandbox="allow-scripts"
        />
        <pre className={`w-full h-full p-3 font-mono text-sm text-text-input overflow-auto ${activeTab !== 'code' ? 'hidden' : ''}`}>
          <code>
            {response.codeContent}
          </code>
        </pre>
      </>
    );
  };

  return (
    <aside className="bg-neon-panel backdrop-blur-sm border border-neon-border rounded-lg overflow-hidden flex flex-col h-full min-w-0 shadow-lg shadow-neon-purple/10">
      <div className="flex justify-between items-center p-4 border-b border-neon-border flex-shrink-0">
        <h2 className="text-lg font-bold text-primary truncate" style={{ textShadow: '0 0 5px #00f6ff' }}>AI Response</h2>
        <div className="flex items-center gap-4">
            {hasResponse && !error && (
              <div className="flex items-center gap-2 p-1 bg-neon-panel/50 rounded-lg">
                  <TabButton label="Preview" tabName="preview" activeTab={activeTab} onClick={onTabChange} />
                  <TabButton label="Code" tabName="code" activeTab={activeTab} onClick={onTabChange} />
                   <button
                        onClick={handleCopy}
                        title="Copy to Clipboard"
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                            isCopied
                            ? 'bg-neon-green text-dark font-bold shadow-glow-green'
                            : 'bg-neon-input hover:bg-neon-input/50 text-text-main'
                        }`}
                        >
                        {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
              </div>
            )}
            <button onClick={onToggleCollapse} title="Collapse Panel" className="text-text-main hover:text-primary transition-colors">
                <PanelRightCloseIcon />
            </button>
        </div>
      </div>
      <div className="flex-grow m-2.5 bg-neon-input rounded-md relative overflow-auto">
        {renderContent()}
      </div>

       {aiHint && !isLoading && (
        <div className="flex-shrink-0 p-3 mx-2.5 mb-2.5 bg-neon-purple/10 rounded-md border border-neon-purple/30">
            <div className="flex items-start">
                <LightbulbIcon className="w-5 h-5 mr-2.5 text-neon-purple flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-neon-purple">Hint</h4>
                    <p className="text-sm text-text-main/90">{aiHint}</p>
                </div>
            </div>
        </div>
       )}

       {hasResponse && !isLoading && !error && suggestedPrompts.length > 0 && (
          <div className="flex-shrink-0 p-3 border-t border-neon-border">
            <h3 className="text-md font-semibold text-neon-pink mb-2 flex items-center" style={{textShadow: '0 0 4px #ff00ff'}}>
                <LightbulbIcon className="mr-2"/>
                AI Suggestions
            </h3>
            <div className="flex flex-col gap-1.5">
                {suggestedPrompts.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => onExamplePromptClick(p)}
                        className="w-full text-left p-2 bg-neon-panel border border-neon-border rounded-md cursor-pointer text-sm truncate transition-colors duration-200 hover:bg-neon-input/50 hover:border-neon-pink/50"
                        title={p}
                    >
                        {p}
                    </button>
                ))}
            </div>
          </div>
        )}
    </aside>
  );
};

export default ResponsePanel;