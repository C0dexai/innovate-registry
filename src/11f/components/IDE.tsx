

import React, { useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { FileType } from '../types';
import type { FileNode, GithubFile, CodeAnalysis, ChatMessage, ContextMenuItem } from '../types';
import { ChevronDownIcon, FileIcon, FolderIcon, LightbulbIcon, MaximizeIcon, FilePlusIcon, FolderPlusIcon, RefreshCwIcon, SendIcon, TerminalIcon, BotIcon, UserIcon, GithubIcon, MessageSquareIcon, CodeXmlIcon, EyeIcon, CopyIcon, GitBranchIcon, FileTextIcon, XIcon, PaperclipIcon, UploadIcon, BugIcon, PlayIcon, CheckCircleIcon, SparklesIcon, UploadCloudIcon, Trash2Icon, PencilIcon, ScanIcon, AjaxIcon, XhrIcon, FetchIcon } from './Icons';
import { geminiService } from '../services/geminiService';
import { LogViewer } from './LogViewer';
import { TerminalConsole } from './TerminalConsole';
import { BuildStepCard } from './BuildStepCard';
import { OpenAIFilesPanel } from './OpenAIFilesPanel';
import { ContextMenu } from './ContextMenu';
import { MonacoLikeEditor } from './MonacoLikeEditor';
import { CodeSnippetModal } from './CodeSnippetModal';
import { EnhanceModal } from './EnhanceModal';


const FileSystemTree: React.FC<{
    node: FileNode;
    onSelect: (id: string) => void;
    level?: number;
    onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
    onDrop: (e: React.DragEvent, targetNode: FileNode) => void;
}> = ({ node, onSelect, level = 0, onContextMenu, onDrop }) => {
    const { activeFileId, moveFileNode } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(level < 2); // Auto-open first few levels
    const [isDropTarget, setIsDropTarget] = useState(false);

    const isDirectory = node.type === FileType.Directory;
    const isHomeRoot = node.path === '/home';
    const canDrag = node.path !== '/' && !isHomeRoot;

    const handleToggle = () => setIsOpen(!isOpen);
    const handleSelect = () => { if (!isDirectory) onSelect(node.id) };

    const handleDragStart = (e: React.DragEvent) => {
        if (!canDrag) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('application/node-id', node.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (isDirectory) {
            setIsDropTarget(true);
        }
    };

    const handleDragLeave = () => setIsDropTarget(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDropTarget(false);
        onDrop(e, node);
    };

    const Icon = isDirectory ? FolderIcon : FileIcon;
    const isActive = activeFileId === node.id;

    const containerClasses = [
        'flex', 'items-center', 'p-1.5', 'rounded-md', 'cursor-pointer', 'group', 'relative',
        isActive ? 'bg-accent text-white' : 'hover:bg-secondary',
        isDropTarget ? 'bg-accent/50 ring-1 ring-accent' : ''
    ].join(' ');

    return (
        <div
            style={{ paddingLeft: `${level * 16}px` }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, node); }}
            draggable={canDrag}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div
                className={containerClasses}
                onClick={isDirectory ? handleToggle : handleSelect}
            >
                {isDirectory && <ChevronDownIcon className={`w-4 h-4 mr-2 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />}
                <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate text-sm">{node.name}</span>
            </div>
            {isDirectory && isOpen && node.children && (
                <div>
                    {node.children.map(child =>
                        <FileSystemTree
                            key={child.id}
                            node={child}
                            onSelect={onSelect}
                            level={level + 1}
                            onContextMenu={onContextMenu}
                            onDrop={onDrop}
                        />
                    )}
                </div>
            )}
        </div>
    );
};


const ChatPanel: React.FC = () => {
    const { messages, sendChatMessage, resetChat, runFileInPreview, dismissMessage } = useContext(AppContext);
    const [input, setInput] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (input.trim() || attachment) {
            sendChatMessage(input, attachment || undefined);
            setInput('');
            setAttachment(null);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        sendChatMessage(suggestion);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };
    
    const renderMessage = (msg: ChatMessage) => {
        switch(msg.type) {
            case 'user':
                return (
                     <div className="flex items-start gap-3 w-full justify-end">
                        <div className="bg-accent text-black rounded-lg p-3 text-sm whitespace-pre-wrap max-w-lg">
                           {msg.text}
                           {msg.attachment && (
                                <div className="mt-2 pt-2 border-t border-cyan-800/50 flex items-center gap-2 text-xs">
                                    <PaperclipIcon className="w-3 h-3"/>
                                    <span>{msg.attachment.name}</span>
                                </div>
                            )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-dim-text" /></div>
                    </div>
                );
            case 'ai_response':
                return (
                    <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-2"><BotIcon className="w-5 h-5 text-black" /></div>
                        <div className="flex-grow max-w-lg">
                            <div className="group relative bg-secondary rounded-lg">
                                <pre className="p-3 text-sm text-bright-text whitespace-pre-wrap font-sans overflow-x-auto">
                                    <code>{msg.text}</code>
                                </pre>
                                <button onClick={() => handleCopy(msg.text)} className="absolute top-2 right-2 p-1 rounded-md bg-primary text-dim-text opacity-0 group-hover:opacity-100 transition-opacity" title="Copy">
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            </div>
                            {msg.suggestions && (
                                <div className="mt-3 pt-2 flex flex-wrap gap-2">
                                    {msg.suggestions.map((s, i) => (
                                        <button key={i} onClick={() => handleSuggestionClick(s)} className="text-xs bg-slate-700 hover:bg-slate-600 text-bright-text py-1 px-2 rounded-full">{s}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'orchestration_status':
                 return (
                    <div className="flex items-center gap-3 text-sm text-dim-text py-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.agentName === 'System' ? 'bg-slate-500' : 'bg-highlight'}`}>
                            <BotIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-highlight">{msg.agentName}</span>
                            <span className="ml-2">{msg.text}</span>
                        </div>
                    </div>
                );
            case 'orchestration_handoff':
                 return (
                    <div className="flex items-center gap-3 text-sm text-accent py-2 my-2 border-y border-dashed border-secondary">
                        <GitBranchIcon className="w-6 h-6 flex-shrink-0" />
                        <div>
                           <span>Handoff from <span className="font-bold">{msg.fromAgent}</span> to <span className="font-bold">{msg.toAgent}</span>.</span>
                        </div>
                    </div>
                );
            case 'file_analysis':
                return (
                    <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-2"><BugIcon className="w-5 h-5 text-highlight" /></div>
                        <div className="flex-grow max-w-2xl bg-secondary rounded-lg p-4">
                            <h4 className="font-bold text-bright-text">Code Analysis: <span className="text-accent font-mono">{msg.fileName}</span></h4>
                            <p className="text-sm text-dim-text mt-2 mb-3 whitespace-pre-wrap">{msg.analysis.summary}</p>
                            
                            <details className="text-sm">
                                <summary className="cursor-pointer text-dim-text hover:text-bright-text">View Suggestions</summary>
                                <ul className="mt-2 space-y-2 list-disc list-inside text-bright-text pl-2">
                                    {msg.analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </details>
                            
                            <div className="mt-4 pt-3 border-t border-slate-600 flex items-center gap-3">
                                <button
                                    onClick={() => runFileInPreview(msg.filePath)}
                                    className="flex-1 text-sm bg-accent text-black font-semibold py-1.5 px-3 rounded-md hover:bg-accent/80 flex items-center justify-center gap-2 transition-colors">
                                    <PlayIcon className="w-4 h-4"/> Run Preview
                                </button>
                                <button 
                                    onClick={() => dismissMessage(msg.id)}
                                    className="flex-1 text-sm bg-slate-600 text-bright-text py-1.5 px-3 rounded-md hover:bg-slate-500 flex items-center justify-center gap-2 transition-colors">
                                    <CheckCircleIcon className="w-4 h-4"/> Acknowledge
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'build_step':
                return <BuildStepCard message={msg} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-primary flex flex-col h-full p-2">
            <div className="flex-shrink-0 bg-primary p-2 border-b border-secondary flex items-center justify-between">
                <h2 className="text-lg font-bold text-bright-text">Chat</h2>
                <button onClick={resetChat} className="p-1 text-dim-text hover:text-bright-text" title="New Chat">
                    <RefreshCwIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {messages.map(msg => <div key={msg.id}>{renderMessage(msg)}</div>)}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-secondary flex-shrink-0">
                 {attachment && (
                    <div className="mb-2 p-2 bg-secondary rounded-md flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <PaperclipIcon className="w-4 h-4 text-dim-text flex-shrink-0" />
                            <span className="text-bright-text truncate">{attachment.name}</span>
                        </div>
                        <button onClick={() => setAttachment(null)} className="p-1 text-dim-text hover:text-bright-text flex-shrink-0">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="relative">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={handleAttachClick} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-dim-text hover:text-bright-text" title="Attach file">
                       <PaperclipIcon className="w-5 h-5" />
                   </button>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Gemini to build, refactor, or analyze..."
                        className="w-full bg-secondary rounded-full py-2 pl-12 pr-12 text-bright-text focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-accent hover:opacity-80 transition-opacity">
                        <SendIcon className="w-4 h-4 text-black" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const GitHubPanel: React.FC = () => {
    const { githubRepos, commitToGithub, githubService } = useContext(AppContext);
    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [commitMessage, setCommitMessage] = useState<string>('feat: commit from Gemini Studio');
    const [isCommitting, setIsCommitting] = useState(false);
    const [commitResult, setCommitResult] = useState<string>('');
    
    // New state for repo browser
    const [repoContents, setRepoContents] = useState<GithubFile[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    const [isLoadingContents, setIsLoadingContents] = useState(false);
    const [pathHistory, setPathHistory] = useState<string[]>([]);
    const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);

    useEffect(() => {
        if (githubRepos.length > 0 && !selectedRepo) {
            setSelectedRepo(githubRepos[0].name);
        }
    }, [githubRepos, selectedRepo]);

    useEffect(() => {
        if (selectedRepo) {
            const fetchContents = async () => {
                setIsLoadingContents(true);
                setSelectedFileContent(null);
                try {
                    const contents = await githubService.getRepoContents(selectedRepo, currentPath);
                    setRepoContents(contents);
                } catch (error) {
                    console.error("Failed to fetch repo contents:", error);
                    setRepoContents([]);
                }
                setIsLoadingContents(false);
            };
            fetchContents();
        }
    }, [selectedRepo, currentPath, githubService]);
    
    const handleCommit = async () => {
        if (!selectedRepo || !commitMessage) return;
        setIsCommitting(true);
        setCommitResult('');
        try {
            const result = await commitToGithub(selectedRepo, commitMessage);
            setCommitResult(result);
        } catch (error) {
            setCommitResult(`Error: ${(error as Error).message}`);
        } finally {
            setIsCommitting(false);
        }
    };

    const handleFileClick = async (file: GithubFile) => {
        if (file.type === 'dir') {
            setPathHistory(prev => [...prev, currentPath]);
            setCurrentPath(file.path);
        } else {
            setIsLoadingContents(true);
            setSelectedFileContent(null);
            try {
                const content = await githubService.getRepoFileContent(file.sha, selectedRepo);
                setSelectedFileContent(content);
            } catch (error) {
                console.error("Failed to fetch file content:", error);
                setSelectedFileContent("Error loading file content.");
            } finally {
                setIsLoadingContents(false);
            }
        }
    };
    
    const handleGoBack = () => {
        const lastPath = pathHistory.pop() || '';
        setCurrentPath(lastPath);
        setPathHistory([...pathHistory]);
        setSelectedFileContent(null);
    }
    
    const handleRepoChange = (repoName: string) => {
        setSelectedRepo(repoName);
        setCurrentPath('');
        setPathHistory([]);
        setSelectedFileContent(null);
    }

    return (
        <div className="p-4 space-y-4 text-sm h-full flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex items-center gap-2 text-dim-text">
                    <GithubIcon className="w-5 h-5 text-bright-text" />
                    <span>Connected as <strong>C0dexai</strong></span>
                </div>
                <div className="space-y-1 mt-4">
                    <label htmlFor="repo-select" className="font-semibold text-dim-text">Repository</label>
                    <select id="repo-select" value={selectedRepo} onChange={e => handleRepoChange(e.target.value)} className="w-full bg-secondary p-2 rounded-md border border-slate-600 focus:ring-accent focus:border-accent text-bright-text" disabled={githubRepos.length === 0 || isCommitting}>
                        {githubRepos.length === 0 && <option>Loading...</option>}
                        {githubRepos.map(repo => (<option key={repo.id} value={repo.name}>{repo.full_name}</option>))}
                    </select>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto border-t border-secondary pt-4">
                <h4 className="font-bold text-dim-text mb-2">Remote Repository Explorer</h4>
                 {currentPath && <button onClick={handleGoBack} className="text-xs text-accent mb-2">Back</button>}
                {isLoadingContents ? <p className="text-dim-text">Loading...</p> : (
                    selectedFileContent !== null ? (
                        <pre className="text-xs bg-black p-2 rounded overflow-auto"><code>{selectedFileContent}</code></pre>
                    ) : (
                        <div className="space-y-1">
                            {repoContents.map(file => (
                                <div key={file.sha} onClick={() => handleFileClick(file)} className="flex items-center gap-2 p-1 rounded hover:bg-secondary cursor-pointer">
                                    {file.type === 'dir' ? <FolderIcon className="w-4 h-4 text-accent" /> : <FileIcon className="w-4 h-4 text-dim-text" />}
                                    <span>{file.name}</span>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <div className="flex-shrink-0 border-t border-secondary pt-4">
                <div className="space-y-1">
                    <label htmlFor="commit-message" className="font-semibold text-dim-text">Commit Message</label>
                    <input id="commit-message" type="text" value={commitMessage} onChange={e => setCommitMessage(e.target.value)} className="w-full bg-secondary p-2 rounded-md border border-slate-600" disabled={isCommitting} />
                </div>
                <button onClick={handleCommit} disabled={isCommitting || !selectedRepo} className="w-full mt-2 bg-accent text-black font-semibold py-2 px-4 rounded-lg hover:opacity-80 disabled:bg-slate-600 disabled:text-dim-text flex items-center justify-center gap-2">
                    <GithubIcon className="w-4 h-4" />
                    {isCommitting ? 'Committing...' : 'Commit & Push to Main Branch'}
                </button>
                {commitResult && <div className="p-3 bg-secondary rounded-md text-dim-text mt-2"><p className="font-mono text-xs whitespace-pre-wrap">{commitResult}</p></div>}
            </div>
        </div>
    );
};

const SpaManagerPanel: React.FC = () => {
    const { files, setActiveFileId, refreshPreview, findFileByPath } = useContext(AppContext);
    const [isBuilding, setIsBuilding] = useState(false);
    const [buildLogs, setBuildLogs] = useState<string[]>([]);

    const isSpaProject = useMemo(() => {
        return !!findFileByPath('/vite.config.ts');
    }, [files, findFileByPath]);

    const handleQuickOpenFile = (path: string) => {
        const file = findFileByPath(path);
        if (file) {
            setActiveFileId(file.id);
        } else {
            alert(`File not found: ${path}`);
        }
    };

    const handleBuild = () => {
        if (!isSpaProject) return;
        setIsBuilding(true);
        setBuildLogs([]);

        const addLog = (log: string) => {
            setBuildLogs(prev => [...prev, log]);
        };

        addLog(`> npm install`);
        setTimeout(() => addLog('up to date, audited 148 packages in 2s'), 1000);
        setTimeout(() => addLog('\n> npm run build'), 1500);
        setTimeout(() => addLog('vite v5.3.1 building for production...'), 2000);
        setTimeout(() => addLog('✓ 34 modules transformed.'), 3000);
        setTimeout(() => {
            addLog('\nBuild successful! Launching preview...');
            refreshPreview();
            setIsBuilding(false);
        }, 3500);
    };

    return (
        <div className="p-4 space-y-4 text-sm h-full flex flex-col">
            <div className="flex-shrink-0">
                <h4 className="font-bold text-dim-text mb-2">SPA Project Manager</h4>
                {isSpaProject ? (
                    <div className="p-3 bg-secondary rounded-md text-bright-text text-xs space-y-2">
                        <p className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-neon-green" /> Vite project detected.</p>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => handleQuickOpenFile('/vite.config.ts')} className="text-xs bg-slate-700 hover:bg-slate-600 p-1 px-2 rounded">vite.config.ts</button>
                            <button onClick={() => handleQuickOpenFile('/src/App.tsx')} className="text-xs bg-slate-700 hover:bg-slate-600 p-1 px-2 rounded">App.tsx</button>
                            <button onClick={() => handleQuickOpenFile('/src/index.css')} className="text-xs bg-slate-700 hover:bg-slate-600 p-1 px-2 rounded">index.css</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 bg-secondary rounded-md text-dim-text text-xs">
                        <p>No SPA project (vite.config.ts) found in the workspace root.</p>
                        <p className="mt-1">Try asking the AI: "Start a new SPA build session"</p>
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 flex gap-2">
                <button
                    onClick={handleBuild}
                    disabled={!isSpaProject || isBuilding}
                    className="flex-1 bg-accent text-black font-semibold py-2 px-4 rounded-lg hover:opacity-80 disabled:bg-slate-600 disabled:text-dim-text flex items-center justify-center gap-2"
                >
                    <PlayIcon className="w-4 h-4"/>
                    {isBuilding ? 'Building...' : 'Build Project'}
                </button>
                <button
                    onClick={refreshPreview}
                    disabled={!isSpaProject}
                    className="flex-1 bg-slate-600 text-bright-text font-semibold py-2 px-4 rounded-lg hover:bg-slate-500 disabled:bg-slate-700 disabled:text-dim-text flex items-center justify-center gap-2"
                >
                    <RefreshCwIcon className="w-4 h-4"/>
                    Refresh Preview
                </button>
            </div>
            <div className="flex-grow bg-black rounded-lg overflow-y-auto p-2" style={{ minHeight: '100px' }}>
                <pre className="text-xs whitespace-pre-wrap font-mono">
                    {buildLogs.join('\n')}
                    {isBuilding && <div className="inline-block w-2 h-2 rounded-full bg-neon-green animate-ping ml-2"></div>}
                </pre>
            </div>
        </div>
    );
};

const IDE: React.FC = () => {
    const { 
        files, activeFile, activeFileId, setActiveFileId, createNewNode, updateActiveFileContent, refreshPreview, previewKey, previewOverride,
        deleteFileNode, renameFileNode, duplicateFileNode, moveFileNode, applyCodeSuggestion, findFileByPath, sendChatMessage
    } = useContext(AppContext);
    
    const [leftPanelWidth, setLeftPanelWidth] = useState(250);
    const [rightPanelWidth, setRightPanelWidth] = useState(400);
    const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
    const [activeRightTab, setActiveRightTab] = useState<'chat' | 'github' | 'spa' | 'files'>('chat');
    const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'logs'>('terminal');

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: FileNode } | null>(null);
    const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
    const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
    const [snippetTech, setSnippetTech] = useState<'ajax' | 'xhr' | 'fetch' | null>(null);

    const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    const handleCloseContextMenu = () => setContextMenu(null);

    const handleDrop = (e: React.DragEvent, targetNode: FileNode) => {
        if (targetNode.type === FileType.Directory) {
            const draggedNodeId = e.dataTransfer.getData('application/node-id');
            if (draggedNodeId && draggedNodeId !== targetNode.id) {
                moveFileNode(draggedNodeId, targetNode.id);
            }
        }
    };

    const contextMenuItems = useMemo((): ContextMenuItem[] => {
        if (!contextMenu) return [];
        const { node } = contextMenu;
        
        const items: ContextMenuItem[] = [];

        if (node.type === FileType.Directory) {
            items.push(
                { label: 'New File', action: () => createNewNode(FileType.File, node.path), icon: <FilePlusIcon className="w-4 h-4" /> },
                { label: 'New Folder', action: () => createNewNode(FileType.Directory, node.path), icon: <FolderPlusIcon className="w-4 h-4" /> }
            );
        }

        if (node.path !== '/' && node.path !== '/home') {
             items.push(
                { label: 'Rename', action: () => { const newName = prompt('Enter new name:', node.name); if (newName) renameFileNode(node.id, newName); }, icon: <PencilIcon className="w-4 h-4" /> },
                { label: 'Duplicate', action: () => duplicateFileNode(node.id), icon: <CopyIcon className="w-4 h-4" /> },
                { label: 'Delete', action: () => { if (window.confirm(`Delete ${node.name}?`)) deleteFileNode(node.id); }, icon: <Trash2Icon className="w-4 h-4" /> }
            );
        }

        if (node.type === FileType.File) {
            items.push(
                { label: 'Analyze with Gemini', action: () => {
                    const file = findFileByPath(node.path);
                    if (file?.content) {
                        sendChatMessage(`Analyze the code in my file: ${file.path}\n\n\`\`\`\n${file.content}\n\`\`\``);
                    }
                }, icon: <ScanIcon className="w-4 h-4" /> }
            );
        }

        return items;
    }, [contextMenu, createNewNode, renameFileNode, duplicateFileNode, deleteFileNode, findFileByPath, sendChatMessage]);

    const handleEnhance = async (description: string) => {
        if (activeFile && activeFile.content) {
            await applyCodeSuggestion(description);
        }
    };

    const handleInjectSnippet = (code: string) => {
        if (activeFile) {
            const currentContent = activeFile.content || '';
            updateActiveFileContent(currentContent + '\n\n' + code);
        }
        setIsSnippetModalOpen(false);
    };

    const openSnippetModal = (tech: 'ajax' | 'xhr' | 'fetch') => {
        setSnippetTech(tech);
        setIsSnippetModalOpen(true);
    };
    
    return (
        <div className="flex h-full w-full bg-primary text-bright-text">
            {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenuItems} onClose={handleCloseContextMenu} />}
            <EnhanceModal isOpen={isEnhanceModalOpen} onClose={() => setIsEnhanceModalOpen(false)} onEnhance={handleEnhance} />
            <CodeSnippetModal isOpen={isSnippetModalOpen} technology={snippetTech} onClose={() => setIsSnippetModalOpen(false)} onInject={handleInjectSnippet} />

            {/* Left Panel: File System */}
            <div className="flex-shrink-0 bg-primary border-r border-secondary p-2 flex flex-col" style={{ width: leftPanelWidth }}>
                <div className="flex items-center justify-between p-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider">Explorer</h3>
                    <div className="flex gap-1">
                        <button onClick={() => createNewNode(FileType.File, '/home')} className="p-1 hover:bg-secondary rounded" title="New File"><FilePlusIcon className="w-4 h-4" /></button>
                        <button onClick={() => createNewNode(FileType.Directory, '/home')} className="p-1 hover:bg-secondary rounded" title="New Folder"><FolderPlusIcon className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <FileSystemTree node={files} onSelect={setActiveFileId} onContextMenu={handleContextMenu} onDrop={handleDrop} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col">
                {/* Editor/Preview Panel */}
                <div className="flex-grow flex flex-col overflow-hidden" style={{ height: `calc(100% - ${bottomPanelHeight}px)` }}>
                    <div className="flex-1 grid grid-cols-2 gap-px bg-secondary">
                        <div className="bg-primary flex flex-col">
                            <div className="flex items-center justify-between bg-secondary p-2 text-sm">
                                {activeFile ? (
                                    <div className="flex items-center gap-2">
                                        <FileIcon className="w-4 h-4" />
                                        <span>{activeFile.path}</span>
                                    </div>
                                ) : (
                                    <span>Select a file to edit</span>
                                )}
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openSnippetModal('ajax')} className="p-1 hover:bg-primary rounded" title="Insert Ajax Snippet"><AjaxIcon className="w-4 h-4" /></button>
                                    <button onClick={() => openSnippetModal('xhr')} className="p-1 hover:bg-primary rounded" title="Insert XHR Snippet"><XhrIcon className="w-4 h-4" /></button>
                                    <button onClick={() => openSnippetModal('fetch')} className="p-1 hover:bg-primary rounded" title="Insert Fetch Snippet"><FetchIcon className="w-4 h-4" /></button>
                                    <button onClick={() => setIsEnhanceModalOpen(true)} disabled={!activeFile} className="p-1 hover:bg-primary rounded disabled:opacity-50" title="Enhance with AI"><SparklesIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="flex-grow relative bg-[#1e1e1e]">
                                {activeFile && activeFile.type === FileType.File ? (
                                    <MonacoLikeEditor
                                        value={activeFile.content || ''}
                                        onChange={updateActiveFileContent}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-dim-text">Select a file to begin editing.</div>
                                )}
                            </div>
                        </div>
                        <div className="bg-primary flex flex-col">
                            <div className="flex items-center justify-between bg-secondary p-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <EyeIcon className="w-4 h-4" />
                                    <span>Preview</span>
                                </div>
                                <button onClick={refreshPreview} className="p-1 hover:bg-primary rounded" title="Refresh Preview"><RefreshCwIcon className="w-4 h-4" /></button>
                            </div>
                             <div className="flex-grow bg-white">
                                <iframe
                                    key={previewKey}
                                    srcDoc={previewOverride || (activeFile?.name.endsWith('.html') ? activeFile?.content : 'Preview only available for HTML files. Or use the SPA Manager for projects.')}
                                    title="Preview"
                                    sandbox="allow-scripts allow-same-origin"
                                    className="w-full h-full border-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Panel: Terminal/Logs */}
                <div className="flex-shrink-0 bg-primary border-t border-secondary" style={{ height: bottomPanelHeight }}>
                    <div className="flex border-b border-secondary">
                        <button onClick={() => setActiveBottomTab('terminal')} className={`px-4 py-2 text-xs flex items-center gap-2 ${activeBottomTab === 'terminal' ? 'bg-secondary' : 'hover:bg-secondary'}`}>
                            <TerminalIcon className="w-4 h-4" /> Terminal
                        </button>
                        <button onClick={() => setActiveBottomTab('logs')} className={`px-4 py-2 text-xs flex items-center gap-2 ${activeBottomTab === 'logs' ? 'bg-secondary' : 'hover:bg-secondary'}`}>
                            <MessageSquareIcon className="w-4 h-4" /> Logs
                        </button>
                    </div>
                    <div className="h-[calc(100%-33px)] w-full">
                        {activeBottomTab === 'terminal' && <TerminalConsole />}
                        {activeBottomTab === 'logs' && <LogViewer />}
                    </div>
                </div>
            </div>

            {/* Right Panel: Chat/GitHub */}
            <div className="flex-shrink-0 bg-primary border-l border-secondary" style={{ width: rightPanelWidth }}>
                <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 flex border-b border-secondary">
                        <button onClick={() => setActiveRightTab('chat')} className={`flex-1 flex justify-center items-center gap-2 p-2 text-xs ${activeRightTab === 'chat' ? 'bg-secondary' : 'hover:bg-secondary'}`}>
                            <MessageSquareIcon className="w-4 h-4" /> Chat
                        </button>
                        <button onClick={() => setActiveRightTab('github')} className={`flex-1 flex justify-center items-center gap-2 p-2 text-xs ${activeRightTab === 'github' ? 'bg-secondary' : 'hover:bg-secondary'}`}>
                            <GithubIcon className="w-4 h-4" /> GitHub
                        </button>
                        <button onClick={() => setActiveRightTab('spa')} className={`flex-1 flex justify-center items-center gap-2 p-2 text-xs ${activeRightTab === 'spa' ? 'bg-secondary' : 'hover:bg-secondary'}`}>
                            <CodeXmlIcon className="w-4 h-4" /> SPA
                        </button>
                         <button onClick={() => setActiveRightTab('files')} className={`flex-1 flex justify-center items-center gap-2 p-2 text-xs ${activeRightTab === 'files' ? 'bg-secondary' : 'hover:bg-secondary'}`}>
                            <UploadCloudIcon className="w-4 h-4" /> Cloud
                        </button>
                    </div>
                    <div className="flex-grow overflow-auto">
                        {activeRightTab === 'chat' && <ChatPanel />}
                        {activeRightTab === 'github' && <GitHubPanel />}
                        {activeRightTab === 'spa' && <SpaManagerPanel />}
                        {activeRightTab === 'files' && <OpenAIFilesPanel />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IDE;
