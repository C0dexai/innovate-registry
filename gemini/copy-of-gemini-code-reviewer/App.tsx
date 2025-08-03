import React, { useState, useCallback, useRef, useEffect, useMemo, Fragment } from 'react';
import { dbGet, dbSet } from './services/dbService.ts';
import { AI_FAMILY_AGENTS, DEFAULT_WORKFLOWS, SUPPORTED_LANGUAGES } from './constants.ts';
import { ask, sendMessageInChat } from './services/aiService.ts';
import { getRepoTree, getFileContent as getGitHubFileContent, createOrUpdateFile, deleteFile as deleteGitHubFile, getRepoDetails } from './services/githubService.ts';

import type { VFSFile, OpenFile, ConsoleEntry, Agent, Workflow, ChatMessage, BottomPanelTab, RepoDetails } from './types.ts';

import { parseResponse } from './utils/parsing.ts';
import Header from './components/ui/Header.tsx';
import FileExplorer from './components/ui/FileExplorer.tsx';
import EditorPanel from './components/ui/EditorPanel.tsx';
import BottomPanel from './components/ui/BottomPanel.tsx';
import SettingsPanel from './components/ui/SettingsPanel.tsx';
import ResizeHandle from './components/ui/ResizeHandle.tsx';
import { Loader, ExclamationTriangleIcon } from './components/ui/Icons.tsx';

