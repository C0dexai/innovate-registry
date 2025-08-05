import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PreviewState } from '../types';
import { Button } from './ui/Button';
import { ICONS } from '../constants';

interface ComponentPreviewProps {
  state: PreviewState;
  onStateChange: (newState: PreviewState) => void;
}

type EditorTab = 'props' | 'css';

const buildIframeContent = (code: string, css: string, props: string): string => {
  const match = code.match(/export (?:(?:const|let|var|function)\s*(\w+)|default\s*(\w+))/);
  const componentName = match ? (match[1] || match[2]) : null;

  if (!componentName) {
    return `<html><body style="padding:1rem;color:#fca5a5;font-family:sans-serif;"><b>Error:</b> Could not find an exported component. Please ensure your component is exported, e.g., <code>export const MyComponent = ...</code></body></html>`;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Component Preview</title>
      <script src="https://esm.sh/react@^19.1.0"><\/script>
      <script src="https://esm.sh/react-dom@^19.1.0/client"><\/script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
      <script src="https://cdn.tailwindcss.com"><\/script>
      <style>
        body { background-color: transparent; color: #e5e7eb; padding: 1rem; font-family: sans-serif; }
        ${css}
      <\/style>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        try {
          ${code}

          const container = document.getElementById('root');
          const root = ReactDOM.createRoot(container);
          const props = JSON.parse(${JSON.stringify(props)});
          root.render(React.createElement(${componentName}, props));
        } catch (e) {
          const container = document.getElementById('root');
          container.innerHTML = \`<div style="color: #fca5a5; font-family: monospace; font-size: 0.875rem; white-space: pre-wrap;"><b>Runtime Error:</b><br />\${e.toString()}</div>\`;
          console.error(e);
        }
      <\/script>
    </body>
    </html>
  `;
};

export const LivePreviewPage: React.FC<ComponentPreviewProps> = ({ state, onStateChange }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('props');
  const [propsError, setPropsError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleUpdatePreview = useCallback(() => {
    try {
      JSON.parse(state.props);
      setPropsError(null);
    } catch (e) {
      setPropsError('Props is not valid JSON.');
      return;
    }

    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildIframeContent(state.code, state.css, state.props);
    }
  }, [state]);

  const handleDownload = useCallback(() => {
    try {
      JSON.parse(state.props);
      const content = buildIframeContent(state.code, state.css, state.props);
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'component-preview.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
       setPropsError('Cannot download: Props is not valid JSON.');
    }
  }, [state]);

  useEffect(() => {
    handleUpdatePreview();
  }, [handleUpdatePreview]);
  
  const EditorTabButton: React.FC<{tab: EditorTab, label: string}> = ({tab, label}) => (
     <button
        onClick={() => setActiveTab(tab)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-gray-400 hover:bg-fuchsia-500/10'}`}
      >
        {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Editor Pane */}
      <div className="flex flex-col bg-black/40 border border-fuchsia-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
             <EditorTabButton tab="props" label="Props (JSON)" />
             <EditorTabButton tab="css" label="Scoped CSS" />
           </div>
           <div className="flex gap-2">
            <Button onClick={handleDownload} variant="secondary" size="sm" leftIcon={React.cloneElement(ICONS.DOWNLOAD, {className: 'h-4 w-4'})}>
              Download HTML
            </Button>
           </div>
        </div>
        
        <div className="editor-content h-40 flex flex-col">
          {activeTab === 'props' ? (
            <textarea
              value={state.props}
              onChange={(e) => onStateChange({ ...state, props: e.target.value })}
              placeholder='{ "children": "Hello World" }'
              className={`w-full flex-grow p-2 bg-gray-900/70 border-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono text-sm resize-none ${propsError ? 'ring-2 ring-red-500' : ''}`}
              aria-label="Component Props"
            />
          ) : (
             <textarea
              value={state.css}
              onChange={(e) => onStateChange({ ...state, css: e.target.value })}
              placeholder=".my-component { background-color: #333; }"
              className="w-full flex-grow p-2 bg-gray-900/70 border-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono text-sm resize-none"
              aria-label="Component CSS"
            />
          )}
        </div>
        {propsError && <p className="text-red-400 text-xs mt-1.5 px-1">{propsError}</p>}
      </div>

      {/* Preview Pane */}
      <div className="flex-grow flex flex-col border-2 border-dashed border-fuchsia-500/20 rounded-lg bg-black/40">
        <iframe
          ref={iframeRef}
          title="Live Component Preview"
          className="w-full h-full rounded-md"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};