import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { generateComponent } from './services/geminiService';
import * as github from './services/githubService';
import type { GitHubFile } from './services/githubService';


// --- TYPES ---
type PanelSizes = [number, number, number];
interface SelectedFile extends GitHubFile {
  content?: string;
}
interface FileNode extends GitHubFile {
    children?: FileNode[];
    isOpen?: boolean;
}

// --- ICONS ---
const MagicWandIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path><path d="M12 3v18"></path><path d="m19 21-7-7-7 7"></path><path d="m5 3-3-3"></path><path d="m19 21 3 3"></path><path d="m5 3 3 3"></path><path d="m19 21-3-3"></path><path d="M12 3h.01"></path><path d="M12 19h.01"></path></svg>);
const LogoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-400"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>);
const FolderIcon = ({ isOpen }: { isOpen?: boolean }) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={isOpen ? "M20 12.5a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h15.5a.5.5 0 0 1 .5.5z" : "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"}></path></svg>);
const FileIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>);
const GithubIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path></svg>);


// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode, onRenderError: (error: Error) => void }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onRenderError(error);
    console.error("Dynamic component render error:", error, errorInfo);
  }
  componentDidUpdate(prevProps: any) {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (<div className="p-4 flex flex-col items-center justify-center h-full"><p className="text-red-400 font-semibold">Component Render Error</p><p className="text-xs text-gray-400 mt-1">Check the browser console for details.</p></div>);
    }
    return this.props.children;
  }
}

// --- SUB-COMPONENTS ---
const DynamicComponentRenderer = ({ code, onRenderError }: { code: string; onRenderError: (error: Error) => void }) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [transpilationError, setTranspilationError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!code) {
            setComponent(null);
            setTranspilationError(null);
            return;
        }
        try {
            // @ts-ignore
            const transformedCode = window.Babel.transform(code, { presets: ["react"] }).code;
            const cleanCode = transformedCode.replace(/^'use strict';\n?/, '');
            const componentNameMatch = cleanCode.match(/^(?:const|let|var)\s+([A-Z][A-Za-z0-9_]*)\s*=/);
            const functionBody = componentNameMatch ? `${cleanCode}\nreturn ${componentNameMatch[1]};` : `return (${cleanCode})`;
            const componentFunction = new Function('React', 'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', functionBody);
            const NewComponent = componentFunction(React, React.useState, React.useEffect, React.useCallback, React.useMemo, React.useRef);
            setComponent(() => NewComponent);
            setTranspilationError(null);
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Babel/Function execution error:", e);
                setTranspilationError(e.message);
            }
            setComponent(null);
        }
    }, [code]);

    if (transpilationError) return <div className="p-4 text-red-400 font-mono text-xs"><p className="font-bold mb-2">Transpilation Failed:</p>{transpilationError}</div>;
    if (Component) return <ErrorBoundary onRenderError={onRenderError}><Component /></ErrorBoundary>;
    return null;
};

const CliLoader = () => (
    <div className="p-4 font-mono text-sm text-gray-400">
      <div>&gt; Running gemini build...</div>
      <div className="flex items-center">
        &gt; Generating component...<div className="w-2 h-4 bg-green-400 ml-2 animate-pulse"></div>
      </div>
    </div>
);

const FileTree = ({ node, onSelectFile, onToggleDir, level = 0 }: { node: FileNode, onSelectFile: (file: GitHubFile) => void, onToggleDir: (dir: FileNode) => void, level?: number }) => {
    const isDir = node.type === 'dir';
    const paddingLeft = `${level * 1.25}rem`;

    const sortedChildren = node.children?.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
    });

    return (
        <div>
            <div
                onClick={() => (isDir ? onToggleDir(node) : onSelectFile(node))}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-700 rounded-md text-sm"
                style={{ paddingLeft }}
            >
                {isDir ? <FolderIcon isOpen={node.isOpen} /> : <FileIcon />}
                <span>{node.name}</span>
            </div>
            {isDir && node.isOpen && sortedChildren?.map(child => (
                <FileTree key={child.path} node={child} onSelectFile={onSelectFile} onToggleDir={onToggleDir} level={level + 1} />
            ))}
        </div>
    );
};