const App: React.FC = () => {
  const [isDBLoading, setIsDBLoading] = useState(true);
  const isInitialized = useRef(false);

  // GitHub & File State
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [gitTree, setGitTree] = useState<any[]>([]);
  const [vfs, setVfs] = useState<VFSFile[]>([]); // Acts as a cache for file content
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  
  // AI & UI State
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string>('');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  
  const [activeBottomTab, setActiveBottomTab] = useState<BottomPanelTab>('source-control');
  const [consoleHistory, setConsoleHistory] = useState<ConsoleEntry[]>([]);
  
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatHistories, setChatHistories] = useState<{ [key: string]: ChatMessage[] }>({});

  // Layout State
  const [leftPanelWidth, setLeftPanelWidth] = useState(250);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(400);
  const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(false);

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadDataFromDb = async () => {
        try {
            const [
                agentsData, 
                activeAgentIdData, 
                workflowsData, 
                chatHistoriesData,
                openFilesData,
                activeFileIdData,
                consoleHistoryData,
                activeBottomTabData,
                layoutData
            ] = await Promise.all([
                dbGet<Agent[]>('agents'),
                dbGet<string>('activeAgentId'),
                dbGet<Workflow[]>('workflows'),
                dbGet<{ [key: string]: ChatMessage[] }>('chatHistories'),
                dbGet<OpenFile[]>('openFiles'),
                dbGet<string | null>('activeFileId'),
                dbGet<ConsoleEntry[]>('consoleHistory'),
                dbGet<BottomPanelTab>('activeBottomTab'),
                dbGet<{left: number, bottom: number, collapsed: boolean}>('layout')
            ]);

            setAgents(agentsData && agentsData.length > 0 ? agentsData : AI_FAMILY_AGENTS);
            setActiveAgentId(activeAgentIdData || AI_FAMILY_AGENTS[1].id);
            setWorkflows(workflowsData && workflowsData.length > 0 ? workflowsData : DEFAULT_WORKFLOWS);
            setChatHistories(chatHistoriesData || {});
            
            // Re-fetch content for open files to ensure they are fresh
            if (openFilesData && openFilesData.length > 0) {
              const freshOpenFiles = await Promise.all(openFilesData.map(async (file) => {
                const updatedFile = await getGitHubFileContent(file.path);
                if (updatedFile) {
                    return { ...file, content: updatedFile.content, sha: updatedFile.sha, isDirty: false };
                }
                return null;
              }));
              const validFiles = freshOpenFiles.filter(f => f !== null) as OpenFile[];
              setOpenFiles(validFiles);
              if (validFiles.some(f => f.id === activeFileIdData)) {
                  setActiveFileId(activeFileIdData);
              } else if (validFiles.length > 0) {
                  setActiveFileId(validFiles[0].id);
              } else {
                  setActiveFileId(null);
              }
            } else {
               setOpenFiles([]);
               setActiveFileId(null);
            }

            setConsoleHistory(consoleHistoryData || []);
            setActiveBottomTab(activeBottomTabData || 'source-control');
            if (layoutData) {
                setLeftPanelWidth(layoutData.left);
                setBottomPanelHeight(layoutData.bottom);
                setIsBottomPanelCollapsed(layoutData.collapsed);
            }
        } catch (error) {
            console.error("Failed to load data from IndexedDB, falling back to defaults.", error);
            setAgents(AI_FAMILY_AGENTS);
            setActiveAgentId(AI_FAMILY_AGENTS[1].id);
        } finally {
            // This happens after DB load
        }
    };
    
    const attemptInitialization = (maxRetries = 5, delay = 300) => {
      // Poll for environment variables to handle potential race conditions on load.
      if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
        if (maxRetries > 0) {
          console.warn(`GitHub credentials not found. Retrying in ${delay}ms... (${maxRetries} retries left)`);
          setTimeout(() => attemptInitialization(maxRetries - 1, delay), delay);
          return;
        }
        setRepoError("GitHub token or repo not configured. Please check your .env file and restart the application.");
        setIsDBLoading(false);
        setIsLoading(false);
        return;
      }

      // Environment variables are loaded, proceed with initialization.
      const initializeRepo = async () => {
          setIsLoading(true);
          setRepoError(null);
          try {
              const details = await getRepoDetails();
              if(!details) {
                  throw new Error("Could not fetch repository details. Check GITHUB_TOKEN and GITHUB_REPO environment variables.");
              }
              setRepoDetails(details);
              const tree = await getRepoTree(details.default_branch);
              setGitTree(tree);
              await loadDataFromDb();
          } catch (e: any) {
              console.error(e);
              setRepoError(e.message);
          } finally {
              setIsLoading(false);
              setIsDBLoading(false);
              setTimeout(() => { isInitialized.current = true; }, 500);
          }
      };
      
      initializeRepo();
    }
    
    attemptInitialization();
  }, []);

  // Save data to IndexedDB on change
  useEffect(() => { if (isInitialized.current) dbSet('agents', agents); }, [agents]);
  useEffect(() => { if (isInitialized.current) dbSet('activeAgentId', activeAgentId); }, [activeAgentId]);
  useEffect(() => { if (isInitialized.current) dbSet('workflows', workflows); }, [workflows]);
  useEffect(() => { if (isInitialized.current) dbSet('chatHistories', chatHistories); }, [chatHistories]);
  useEffect(() => { if (isInitialized.current) dbSet('openFiles', openFiles.map(({content, ...rest}) => rest)); }, [openFiles]); // Don't save large content
  useEffect(() => { if (isInitialized.current) dbSet('activeFileId', activeFileId); }, [activeFileId]);
  useEffect(() => { if (isInitialized.current) dbSet('consoleHistory', consoleHistory); }, [consoleHistory]);
  useEffect(() => { if (isInitialized.current) dbSet('activeBottomTab', activeBottomTab); }, [activeBottomTab]);
  useEffect(() => {
    if (isInitialized.current) {
        dbSet('layout', {
            left: leftPanelWidth,
            bottom: bottomPanelHeight,
            collapsed: isBottomPanelCollapsed,
        });
    }
  }, [leftPanelWidth, bottomPanelHeight, isBottomPanelCollapsed]);
  
  const activeAgent = agents.find(a => a.id === activeAgentId) || agents.find(a => a.name !== 'Code Reviewer') || agents[0];
  const activeFile = openFiles.find(f => f.id === activeFileId);

  const dragHandleRef = useRef<'left' | 'bottom' | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const addConsoleEntry = useCallback((entry: Omit<ConsoleEntry, 'id'>) => {
    setConsoleHistory(prev => [...prev, { ...entry, id: `entry-${Date.now()}-${Math.random()}` }]);
  }, []);
  
  const handleOpenFile = async (path: string, sha: string) => {
    const alreadyOpen = openFiles.find(f => f.path === path);
    if (alreadyOpen) {
      setActiveFileId(alreadyOpen.id);
      return;
    }
    
    addConsoleEntry({ type: 'system', text: `Fetching ${path}...` });
    const fileData = await getGitHubFileContent(path);
    if (!fileData) {
      addConsoleEntry({type: 'error', text: `Could not open file: ${path}`});
      return;
    }
    
    const name = path.split('/').pop() || path;
    const newFile: OpenFile = { 
        id: `file-${Date.now()}`, 
        path, 
        content: fileData.content, 
        name, 
        sha: fileData.sha,
        isDirty: false,
    };
    setOpenFiles([...openFiles, newFile]);
    setActiveFileId(newFile.id);
    addConsoleEntry({ type: 'system', text: `Opened ${path}` });
  };
  
  const handleCommitFile = async (path: string, content: string, message: string) => {
    const file = openFiles.find(f => f.path === path);
    if (!file) return;

    setIsLoading(true);
    addConsoleEntry({ type: 'system', text: `Committing ${path}...` });
    try {
        const result = await createOrUpdateFile(path, content, message, file.sha);
        setOpenFiles(files => files.map(f => f.path === path ? { ...f, sha: result.content.sha, isDirty: false } : f));
        // Refresh tree to get new shas if needed (can be optimized)
        const tree = await getRepoTree(repoDetails!.default_branch);
        setGitTree(tree);
        addConsoleEntry({ type: 'system', text: `Successfully committed ${path}` });
    } catch (e: any) {
        addConsoleEntry({ type: 'error', text: `Commit failed: ${e.message}` });
        setError(`Commit failed: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseFile = (fileId: string) => {
    const fileToClose = openFiles.find(f => f.id === fileId);
    if (fileToClose && fileToClose.isDirty) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to close this file?")) {
            return;
        }
    }

    const fileIndex = openFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;
    
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    
    if (activeFileId === fileId) {
      if (newOpenFiles.length > 0) {
        setActiveFileId(newOpenFiles[Math.max(0, fileIndex - 1)].id);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const handleUpdateFileContent = (fileId: string, newContent: string) => {
    setOpenFiles(currentOpenFiles => currentOpenFiles.map(f => 
        f.id === fileId ? { ...f, content: newContent, isDirty: true } : f
    ));
  };
  
  // Simplified for now - should open a modal
  const handleCreateItem = async (isFolder: boolean) => {
    const path = prompt(`Enter the full path for the new ${isFolder ? 'folder' : 'file'}:`, 'new-folder/.gitkeep');
    if (!path) return;
    
    const content = isFolder ? '' : '// New file content';
    const message = `feat: create ${isFolder ? 'directory' : 'file'} ${path}`;
    
    setIsLoading(true);
    try {
      await createOrUpdateFile(path, content, message, undefined);
      addConsoleEntry({type: 'system', text: `Created ${path}`});
      const tree = await getRepoTree(repoDetails!.default_branch);
      setGitTree(tree);
    } catch(e: any) {
      addConsoleEntry({type: 'error', text: e.message});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (path: string, sha: string) => {
      const name = path.split('/').pop() || '';
      if (!window.confirm(`Are you sure you want to delete "${name}" from the repository? This cannot be undone.`)) {
          return;
      }
      
      setIsLoading(true);
      try {
          await deleteGitHubFile(path, `feat: remove ${name}`, sha);
          addConsoleEntry({type: 'system', text: `Deleted ${path}`});
          const tree = await getRepoTree(repoDetails!.default_branch);
          setGitTree(tree);
          // Close file if it was open
          const openFile = openFiles.find(f => f.path === path);
          if (openFile) {
              handleCloseFile(openFile.id);
          }
      } catch (e: any) {
          addConsoleEntry({type: 'error', text: e.message});
      } finally {
        setIsLoading(false);
      }
  };

  const handleReview = useCallback(async () => {
    if (!activeFile || !activeFile.content.trim()) {
      setError('Please open a file with code to review.');
      setActiveBottomTab('review');
      return;
    }
    const extension = activeFile.name.split('.').pop() || '';
    const language = SUPPORTED_LANGUAGES.find(l => l.extension === extension)?.value || 'plaintext';

    setIsLoading(true);
    setError(null);
    setFeedback('');
    setActiveBottomTab('review');

    try {
      const reviewerAgent = agents.find(a => a.name === "Code Reviewer") || AI_FAMILY_AGENTS[0];
      const prompt = `
        Here is the ${language} code from file "${activeFile.path}" to review:
        \`\`\`${language}
        ${activeFile.content}
        \`\`\`
      `;
      const result = await ask(prompt, reviewerAgent);
      setFeedback(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get review: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeFile, agents]);
  
  const handleApplySuggestion = (originalCode: string, suggestedCode: string) => {
    if (!activeFile) return;

    if (activeFile.content.includes(originalCode)) {
        const newContent = activeFile.content.replace(originalCode, suggestedCode);
        handleUpdateFileContent(activeFile.id, newContent);
    } else {
        console.warn("Attempted to apply a suggestion, but the original code was not found. It may have already been changed or applied.");
    }
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (!activeAgent) return;
    
    const currentHistory = chatHistories[activeAgent.id] || [];
    const newUserMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: message,
    };
    const updatedHistory = [...currentHistory, newUserMessage];
    
    setChatHistories(prev => ({ ...prev, [activeAgent.id]: updatedHistory }));
    setIsChatLoading(true);

    try {
      const result = await sendMessageInChat(message, currentHistory, activeAgent);
      const newAiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'model',
        text: result,
      };
      setChatHistories(prev => ({ ...prev, [activeAgent.id]: [...updatedHistory, newAiMessage] }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      const errorEntry: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'model',
        text: `Error: Could not get a response. ${errorMessage}`
      };
      setChatHistories(prev => ({ ...prev, [activeAgent.id]: [...updatedHistory, errorEntry] }));
    } finally {
      setIsChatLoading(false);
    }
  }, [activeAgent, chatHistories]);

  const handleClearChat = useCallback(() => {
    if (!activeAgent) return;
    if (window.confirm(`Are you sure you want to clear the chat history with ${activeAgent.name}?`)) {
      setChatHistories(prev => ({ ...prev, [activeAgent.id]: [] }));
    }
  }, [activeAgent]);
  
  const handleClearConsole = () => {
    setConsoleHistory([]);
  };

  const handleMouseDown = (type: 'left' | 'bottom') => (e: React.MouseEvent) => {
    e.preventDefault();
    dragHandleRef.current = type;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragHandleRef.current) return;
      if (dragHandleRef.current === 'left') {
        const newWidth = Math.max(200, Math.min(e.clientX, window.innerWidth - 400));
        setLeftPanelWidth(newWidth);
      } else {
        if (mainContentRef.current) {
          const mainRect = mainContentRef.current.getBoundingClientRect();
          const newHeight = mainRect.bottom - e.clientY;
          setBottomPanelHeight(Math.max(48, newHeight));
        }
      }
    };
    const handleMouseUp = () => {
      dragHandleRef.current = null;
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  if (isDBLoading) {
      return (
          <div className="bg-slate-950 text-white w-screen h-screen flex items-center justify-center">
              <div className="text-center flex flex-col items-center gap-4">
                  <Loader className="w-12 h-12" />
                  <h1 className="text-2xl font-bold">Initializing Gemini IDE...</h1>
                  <p className="text-slate-400">Loading your workspace from the database.</p>
              </div>
          </div>
      );
  }
  
  if (repoError) {
      return (
          <div className="bg-red-950 text-white w-screen h-screen flex items-center justify-center p-8">
              <div className="bg-slate-900 border border-red-500/50 rounded-lg p-8 text-center max-w-2xl">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-red-300">Repository Initialization Failed</h1>
                  <p className="text-slate-300 mt-2 mb-4">
                      Could not connect to the specified GitHub repository. Please check the following:
                  </p>
                  <pre className="bg-slate-800 text-red-300/80 p-4 rounded-md font-mono text-sm text-left break-all">
                      {repoError}
                  </pre>
                   <p className="text-slate-400 mt-4 text-sm">
                      Please check your <code className="bg-slate-700 rounded px-1.5 py-1 font-mono text-violet-300 text-xs">.env</code> file for correct <code className="bg-slate-700 rounded px-1.5 py-1 font-mono text-violet-300 text-xs">GITHUB_REPO</code> and <code className="bg-slate-700 rounded px-1.5 py-1 font-mono text-violet-300 text-xs">GITHUB_TOKEN</code> values, then restart the application.
                  </p>
              </div>
          </div>
      )
  }

  return (
    <div className="bg-slate-950 font-sans h-screen flex flex-col">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} repoDetails={repoDetails} />
      
      <main className="flex-grow flex overflow-hidden">
        {/* File Explorer Panel */}
        <div style={{ width: `${leftPanelWidth}px` }} className="bg-slate-900 flex-shrink-0 overflow-y-auto">
          <FileExplorer 
            tree={gitTree} 
            onOpenFile={handleOpenFile} 
            onCreateItem={handleCreateItem}
            onDeleteItem={handleDeleteItem}
            isLoading={isLoading && gitTree.length === 0}
          />
        </div>
        
        <ResizeHandle onMouseDown={handleMouseDown('left')} direction='vertical' />

        {/* Main Content Area */}
        <div ref={mainContentRef} className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow overflow-hidden">
            <EditorPanel 
              openFiles={openFiles}
              activeFileId={activeFileId}
              onFileContentChange={handleUpdateFileContent}
              onCloseFile={handleCloseFile}
              onSelectFile={setActiveFileId}
              onReview={handleReview}
              isLoading={isLoading && !!feedback}
            />
          </div>

          <ResizeHandle onMouseDown={handleMouseDown('bottom')} direction='horizontal' />

          {/* Bottom Panel */}
          <div 
            style={{ 
              height: isBottomPanelCollapsed ? '48px' : `${bottomPanelHeight}px`,
              transition: 'height 0.2s ease-in-out'
            }} 
            className="flex-shrink-0 bg-slate-900 border-t border-slate-700"
          >
            <BottomPanel 
              isCollapsed={isBottomPanelCollapsed}
              toggleCollapse={() => setIsBottomPanelCollapsed(!isBottomPanelCollapsed)}
              vfs={vfs}
              openFiles={openFiles}
              onCommitFile={handleCommitFile}
              activeAgent={activeAgent}
              onOpenFile={handleOpenFile}
              activeTab={activeBottomTab}
              setActiveTab={setActiveBottomTab}
              feedback={feedback}
              isLoadingReview={isLoading && !feedback}
              reviewError={error}
              onApplySuggestion={handleApplySuggestion}
              activeFile={activeFile}
              consoleHistory={consoleHistory}
              onAddConsoleEntry={addConsoleEntry}
              onClearConsole={handleClearConsole}
              chatHistory={chatHistories[activeAgent.id] || []}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isChatLoading={isChatLoading}
              agents={agents}
              setAgents={setAgents}
              activeAgentId={activeAgentId}
              setActiveAgentId={setActiveAgentId}
              workflows={workflows}
              setWorkflows={setWorkflows}
              onRunWorkflow={() => { /* Placeholder */}}
            />
          </div>
        </div>
      </main>
      
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} repoDetails={repoDetails} />

    </div>
  );
};

export default App;