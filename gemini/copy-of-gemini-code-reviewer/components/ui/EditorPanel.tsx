import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { OpenFile } from '../../types.ts';
import { SparklesIcon, XMarkIcon, FileIcon } from './Icons.tsx';
import { SUPPORTED_LANGUAGES } from '../../constants.ts';

interface EditorPanelProps {
  openFiles: OpenFile[];
  activeFileId: string | null;
  onFileContentChange: (fileId: string, content: string) => void;
  onCloseFile: (fileId: string) => void;
  onSelectFile: (fileId: string) => void;
  onReview: () => void;
  isLoading: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  openFiles,
  activeFileId,
  onFileContentChange,
  onCloseFile,
  onSelectFile,
  onReview,
  isLoading
}) => {
  const activeFile = openFiles.find(f => f.id === activeFileId);
  const language = activeFile ? (SUPPORTED_LANGUAGES.find(l => l.extension === activeFile.name.split('.').pop())?.value || 'plaintext') : 'plaintext';

  return (
    <div className="bg-slate-800 h-full flex flex-col border-r border-slate-700/50">
      <div className="flex items-center border-b border-slate-700 flex-shrink-0 overflow-x-auto">
        {openFiles.map(file => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`flex items-center gap-2 pl-3 pr-2 py-2.5 cursor-pointer border-r border-slate-700 text-sm flex-shrink-0 ${
              activeFileId === file.id
                ? 'bg-slate-800 text-slate-100'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800/50'
            }`}
            title={file.path}
          >
            <FileIcon className="w-4 h-4" />
            <span className="max-w-[150px] truncate">{file.name}</span>
            {file.isDirty && <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Unsaved changes"></div>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseFile(file.id);
              }}
              className="p-0.5 rounded-full hover:bg-slate-600 ml-1"
              title="Close file"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex-grow relative">
        {activeFile ? (
          <Editor
            height="100%"
            path={activeFile.path}
            language={language}
            value={activeFile.content}
            onChange={(value) => onFileContentChange(activeFile.id, value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              fontFamily: 'Fira Code, monospace',
              fontLigatures: true,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p>Select a file from the explorer to begin editing.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <button
          onClick={onReview}
          disabled={isLoading || !activeFile}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-bold py-3 px-4 rounded-md hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Reviewing...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Review Code
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditorPanel;