export const App = () => {
    // --- STATE ---
    const [prompt, setPrompt] = useState<string>("A login form with email, password, and a 'Forgot Password' link.");
    const [editorContent, setEditorContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);
    
    // GitHub State
    const [githubToken, setGithubToken] = useState<string>('');
    const [repoId, setRepoId] = useState<string>('google-gemini/web-scaffold-v0');
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [fileTree, setFileTree] = useState<FileNode | null>(null);
    const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Resizable panels state
    const [panelSizes, setPanelSizes] = useState<PanelSizes>([25, 50, 25]);
    const resizingRef = useRef<{ isResizing: boolean, handleIndex: number | null }>({ isResizing: false, handleIndex: null });
    const containerRef = useRef<HTMLDivElement>(null);

    // --- EFFECTS and CALLBACKS ---
    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;
        setIsLoading(true);
        setError(null);
        setRenderError(null);
        try {
            const code = await generateComponent(prompt);
            setEditorContent(code);
            setSelectedFile(null); // Deselect file after generating new content
        } catch (e: unknown) {
            if (e instanceof Error) setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);

    const handleConnect = useCallback(async () => {
        if (!githubToken || !repoId) {
            setError("Please provide a GitHub Token and a repository ID (e.g., owner/repo).");
            return;
        }
        setIsConnecting(true);
        setError(null);
        try {
            const rootContents = await github.getRepoContents(githubToken, repoId);
            setFileTree({ name: repoId, path: '', type: 'dir', sha: '', size: 0, url: '', isOpen: true, children: rootContents });
            setIsConnected(true);
        } catch (e: unknown) {
            if (e instanceof Error) setError(`Connection failed: ${e.message}`);
        } finally {
            setIsConnecting(false);
        }
    }, [githubToken, repoId]);

    const handleToggleDir = useCallback(async (dirNode: FileNode) => {
        // This function will recursively search for the directory and update it immutably.
        const toggleDirectoryRecursively = async (node: FileNode): Promise<FileNode> => {
            // If this is the directory we're looking for, toggle it.
            if (node.path === dirNode.path) {
                const isOpen = !node.isOpen;
                let children = node.children;
                // If we are opening it and it has no children yet, fetch them.
                if (isOpen && !children) {
                    try {
                        children = await github.getRepoContents(githubToken, repoId, node.path);
                    } catch(e) {
                        if (e instanceof Error) setError(`Failed to load directory: ${e.message}`);
                        // Return original node but ensure it's closed on error to prevent inconsistent state
                        return { ...node, isOpen: false };
                    }
                }
                return { ...node, isOpen, children };
            }

            // If this node has children and it's a potential ancestor, recursively search them.
            if (node.type === 'dir' && node.children) {
                const newChildren = await Promise.all(node.children.map(child => toggleDirectoryRecursively(child)));
                return { ...node, children: newChildren };
            }
            
            // If it's not the target, not an ancestor, or has no children to search, return it as is.
            return node;
        };

        if (fileTree) {
            const newFileTree = await toggleDirectoryRecursively(fileTree);
            setFileTree(newFileTree);
        }
    }, [fileTree, githubToken, repoId]);
    
    const handleSelectFile = useCallback(async (file: GitHubFile) => {
        setError(null);
        try {
            const { content, sha } = await github.getFileContent(githubToken, repoId, file.path);
            setSelectedFile({ ...file, content });
            setEditorContent(content);
        } catch (e: unknown) {
            if (e instanceof Error) setError(`Failed to load file: ${e.message}`);
        }
    }, [githubToken, repoId]);

    const handleSaveToGitHub = async () => {
        if (!selectedFile || !githubToken || !repoId) {
            setError("No file selected or not connected to GitHub.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const commitMessage = `Update ${selectedFile.name} via Component Genie`;
            const result = await github.saveFile(githubToken, repoId, selectedFile.path, editorContent, selectedFile.sha, commitMessage);
            setSelectedFile(prev => prev ? { ...prev, sha: result.content.sha, content: editorContent } : null);
            alert("File saved successfully!");
        } catch (e) {
            if (e instanceof Error) setError(`Failed to save file: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Resizing logic
    const handleMouseDown = (e: React.MouseEvent, index: number) => { resizingRef.current = { isResizing: true, handleIndex: index }; };
    const handleMouseUp = useCallback(() => { resizingRef.current = { isResizing: false, handleIndex: null }; }, []);
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!resizingRef.current.isResizing || resizingRef.current.handleIndex === null || !containerRef.current) return;
        const handleIndex = resizingRef.current.handleIndex;
        const { left, width } = containerRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - left, width));
        let newSizes = [...panelSizes];
        const minPanelSize = 10;

        if (handleIndex === 0) {
            const combined = newSizes[0] + newSizes[1];
            let panel0Size = Math.min(Math.max((newX / width) * 100, minPanelSize), combined - minPanelSize);
            newSizes[0] = panel0Size;
            newSizes[1] = combined - panel0Size;
        } else if (handleIndex === 1) {
            const combined = newSizes[1] + newSizes[2];
            let panel1Size = Math.min(Math.max(((newX / width) * 100) - newSizes[0], minPanelSize), combined - minPanelSize);
            newSizes[1] = panel1Size;
            newSizes[2] = combined - panel1Size;
        }
        setPanelSizes(newSizes.map(s => Math.round(s * 100) / 100) as PanelSizes);
    }, [panelSizes]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleRenderError = useCallback((err: Error) => setRenderError(`Render Error: ${err.message}`), []);
    
    const isDirty = selectedFile?.content !== editorContent;

    return (
        <div className="flex flex-col h-screen antialiased">
            {/* --- HEADER --- */}
            <header className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm z-20">
                <div className="flex items-center gap-3">
                    <LogoIcon />
                    <h1 className="text-lg font-semibold text-gray-200">Component Genie</h1>
                </div>
                <div className="flex-1 px-8">
                     {!isConnected ? (
                        <div className="flex items-center gap-2 max-w-lg mx-auto">
                            <input type="password" value={githubToken} onChange={e => setGithubToken(e.target.value)} placeholder="GitHub PAT" className="flex-1 bg-gray-800 text-xs px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <input type="text" value={repoId} onChange={e => setRepoId(e.target.value)} placeholder="owner/repo" className="flex-1 bg-gray-800 text-xs px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <button onClick={handleConnect} disabled={isConnecting} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-500 disabled:bg-gray-600">{isConnecting ? 'Connecting...' : 'Connect'}</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                           <GithubIcon /> <span>Connected to {repoId}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSaveToGitHub} disabled={!selectedFile || !isDirty || isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"><SaveIcon />{isSaving ? 'Saving...' : 'Save'}</button>
                    <button onClick={handleGenerate} disabled={isLoading || !prompt} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed"><MagicWandIcon />{isLoading ? 'Generating...' : 'Generate'}</button>
                </div>
            </header>

            {/* --- BODY --- */}
            <main ref={containerRef} className="flex flex-1 overflow-hidden bg-gray-800 relative">
                {error && <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-md text-sm z-30 font-mono">{error}</div>}
                
                {/* --- LEFT PANEL: Prompt & Files --- */}
                <div className="h-full flex flex-col" style={{ flexBasis: `${panelSizes[0]}%` }}>
                    <div className="p-2 border-b border-gray-700"><h2 className="text-sm font-medium text-gray-300">Prompt</h2></div>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the component..." className="w-full p-4 bg-transparent text-gray-200 resize-none focus:outline-none font-mono text-sm h-1/3"/>
                    <div className="p-2 border-y border-gray-700"><h2 className="text-sm font-medium text-gray-300">File Explorer</h2></div>
                    <div className="flex-1 overflow-auto p-2">
                        {isConnected && fileTree ? <FileTree node={fileTree} onSelectFile={handleSelectFile} onToggleDir={handleToggleDir} /> : <div className="text-center text-gray-500 text-sm mt-4">Connect to GitHub to see files.</div>}
                    </div>
                </div>
                
                <div onMouseDown={(e) => handleMouseDown(e, 0)} className="w-2 cursor-col-resize bg-gray-700 hover:bg-indigo-500 transition-colors z-10"></div>

                {/* --- MIDDLE PANEL: Preview --- */}
                <div className="h-full flex flex-col" style={{ flexBasis: `${panelSizes[1]}%` }}>
                   <div className="p-2 border-b border-gray-700"><h2 className="text-sm font-medium text-gray-300">Preview</h2></div>
                    <div className="flex-1 p-4 bg-gray-900 overflow-auto">
                        {!editorContent && <div className="text-center text-gray-500">Preview appears here.</div>}
                        {editorContent && <DynamicComponentRenderer code={editorContent} onRenderError={handleRenderError} />}
                    </div>
                </div>
                
                <div onMouseDown={(e) => handleMouseDown(e, 1)} className="w-2 cursor-col-resize bg-gray-700 hover:bg-indigo-500 transition-colors z-10"></div>

                {/* --- RIGHT PANEL: Code --- */}
                <div className="h-full flex flex-col" style={{ flexBasis: `${panelSizes[2]}%` }}>
                    <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                      <h2 className="text-sm font-medium text-gray-300">Code</h2>
                      {selectedFile && <span className="text-xs text-gray-400 font-mono" title={selectedFile.path}>{selectedFile.name}{isDirty ? '*' : ''}</span>}
                    </div>
                    <div className="flex-1 bg-[#1e1e1e] overflow-hidden">
                        {isLoading ? <CliLoader/> : (
                             <Editor
                                height="100%"
                                language={selectedFile?.name.split('.').pop() === 'css' ? 'css' : 'javascript'}
                                theme="vs-dark"
                                path={selectedFile?.path}
                                value={editorContent}
                                onChange={(value) => setEditorContent(value || '')}
                                options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on', tabSize: 2 }}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};