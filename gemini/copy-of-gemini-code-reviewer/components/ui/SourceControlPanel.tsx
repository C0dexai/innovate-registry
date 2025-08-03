import React, { useState, useMemo, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { OpenFile } from '../../types.ts';
import { FileIcon, Loader, CodeBracketIcon } from './Icons.tsx';

interface SourceControlPanelProps {
    openFiles: OpenFile[];
    onCommitFile: (path: string, content: string, message: string) => void;
    activeFile: OpenFile | undefined;
}

const SourceControlPanel: React.FC<SourceControlPanelProps> = ({ openFiles, onCommitFile, activeFile }) => {
    const [commitMessage, setCommitMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<OpenFile | null>(null);
    const [originalContent, setOriginalContent] = useState<string | null>(null);
    const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);
    
    // Lazy getter for githubService to avoid circular dependency issues at module load time
    const getGithubService = () => import('../../services/githubService.ts');

    const dirtyFiles = useMemo(() => openFiles.filter(f => f.isDirty), [openFiles]);

    useEffect(() => {
        // If a file is active and dirty, select it automatically
        if (activeFile?.isDirty) {
            setSelectedFile(activeFile);
        } else if (!selectedFile && dirtyFiles.length > 0) {
            // Otherwise, select the first dirty file
            setSelectedFile(dirtyFiles[0]);
        } else if (selectedFile && !dirtyFiles.some(f => f.id === selectedFile.id)) {
            // If the selected file is no longer dirty, deselect it or pick another one
            setSelectedFile(dirtyFiles.length > 0 ? dirtyFiles[0] : null);
        }
    }, [dirtyFiles, activeFile, selectedFile]);

    useEffect(() => {
        if (selectedFile) {
            setIsLoadingOriginal(true);
            setOriginalContent(null);
            getGithubService().then(service => {
                service.getFileContent(selectedFile.path).then(data => {
                    if (data) {
                        setOriginalContent(data.content);
                    }
                }).finally(() => {
                    setIsLoadingOriginal(false);
                });
            });
        }
    }, [selectedFile]);

    const handleCommit = () => {
        if (!commitMessage.trim() || dirtyFiles.length === 0) return;
        
        // For simplicity, this commits all dirty files with one message.
        // A more advanced implementation would allow staging individual files.
        dirtyFiles.forEach(file => {
            onCommitFile(file.path, file.content, commitMessage);
        });

        setCommitMessage('');
        setSelectedFile(null);
    };

    return (
        <div className="flex h-full">
            {/* Left side: Changes list and commit box */}
            <div className="w-1/3 min-w-[250px] flex flex-col border-r border-slate-700">
                <div className="p-4 flex-grow overflow-y-auto">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Changes</h3>
                    {dirtyFiles.length > 0 ? (
                        <ul>
                            {dirtyFiles.map(file => (
                                <li key={file.id} 
                                    onClick={() => setSelectedFile(file)}
                                    className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md ${selectedFile?.id === file.id ? 'bg-violet-900/50' : 'hover:bg-slate-700/50'}`}>
                                    <FileIcon className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-300 truncate">{file.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500 px-2">No changes detected.</p>
                    )}
                </div>
                <div className="p-4 border-t border-slate-700">
                    <textarea
                        value={commitMessage}
                        onChange={e => setCommitMessage(e.target.value)}
                        placeholder="Commit message..."
                        rows={3}
                        className="w-full bg-slate-900/70 text-slate-300 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-sans"
                    />
                    <button
                        onClick={handleCommit}
                        disabled={!commitMessage.trim() || dirtyFiles.length === 0}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-violet-600 text-white font-bold py-2 px-4 rounded-md hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Commit All Changes
                    </button>
                </div>
            </div>

            {/* Right side: Diff viewer */}
            <div className="flex-grow bg-slate-800">
                {selectedFile ? (
                    isLoadingOriginal || originalContent === null ? (
                        <div className="flex items-center justify-center h-full"><Loader /></div>
                    ) : (
                        <Editor
                            height="100%"
                            original={originalContent}
                            modified={selectedFile.content}
                            language="plaintext" // Can be enhanced to detect language
                            theme="vs-dark"
                            options={{
                                readOnly: true,
                                renderSideBySide: true,
                                scrollBeyondLastLine: false,
                            }}
                        />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <CodeBracketIcon className="w-12 h-12 mb-4" />
                        <h3 className="text-lg font-semibold">No File Selected</h3>
                        <p className="text-sm">Select a changed file to view the diff.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SourceControlPanel;
