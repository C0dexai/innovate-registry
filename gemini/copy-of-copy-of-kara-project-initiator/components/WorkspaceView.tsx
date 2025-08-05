
import React, { useState, useEffect, useRef } from 'react';
import { GithubCommit, ActivityLog } from '../types';
import OrchestrationPanel from './OrchestrationPanel';
import { Button } from './ui/Button';
import { SparklesIcon } from './icons/SparklesIcon';
import { LayoutIcon } from './icons/LayoutIcon';
import { Card } from './ui/Card';

// Monaco editor type declaration
declare const monaco: any;

interface WorkspaceViewProps {
  selectedFile: { path: string; content: string; sha: string } | null;
  commits: GithubCommit[];
  activityLog: ActivityLog[];
  onCommit: (path: string, content: string, message: string, sha:string) => void;
}

const Editor: React.FC<{ file: { content: string, path: string } | null, onContentChange: (content: string) => void }> = ({ file, onContentChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && typeof monaco !== 'undefined') {
      // Ensure the loader is configured
      (window as any).require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }});
      (window as any).require(['vs/editor/editor.main'], () => {
        editorInstance.current = monaco.editor.create(editorRef.current, {
          value: '',
          language: 'javascript',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          }
        });

        // Listen for content changes
        editorInstance.current.onDidChangeModelContent(() => {
          onContentChange(editorInstance.current.getValue());
        });
      });
    }

    return () => {
      if (editorInstance.current) {
        editorInstance.current.dispose();
      }
    };
  }, [onContentChange]);

  useEffect(() => {
    if (editorInstance.current && file) {
      const model = editorInstance.current.getModel();
      if (model && model.getValue() !== file.content) {
        model.setValue(file.content);
      }
      
      // Determine language from file extension
      const extension = file.path.split('.').pop();
      let language = 'plaintext';
      switch(extension) {
        case 'js':
        case 'jsx':
          language = 'javascript';
          break;
        case 'ts':
        case 'tsx':
          language = 'typescript';
          break;
        case 'css':
          language = 'css';
          break;
        case 'html':
          language = 'html';
          break;
        case 'json':
          language = 'json';
          break;
        case 'md':
          language = 'markdown';
          break;
        case 'yml':
        case 'yaml':
            language = 'yaml';
            break;
      }
       monaco.editor.setModelLanguage(model, language);
    }
  }, [file]);

  return <div ref={editorRef} className="h-full w-full" style={{ minHeight: '300px' }}></div>;
};


const WorkspaceView: React.FC<WorkspaceViewProps> = ({ selectedFile, commits, activityLog, onCommit }) => {
    const [editedContent, setEditedContent] = useState<string | null>(null);
    const [commitMessage, setCommitMessage] = useState('');
    
    useEffect(() => {
        if(selectedFile) {
            setEditedContent(selectedFile.content);
            setCommitMessage(`Update ${selectedFile.path.split('/').pop()}`);
        }
    }, [selectedFile]);

    const handleCommitClick = () => {
        if (selectedFile && editedContent !== null && commitMessage) {
            onCommit(selectedFile.path, editedContent, commitMessage, selectedFile.sha);
        }
    };

    const isDirty = selectedFile && editedContent !== selectedFile.content;

    if (!selectedFile) {
        return (
            <Card className="h-full flex flex-col items-center justify-center text-center">
                <LayoutIcon className="w-16 h-16 text-dark-base-300" />
                <h2 className="text-xl font-semibold text-dark-base-content mt-4">Workspace</h2>
                <p className="text-dark-base-content/70 mt-2 max-w-sm">Select a file from the explorer to begin editing and orchestrating tasks.</p>
            </Card>
        );
    }

    return (
        <div className="bg-dark-base-200/50 backdrop-blur-sm border border-dark-base-300/50 rounded-lg shadow-lg h-full flex flex-col">
            {/* Header / Action Bar */}
            <div className="flex-shrink-0 p-3 border-b border-dark-base-300/50 flex items-center justify-between gap-4">
                <h3 className="font-mono text-lg text-brand-primary truncate">{selectedFile.path}</h3>
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={commitMessage}
                        onChange={e => setCommitMessage(e.target.value)}
                        placeholder="Commit message"
                        className="bg-dark-base-200/50 border-dark-base-300/70 rounded-md shadow-sm sm:text-sm p-2 w-64
                                   focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors"
                    />
                    <Button onClick={handleCommitClick} disabled={!isDirty || !commitMessage} className="!py-2 !px-4 text-sm">
                        Commit Changes
                    </Button>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-grow flex flex-col p-3 overflow-hidden" style={{ minHeight: 0 }}>
                {/* Editor */}
                <div className="flex-grow" style={{ minHeight: 0 }}>
                   <Editor file={selectedFile} onContentChange={setEditedContent}/>
                </div>
                
                {/* Orchestration Panel */}
                <div className="flex-shrink-0 h-1/3 max-h-64 mt-3">
                    <OrchestrationPanel commits={commits} activityLog={activityLog} />
                </div>
            </div>
        </div>
    );
};

export default WorkspaceView;
