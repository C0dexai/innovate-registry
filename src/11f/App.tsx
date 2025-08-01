




import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MainViewTab, FileType, UserRole, LogLevel, RealtimeSessionStatus } from './types';
import type { User, FileNode, ChatMessage, GithubRepo, ApiKeys, ChatroomMessage, LogEntry, AjenticState, Container, CodeAnalysis, TerminalLine, ContainerFile, GeneratedImage, GithubServiceType, AppContextType, BuildStepMessage, ContainerTerminalLine, InstallationRecommendationMessage, OpenAIFile, ComputerAgentSession, ComputerAgentLog, ComputerUseResponse, ComputerCall, ReasoningItem, ComputerUseResponseOutputItem, TextItem, RealtimeSession, RealtimeTranscriptItem, ParsedCommand } from './types';
import { AppContext } from './context/AppContext';
import IDE from './components/IDE';
import AdminDashboard from './components/Admin';
import Integrations from './components/Integrations';
import Chatroom from './components/Chatroom';
import History from './components/History';
import A2AInstructions from './components/A2AInstructions';
import ContainersDashboard from './components/Containers';
import ImageGenerator from './components/ImageGenerator';
import ComputerAgent from './components/ComputerAgent';
import { Realtime } from './components/Realtime';
import { geminiService } from './services/geminiService';
import { openaiService } from './services/openaiService';
import { dbService } from './services/dbService';
import { githubService } from './services/githubService';
import { openaiContainerService } from './services/openaiContainerService';
import { orchestrationService } from './services/orchestrationService';
import { commandParserService } from './services/commandParserService';
import { LogOutIcon, UserIcon, WorkflowIcon, ImageIcon, CodeXmlIcon, MessageSquareIcon, EyeIcon, FolderIcon, HelpCircleIcon, GitBranchIcon, BoxIcon, PuzzleIcon, DownloadIcon, SquareIcon, MonitorIcon, MicrophoneIcon } from './components/Icons';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';


// Predefined users
const validUsers: (User & { password_plaintext: string })[] = [
    { email: 'google@andiegogiap.com', password_plaintext: '!July1872', isAdmin: true, role: UserRole.Assistant },
    { email: 'google@ai-intel.info', password_plaintext: '!June1872', isAdmin: true, role: UserRole.Agent },
];

// Initial data with /home directory
const initialFiles: FileNode = {
    id: 'root',
    name: '/',
    type: FileType.Directory,
    path: '/',
    children: [
        {
            id: 'home-dir',
            name: 'home',
            type: FileType.Directory,
            path: '/home',
            children: [
                 { id: '1', name: 'README.md', type: FileType.File, path: '/home/README.md', content: '# Welcome to Gemini WebDev Studio\n\nThis is a sample project. Ask the AI to build something, for example: "Create a dark mode SPA landing page".\n\n**New Features:**\n- Right-click files in the explorer for more actions.\n- Drag and drop files/folders to move them.' },
            ]
        }
    ],
};

const initialMessages: ChatMessage[] = [
    { id: '1', type: 'ai_response', text: 'Welcome to the Studio! What should we build today?', suggestions: ['Start a new SPA Build Session', 'Create a responsive React dashboard with charts', 'Analyze and refactor my App.tsx file'] }
];

const initialAjenticState: AjenticState = {
    enabled: true,
    concierge_mode: true,
    github: {
      last_push: null,
      repo: "C0dexai/gemini-studio-project-1",
      branch: "main",
      last_commit: ""
    },
    google: {
      sheets_linked: false,
      drive_linked: false
    }
};

const initialComputerAgentSession: ComputerAgentSession = {
    isRunning: false,
    prompt: null,
    logs: [],
    currentHtml: '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:sans-serif;background-color:#1e293b;color:#f8fafc;">Agent is idle.</div>',
    currentUrl: null,
    lastResponseId: null,
};

const initialRealtimeSession: RealtimeSession = {
    status: RealtimeSessionStatus.IDLE,
    transcript: [],
    errorDetails: null,
    isSpeaking: false,
    isAiControlEnabled: false,
};


// --- START IMMUTABLE FILE TREE HELPERS ---
const findNodeRecursive = (id: string, node: FileNode): FileNode | null => {
    if (node.id === id) return node;
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeRecursive(id, child);
            if (found) return found;
        }
    }
    return null;
};

const findNodeByPathRecursive = (path: string, node: FileNode): FileNode | null => {
    if (node.path === path) return node;
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeByPathRecursive(path, child);
            if (found) return found;
        }
    }
    return null;
};

const findNodeAndParent = (id: string, root: FileNode, parent: FileNode | null = null): { parent: FileNode | null, node: FileNode | null } => {
    if (root.id === id) return { parent, node: root };
    
    if (root.children) {
        for (const child of root.children) {
            const found = findNodeAndParent(id, child, root);
            if (found.node) return found;
        }
    }
    return { parent: null, node: null };
};

const transformNodeRecursive = (root: FileNode, id: string, transform: (node: FileNode) => FileNode | null): FileNode => {
    if (root.id === id) {
        const result = transform(root);
        return result === null ? root : result; // Should not happen for root
    }

    if (!root.children) return root;

    const newChildren = root.children.map(child => transformNodeRecursive(child, id, transform)).filter(Boolean) as FileNode[];

    return { ...root, children: newChildren };
};

const addNodeToTree = (root: FileNode, parentId: string, newNode: FileNode): FileNode => {
    return transformNodeRecursive(root, parentId, (parentNode) => {
        if (parentNode.type !== FileType.Directory) return parentNode;
        if (parentNode.children?.some(child => child.path === newNode.path)) {
            return parentNode;
        }
        return {
            ...parentNode,
            children: [...(parentNode.children || []), newNode]
        };
    });
};

const upsertFileByPath = (root: FileNode, filePath: string, content: string): { newTree: FileNode, updatedNode: FileNode } => {
    const pathParts = filePath.split('/').filter(p => p);
    const fileName = pathParts.pop();

    if (!fileName) return { newTree: root, updatedNode: root };
    
    const resolvedPath = filePath.startsWith('/') ? filePath : `/home/${filePath}`;
    const resolvedParts = resolvedPath.split('/').filter(p => p);
    const resolvedFileName = resolvedParts.pop();
    const directoryParts = resolvedParts;

    if(!resolvedFileName) return { newTree: root, updatedNode: root };

    let newTree = JSON.parse(JSON.stringify(root)); // Deep clone
    let currentNode = newTree;
    let finalNode: FileNode | null = null;

    for (const part of directoryParts) {
        const dirPath = `/${directoryParts.slice(0, directoryParts.indexOf(part) + 1).join('/')}`;
        let nextNode = currentNode.children?.find(c => c.name === part && c.type === 'directory');
        if (!nextNode) {
            nextNode = {
                id: `dir-${dirPath.replace(/\//g, '_')}-${Date.now()}`,
                name: part,
                type: FileType.Directory,
                path: dirPath,
                children: []
            };
            currentNode.children = [...(currentNode.children || []), nextNode];
        }
        currentNode = nextNode;
    }

    const fileIndex = currentNode.children?.findIndex(c => c.name === resolvedFileName);
    const fileNode: FileNode = {
        id: `file-${resolvedPath.replace(/\//g, '_')}-${Date.now()}`,
        name: resolvedFileName,
        type: FileType.File,
        path: resolvedPath,
        content: content
    };

    if (fileIndex !== -1 && fileIndex !== undefined) {
        fileNode.id = currentNode.children[fileIndex].id; // Preserve ID on update
        currentNode.children[fileIndex] = fileNode;
        finalNode = currentNode.children[fileIndex];
    } else {
        currentNode.children = [...(currentNode.children || []), fileNode];
        finalNode = fileNode;
    }

    return { newTree, updatedNode: finalNode! };
};


const deepCopyNode = (node: FileNode, newParentPath: string): FileNode => {
    const newName = node.type === FileType.Directory ? node.name : getUniqueName(node.name, []);
    const newNode: FileNode = {
        ...node,
        id: `${node.type}-${Date.now()}-${Math.random()}`,
        name: newName,
        path: `${newParentPath === '/' ? '' : newParentPath}/${newName}`
    };
    if (node.children) {
        newNode.children = node.children.map(child => deepCopyNode(child, newNode.path));
    }
    return newNode;
};

const getUniqueName = (originalName: string, siblings: FileNode[]): string => {
    let newName = originalName;
    let counter = 1;
    const nameExists = (name: string) => siblings.some(s => s.name === name);

    const extIndex = originalName.lastIndexOf('.');
    const baseName = extIndex > 0 ? originalName.substring(0, extIndex) : originalName;
    const extension = extIndex > 0 ? originalName.substring(extIndex) : '';

    while (nameExists(newName)) {
        newName = `${baseName} (${counter})${extension}`;
        counter++;
    }
    return newName;
};
// --- END IMMUTABLE FILE TREE HELPERS ---


// Login Component
const LoginPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const foundUser = validUsers.find(
            (u) => u.email === email && u.password_plaintext === password
        );

        if (foundUser) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password_plaintext, ...userToLogin } = foundUser;
            onLogin(userToLogin);
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-primary">
            <div className="w-full max-w-md p-8 space-y-8 bg-secondary rounded-xl shadow-neon-accent">
                <h1 className="text-3xl font-bold text-center text-bright-text">Gemini WebDev Studio</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                     {error && <p className="text-center text-neon-red bg-neon-red/20 p-2 rounded-md">{error}</p>}
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-dim-text block mb-2">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="google@ai-intel.info"
                            className="w-full px-4 py-2 bg-primary text-bright-text border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-bold text-dim-text block mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 bg-primary text-bright-text border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-lg font-semibold text-black bg-accent rounded-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-accent transition-all duration-200">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

// Pure helper function to add/update files in the tree hierarchically
const addFilesHierarchically = (root: FileNode, filesToAdd: FileNode[], baseDir: string): { newTree: FileNode, firstFileId: string | null } => {
    let newTree = JSON.parse(JSON.stringify(root));
    let firstFileId: string | null = null;

    filesToAdd.forEach(file => {
        const pathWithBase = `${baseDir}/${file.path.replace(/^\//, '')}`;
        const { newTree: updatedTree, updatedNode } = upsertFileByPath(newTree, pathWithBase, file.content || '');
        newTree = updatedTree;
        if (!firstFileId && updatedNode.type === 'file') {
            firstFileId = updatedNode.id;
        }
    });

    return { newTree, firstFileId };
};


// Helper to generate a "screenshot" from HTML using html2canvas
const generateScreenshotFromHtml = async (html: string): Promise<string> => {
  const container = document.createElement('div');
  // Position off-screen to avoid flicker
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.width = '1024px';
  container.style.height = '768px';
  document.body.appendChild(container);

  const iframe = document.createElement('iframe');
  iframe.style.width = '1024px';
  iframe.style.height = '768px';
  iframe.style.border = 'none';
  container.appendChild(iframe);
  
  iframe.srcdoc = html;

  await new Promise(resolve => { iframe.onload = resolve; });
  await new Promise(resolve => setTimeout(resolve, 300)); // Allow rendering time

  try {
    const canvas = await html2canvas(iframe.contentDocument.body, {
      width: 1024,
      height: 768,
      useCORS: true,
      allowTaint: true,
    });
    return canvas.toDataURL('image/png').split(',')[1];
  } finally {
    document.body.removeChild(container);
  }
};


// Main App Component
const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<MainViewTab>(MainViewTab.IDE);
    const [files, setFiles] = useState<FileNode>(initialFiles);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [previewKey, setPreviewKey] = useState(0);
    const [previewOverride, setPreviewOverride] = useState<string | null>(null);
    const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
    const [apiKeys, setApiKeysState] = useState<ApiKeys>({ gemini: '', openai: '' });
    const [chatroomMessages, setChatroomMessages] = useState<ChatroomMessage[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [ajenticState, setAjenticState] = useState<AjenticState>(initialAjenticState);
    const [containers, setContainers] = useState<Container[]>([]);
    const [codexHistory, setCodexHistory] = useState<TerminalLine[]>([]);
    const [geminiHistory, setGeminiHistory] = useState<TerminalLine[]>([]);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
    const [containerTerminalHistory, setContainerTerminalHistory] = useState<{ [key: string]: ContainerTerminalLine[] }>({});
    const [agentCliHistory, setAgentCliHistory] = useState<{ [key: string]: ChatMessage[] }>({});
    const [agentThreadMap, setAgentThreadMap] = useState<{[containerId: string]: string | null}>({});
    const [openAIFiles, setOpenAIFiles] = useState<OpenAIFile[]>([]);
    const [computerAgentSession, setComputerAgentSession] = useState<ComputerAgentSession>(initialComputerAgentSession);
    const [realtimeSession, setRealtimeSession] = useState<RealtimeSession>(initialRealtimeSession);
    
    // Refs for Realtime API
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioQueueRef = useRef<ArrayBuffer[]>([]);
    const isPlayingRef = useRef(false);

    const computerAgentSessionRef = useRef(computerAgentSession);
    const realtimeSessionRef = useRef(realtimeSession); // Ref for realtime session state

    const adminOnlyTabs = useMemo(() => [MainViewTab.Admin, MainViewTab.A2A, MainViewTab.ImageGen, MainViewTab.Automator], []);

    // Effect to load all data from storage on initial mount
    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const storedUserJson = localStorage.getItem('gemini-studio-user');
                const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
                
                if (storedUser) {
                    setUser(storedUser);
                    const storedTab = localStorage.getItem('gemini-studio-active-tab') as MainViewTab;
                     if (storedTab && (Object.values(MainViewTab).includes(storedTab)) && (storedUser.isAdmin || !adminOnlyTabs.includes(storedTab))) {
                        setActiveTab(storedTab);
                    }
                }

                const storedFiles = await dbService.get<FileNode>('files');
                setFiles(storedFiles || initialFiles);

                const storedMessages = await dbService.get<ChatMessage[]>('messages');
                setMessages(storedMessages && storedMessages.length > 0 ? storedMessages : initialMessages);

                const storedLogs = await dbService.get<LogEntry[]>('logs');
                setLogs(storedLogs || []);
                
                const storedAjenticState = await dbService.get<AjenticState>('ajenticState');
                setAjenticState(storedAjenticState || initialAjenticState);

                const storedActiveFileId = localStorage.getItem('gemini-studio-active-file-id');
                setActiveFileId(storedActiveFileId);

                const storedKeys = await dbService.get<ApiKeys>('apiKeys');
                if (storedKeys) setApiKeysState(storedKeys);

                const storedChatroomMessages = await dbService.get<ChatroomMessage[]>('chatroomMessages');
                if (storedChatroomMessages) setChatroomMessages(storedChatroomMessages);

                const storedGeneratedImages = await dbService.get<GeneratedImage[]>('generatedImages');
                setGeneratedImages(storedGeneratedImages || []);
                
                const storedContainers = await dbService.get<Container[]>('containers');
                if (storedContainers) setContainers(storedContainers);

                const storedThreads = await dbService.get<{[key: string]: string | null}>('agentThreadMap');
                if(storedThreads) setAgentThreadMap(storedThreads);

                const storedOpenAIFiles = await dbService.get<OpenAIFile[]>('openAIFiles');
                setOpenAIFiles(storedOpenAIFiles || []);


            } catch (error) {
                console.error("Failed to load persisted data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPersistedData();
    }, [adminOnlyTabs]);

    useEffect(() => {
        computerAgentSessionRef.current = computerAgentSession;
    }, [computerAgentSession]);
    
    useEffect(() => {
        realtimeSessionRef.current = realtimeSession;
    }, [realtimeSession]);

    const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
        const newLog: LogEntry = {
            ...entry,
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
        };
        setLogs(prev => [...prev, newLog]);
    }, []);

    // --- Container Management ---
    const fetchAndSetContainers = useCallback(async () => {
        if (!apiKeys.openai) return;
        try {
            // This service call now returns containers with the assistantId from metadata
            const fetchedContainers = await openaiContainerService.listContainers(apiKeys.openai);
            
            // Merge with local state to preserve purely UI-side state like server status
            setContainers(prevContainers => {
                const localContainerMap = new Map(prevContainers.map(c => [c.id, c]));
                
                const merged = fetchedContainers.map(apiContainer => {
                    let displayName = apiContainer.name;
                    let owner = 'User';

                    // Parse the name and owner from the backend name format
                    if (apiContainer.name && apiContainer.name.includes(' @')) {
                        const parts = apiContainer.name.split(' @');
                        displayName = parts[0];
                        owner = parts[1];
                    }

                    const existingLocal = localContainerMap.get(apiContainer.id);

                    return {
                        ...apiContainer, // Contains id, object, created_at, status, bytes, and now assistantId
                        name: displayName, // Override with parsed name for UI display
                        owner: owner,
                        // Preserve local-only state that isn't stored in the API
                        serverState: existingLocal?.serverState ?? null,
                        serverLogs: existingLocal?.serverLogs ?? [],
                        npmScripts: existingLocal?.npmScripts,
                        envVars: existingLocal?.envVars,
                        predictedHtml: existingLocal?.predictedHtml,
                        files: existingLocal?.files ?? [],
                        isLoadingFiles: existingLocal?.isLoadingFiles,
                    };
                });
                return merged;
            });

        } catch (error) {
            console.error("Failed to refresh containers:", error);
            addLog({ agent: 'CODEX', event: 'Error', detail: `Failed to fetch containers: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [apiKeys.openai, addLog]);

    const refreshContainers = useCallback(async () => {
        addLog({ agent: 'System', event: 'Refresh', detail: 'Refreshing container list.', level: LogLevel.Info });
        await fetchAndSetContainers();
    }, [fetchAndSetContainers, addLog]);

    useEffect(() => {
        if(user && apiKeys.openai) {
            fetchAndSetContainers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, apiKeys.openai]);


    // Effect to fetch GitHub repos when user logs in
    useEffect(() => {
        const fetchRepos = async () => {
            if (user) {
                try {
                    const repos = await githubService.getRepositories();
                    setGithubRepos(repos);
                } catch (error) {
                    console.error("Failed to fetch GitHub repositories:", error);
                }
            } else {
                setGithubRepos([]); // Clear repos on logout
            }
        };
        fetchRepos();
    }, [user]);

    // --- Effects to save state changes to storage ---
    const useDebouncedEffect = (callback: () => void, deps: any[], delay: number) => {
        useEffect(() => {
            const handler = setTimeout(callback, delay);
            return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [JSON.stringify(deps)]);
    };

    useDebouncedEffect(() => { if (!isLoading) dbService.set('files', files).catch(err => console.error("Error saving files:", err)); }, [files], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('messages', messages).catch(err => console.error("Error saving messages:", err)); }, [messages], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('logs', logs).catch(err => console.error("Error saving logs:", err)); }, [logs], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('ajenticState', ajenticState).catch(err => console.error("Error saving ajentic state:", err)); }, [ajenticState], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('apiKeys', apiKeys).catch(err => console.error("Error saving API keys:", err)); }, [apiKeys], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('chatroomMessages', chatroomMessages).catch(err => console.error("Error saving chatroom messages:", err)); }, [chatroomMessages], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('generatedImages', generatedImages).catch(err => console.error("Error saving generated images:", err)); }, [generatedImages], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('containers', containers).catch(err => console.error("Error saving containers:", err)); }, [containers], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('agentThreadMap', agentThreadMap).catch(err => console.error("Error saving agent threads:", err)); }, [agentThreadMap], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('openAIFiles', openAIFiles).catch(err => console.error("Error saving OpenAI files:", err)); }, [openAIFiles], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('computerAgentSession', computerAgentSession).catch(err => console.error("Error saving computer agent session:", err)); }, [computerAgentSession], 500);
    useDebouncedEffect(() => { if (!isLoading) dbService.set('realtimeSession', realtimeSession).catch(err => console.error("Error saving realtime session:", err)); }, [realtimeSession], 500);


    useEffect(() => { if (!isLoading && activeFileId) localStorage.setItem('gemini-studio-active-file-id', activeFileId); else if (!isLoading) localStorage.removeItem('gemini-studio-active-file-id'); }, [activeFileId, isLoading]);
    useEffect(() => { if (!isLoading) localStorage.setItem('gemini-studio-active-tab', activeTab); }, [activeTab, isLoading]);
    
    const findFileByPath = useCallback((path: string, node: FileNode = files): FileNode | null => {
       return findNodeByPathRecursive(path, node);
    }, [files]);


    const activeFile = useMemo(() => {
        if (!activeFileId || !files) return null;
        return findNodeRecursive(activeFileId, files);
    }, [activeFileId, files]);
    
    const updateActiveFileContent = useCallback((content: string) => {
        if (activeFileId) {
           setFiles(currentFiles => transformNodeRecursive(currentFiles, activeFileId, node => ({...node, content})));
        }
    }, [activeFileId]);
    
    const applyBuildStep = useCallback(async (buildStepId: string) => {
        const buildStep = messages.find(m => m.id === buildStepId && m.type === 'build_step') as BuildStepMessage | undefined;
        if (!buildStep) return;

        setMessages(prev => prev.map(m => m.id === buildStepId && m.type === 'build_step' ? { ...m, status: 'applying' } : m));
        
        let updatedFiles = files;
        for (const block of buildStep.codeBlocks) {
            updatedFiles = upsertFileByPath(updatedFiles, block.filePath, block.code).newTree;
        }
        setFiles(updatedFiles);

        addLog({ agent: 'Build', event: 'Apply Step', detail: `Applied build step: "${buildStep.title}"`, level: LogLevel.Success });
        
        setMessages(prev => prev.map(m => m.id === buildStepId && m.type === 'build_step' ? { ...m, status: 'applied' } : m));

        const initialPromptMessage = messages.find(m => m.type === 'user' && m.text.toLowerCase().includes('start a new spa build session'));
        const initialPrompt = (initialPromptMessage && initialPromptMessage.type === 'user') ? initialPromptMessage.text : "Build an SPA";
        
        const nextStep = await geminiService.generateNextBuildStep(initialPrompt, updatedFiles, apiKeys.gemini);
        
        if (nextStep) {
            setMessages(prev => [...prev, nextStep]);
            addLog({ agent: 'Build', event: 'Next Step', detail: `Generated next build step: "${nextStep.title}"`, level: LogLevel.Info });
        } else {
            addLog({ agent: 'Build', event: 'Completion', detail: 'Build process completed.', level: LogLevel.Handoff });
            setMessages(prev => [...prev, { id: `msg-${Date.now()}`, type: 'ai_response', text: 'Build session complete! All steps have been applied.', suggestions: ["Run build process", "Analyze the final code"] }]);
        }
    }, [messages, files, apiKeys.gemini, addLog]);

    const sendChatMessage = useCallback(async (text: string, file?: File) => {
        if (!user) return;

        const userMessage: ChatMessage = { id: `msg-${Date.now()}`, type: 'user', text, ...(file && { attachment: { name: file.name, type: file.type, size: file.size } }) };
        setMessages(prev => [...prev, userMessage]);
        
        const lowercasedText = text.toLowerCase();
        
        if (lowercasedText.includes('start a new spa build session')) {
            addLog({ agent: 'System', event: 'Build Trigger', detail: 'User initiated an interactive build session.', level: LogLevel.Trigger });
            const firstStep = await geminiService.generateNextBuildStep(text, files, apiKeys.gemini);
            if (firstStep) setMessages(prev => [...prev, firstStep]);
            else setMessages(prev => [...prev, { id: `err-${Date.now()}`, type: 'ai_response', text: 'Sorry, I could not start the build session.'}]);
            return;
        }

        if (lowercasedText.includes('create') && (lowercasedText.includes('page') || lowercasedText.includes('spa')) && !lowercasedText.includes('simple html')) {
            const orchestrationLogUpdater = (update: ChatMessage) => {
                if (update.type === 'orchestration_status') addLog({ agent: update.agentName, event: 'Action', detail: update.text, level: LogLevel.Info });
                else if (update.type === 'orchestration_handoff') addLog({ agent: update.fromAgent, event: 'Handoff', detail: `To ${update.toAgent}`, level: LogLevel.Handoff });
            };

            for await (const update of orchestrationService.run(text)) {
                if (update.type === 'files') {
                    setFiles(currentFiles => {
                        const { newTree, firstFileId: newFileId } = addFilesHierarchically(currentFiles, update.files, '/home');
                        const appTsxFile = findNodeByPathRecursive('/home/src/App.tsx', newTree);
                        if (appTsxFile) setActiveFileId(appTsxFile.id);
                        else if (newFileId) setActiveFileId(newFileId);
                        return newTree;
                    });
                } else {
                    setMessages(prev => [...prev, update]);
                    orchestrationLogUpdater(update);
                }
            }
             addLog({ agent: 'System', event: 'Completion', detail: 'Orchestration complete! Files generated.', level: LogLevel.Success });
            return;
        }
        
        addLog({ agent: 'User', event: 'Query', detail: text, level: LogLevel.Info });
        if (file) addLog({ agent: 'User', event: 'Attachment', detail: `Attached file: ${file.name}`, level: LogLevel.Info });
        
        const placeholderAiMessage: ChatMessage = { id: `msg-${Date.now() + 1}`, type: 'ai_response', text: 'Thinking...' };
        setMessages(prev => [...prev, placeholderAiMessage]);

        let fileData: { data: string; mimeType: string } | undefined = undefined;
        if (file) {
            fileData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve({ data: (e.target?.result as string).split(',')[1], mimeType: file.type });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        const response = await openaiService.generateContent(`[${user.role} Query]: ${text}`, apiKeys.openai, fileData);

        if (response.text.startsWith('Error:')) addLog({ agent: 'OpenAI', event: 'Error', detail: response.text, level: LogLevel.Error });
        else addLog({ agent: 'OpenAI', event: 'Response', detail: `Length: ${response.text.length}`, level: LogLevel.Success });

        // Use Gemini for suggestions as a tool
        const suggestions = await geminiService.generateSuggestions(text, response.text, apiKeys.gemini);
        
        setMessages(prev => prev.map(m => m.id === placeholderAiMessage.id ? { ...placeholderAiMessage, text: response.text, suggestions } : m));

    }, [user, apiKeys.gemini, apiKeys.openai, addLog, files]);
    
    const createNewNode = useCallback((type: FileType, parentPath: string = '/home') => {
        const parentNode = findFileByPath(parentPath, files);
        if (!parentNode || parentNode.type !== FileType.Directory) {
            addLog({ agent: 'System', event: 'Error', detail: `Cannot create node: Parent path "${parentPath}" is not a directory.`, level: LogLevel.Error });
            return;
        }

        const defaultName = type === FileType.Directory ? 'new-folder' : 'new-file.md';
        const newName = prompt(`Enter name for new ${type}:`, defaultName);
        if (!newName) return;

        if (parentNode.children?.some(c => c.name === newName)) {
            alert(`Error: A file or folder named "${newName}" already exists in this directory.`);
            return;
        }
        
        const newNode: FileNode = {
            id: `${type}-${Date.now()}`,
            name: newName,
            type,
            path: `${parentPath === '/' ? '' : parentPath}/${newName}`,
            ...(type === FileType.File ? { content: `# ${newName}` } : { children: [] })
        };
        
        setFiles(currentFiles => addNodeToTree(currentFiles, parentNode.id, newNode));
        if (type === FileType.File) {
            setActiveFileId(newNode.id);
        }
    }, [findFileByPath, files, addLog]);

    const resetChat = useCallback(() => {
        setMessages(initialMessages);
        dbService.set('messages', initialMessages);
        addLog({ agent: 'System', event: 'Reset', detail: 'Chat session has been reset.', level: LogLevel.Info });
    }, [addLog]);

    const refreshPreview = () => {
        setPreviewOverride(null);
        setPreviewKey(k => k + 1);
    }

    const detectScriptsInContainer = useCallback(async (containerId: string) => {
        const container = containers.find(c => c.id === containerId);
        if (!container) return;
        const packageJsonFile = container.files?.find(f => f.name === 'package.json');
        if (!packageJsonFile) {
            // Clear scripts if package.json is not found
            setContainers(prev => prev.map(c => c.id === containerId ? { ...c, npmScripts: undefined } : c));
            return;
        }
        try {
            const content = await openaiContainerService.getContainerFileContent(apiKeys.openai, packageJsonFile.id);
            const parsed = JSON.parse(content);
            const scripts = parsed.scripts || {};
            setContainers(prev => prev.map(c => c.id === containerId ? { ...c, npmScripts: scripts } : c));
            addLog({ agent: 'Foundry', event: 'Scripts Detected', detail: `Found ${Object.keys(scripts).length} scripts in ${container.name}.`, level: LogLevel.Info });
        } catch (error) {
            addLog({ agent: 'Foundry', event: 'Error', detail: `Failed to parse package.json: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [containers, apiKeys.openai, addLog]);

    const addFilesFromZip = useCallback(async (zipFile: File) => {
        addLog({ agent: 'System', event: 'Zip Upload', detail: `Processing and merging zip file: ${zipFile.name}`, level: LogLevel.Info });
        
        try {
            const jszip = new JSZip();
            const zip = await jszip.loadAsync(zipFile);
            const newFiles: FileNode[] = [];

            for (const relativePath in zip.files) {
                if (relativePath.startsWith('__MACOSX/')) continue;
                const zipEntry = zip.files[relativePath];
                const fullPath = `/${relativePath}`;
                if (zipEntry.dir) {
                    newFiles.push({
                        id: `dir-${fullPath.replace(/\//g, '_')}`,
                        name: zipEntry.name.split('/').filter(Boolean).pop()!,
                        type: FileType.Directory,
                        path: fullPath,
                        children: []
                    });
                } else {
                    const content = await zipEntry.async('string');
                    newFiles.push({
                        id: `file-${fullPath.replace(/\//g, '_')}`,
                        name: zipEntry.name.split('/').pop() || '',
                        type: FileType.File,
                        path: fullPath,
                        content
                    });
                }
            }
            
            setFiles(currentFiles => addFilesHierarchically(currentFiles, newFiles, '/home').newTree);
            addLog({ agent: 'System', event: 'Zip Success', detail: `Successfully merged ${newFiles.length} items from zip into /home.`, level: LogLevel.Success });
            
        } catch (error) {
            console.error("Failed to process zip file:", error);
            addLog({ agent: 'System', event: 'Zip Error', detail: `Failed to process zip file: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [addLog]);

    const runFileInPreview = useCallback((filePath: string) => {
        const fileToRun = findFileByPath(filePath);
        if (fileToRun) {
            setActiveFileId(fileToRun.id);
            setPreviewOverride(null);
            refreshPreview();
            addLog({ agent: 'System', event: 'Preview', detail: `Running file: ${filePath}`, level: LogLevel.Info });
        } else {
            addLog({ agent: 'System', event: 'Error', detail: `Could not find file: ${filePath}`, level: LogLevel.Error });
        }
    }, [findFileByPath, addLog]);

    const previewDirectoryTree = useCallback((directoryPath: string) => {
        const node = findFileByPath(directoryPath);
        if (!node || node.type !== FileType.Directory) {
            addLog({ agent: 'System', event: 'Error', detail: `Cannot scan non-directory: ${directoryPath}`, level: LogLevel.Error });
            return;
        }

        const buildTreeHtml = (n: FileNode, level = 0): string => {
            let html = `<li style="padding-left: ${level * 20}px;">${n.type === 'directory' ? '&#128193;' : '&#128196;'} ${n.name}</li>`;
            if (n.children) {
                html += `<ul>${n.children.map(child => buildTreeHtml(child, level + 1)).join('')}</ul>`;
            }
            return html;
        };

        const finalHtml = `
            <body style="font-family: sans-serif; background-color: #111; color: #eee; padding: 2rem;">
                <h2>Directory Scan: ${directoryPath}</h2>
                <ul style="list-style-type: none; padding: 0;">
                    ${node.children?.map(child => buildTreeHtml(child)).join('') || '<li>Directory is empty.</li>'}
                </ul>
            </body>
        `;
        setPreviewOverride(finalHtml);
        addLog({ agent: 'System', event: 'Scan', detail: `Previewing directory tree for ${directoryPath}`, level: LogLevel.Info });
    }, [findFileByPath, addLog]);

    const dismissMessage = useCallback((messageId: string) => setMessages(prev => prev.filter(msg => msg.id !== messageId)), []);

    const applyCodeSuggestion = useCallback(async (suggestion: string) => {
        if (!activeFile || typeof activeFile.content !== 'string') return addLog({ agent: 'System', event: 'Error', detail: 'No active file selected.', level: LogLevel.Error });
        addLog({ agent: 'Gemini', event: 'Action', detail: `Applying suggestion: "${suggestion}"`, level: LogLevel.Info });
        try {
            const updatedCode = await geminiService.applySuggestion(activeFile.content, suggestion, apiKeys.gemini);
            updateActiveFileContent(updatedCode);
             addLog({ agent: 'Gemini', event: 'Success', detail: `Suggestion applied.`, level: LogLevel.Success });
        } catch (error) {
            addLog({ agent: 'Gemini', event: 'Error', detail: `Failed to apply suggestion: ${(error as Error).message}`, level: LogLevel.Error });
            throw error;
        }
    }, [activeFile, apiKeys.gemini, updateActiveFileContent, addLog]);
    
    const handleLogin = (loggedInUser: User) => {
        localStorage.setItem('gemini-studio-user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
    };
    
    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        setFiles(initialFiles);
        setMessages(initialMessages);
        setLogs([]);
        setActiveFileId(null);
        setActiveTab(MainViewTab.IDE);
    }
    
    const commitToGithub = useCallback(async (repo: string, message: string): Promise<string> => {
        if (!files) throw new Error("No file tree available to commit.");
        return await githubService.commitFilesToRepo(repo, message, files);
    }, [files]);

    const setApiKeys = (keys: ApiKeys) => setApiKeysState(keys);

    const sendChatroomMessage = useCallback(async (prompt: string, file?: File) => {
        const messageId = `chatroom-msg-${Date.now()}`;
        setChatroomMessages(prev => [...prev, { id: messageId, prompt, ...(file && { attachment: { name: file.name, type: file.type, size: file.size } }), geminiResponse: '', openaiResponse: '', isLoading: true }]);
        const updateMessage = (id: string, updates: Partial<ChatroomMessage>) => setChatroomMessages(prev => prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg)));

        let fileData;
        if (file) fileData = await new Promise((res, rej) => { const r = new FileReader(); r.onload=e=>res({data:(e.target?.result as string).split(',')[1],mimeType:file.type}); r.onerror=rej; r.readAsDataURL(file); });

        // Helper to run TTS and suggestion fetching
        const processResponse = async (text: string, voice: 'alloy' | 'nova') => {
            if (!text || text.startsWith("Error")) {
                return { suggestions: [], audioBlob: null };
            }
            const ttsPromise = openaiService.textToSpeech(text, apiKeys.openai, voice);
            const suggestionsPromise = geminiService.generateSuggestions(prompt, text, apiKeys.gemini);
            const [audioBlob, suggestions] = await Promise.all([ttsPromise, suggestionsPromise]);
            return { suggestions, audioBlob };
        };

        // Gemini
        const geminiPromise = geminiService.generateContent(prompt, apiKeys.gemini, fileData)
            .then(async (res) => {
                updateMessage(messageId, { geminiResponse: res.text, isGeminiTtsLoading: !!res.text });
                const { suggestions, audioBlob } = await processResponse(res.text, 'alloy');
                const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;
                updateMessage(messageId, { geminiAudioUrl: audioUrl, isGeminiTtsLoading: false, geminiSuggestions: suggestions });
            }).catch(() => {
                updateMessage(messageId, { geminiResponse: 'Error from Gemini.', isGeminiTtsLoading: false });
            });
        
        // OpenAI
        const openaiPromise = openaiService.generateContent(fileData ? `[Image attached]: ${prompt}` : prompt, apiKeys.openai)
            .then(async (res) => {
                updateMessage(messageId, { openaiResponse: res.text, isOpenaiTtsLoading: !!res.text });
                const { suggestions, audioBlob } = await processResponse(res.text, 'nova');
                const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;
                updateMessage(messageId, { openaiAudioUrl: audioUrl, isOpenaiTtsLoading: false, openaiSuggestions: suggestions });
            }).catch(() => {
                updateMessage(messageId, { openaiResponse: 'Error from OpenAI.', isOpenaiTtsLoading: false });
            });

        await Promise.all([geminiPromise, openaiPromise]);
        updateMessage(messageId, { isLoading: false });
    }, [apiKeys.gemini, apiKeys.openai]);
    
    // Function declarations moved up to resolve "used before declaration" errors
    const listContainerFiles = useCallback(async (containerId: string) => {
        setContainers(prev => prev.map(c => c.id === containerId ? { ...c, isLoadingFiles: true } : c));
        try {
            const files = await openaiContainerService.listContainerFiles(apiKeys.openai, containerId);
            setContainers(prev => prev.map(c => c.id === containerId ? { ...c, files, isLoadingFiles: false } : c));
            addLog({ agent: 'CODEX', event: 'List Files', detail: `Listed ${files.length} files.`, level: LogLevel.Info });
        } catch (error) {
            addLog({ agent: 'CODEX', event: 'Error', detail: `Failed to list files: ${(error as Error).message}`, level: LogLevel.Error });
            setContainers(prev => prev.map(c => c.id === containerId ? { ...c, isLoadingFiles: false } : c));
        }
    }, [apiKeys.openai, addLog]);

    const uploadFileToContainer = useCallback(async (containerId: string, file: File | FileNode) => {
        try {
            const originalName = file.name;

            // Filter out unsupported image files
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico'];
            if (imageExtensions.some(ext => originalName.toLowerCase().endsWith(ext))) {
                addLog({ agent: 'CODEX', event: 'File Skipped', detail: `Cannot upload unsupported image file: ${originalName}`, level: LogLevel.Warning });
                return;
            }

            let fileToUpload: File;
            if (file instanceof File) {
                fileToUpload = file;
            } else {
                fileToUpload = new File([file.content || ''], file.name, {type: 'text/plain'});
            }
            
            // Skip empty files
            if (fileToUpload.size === 0) {
                addLog({ agent: 'CODEX', event: 'File Skipped', detail: `Cannot upload empty file: ${originalName}`, level: LogLevel.Warning });
                return;
            }

            let finalName = fileToUpload.name;

            const hasExtension = finalName.includes('.');
            const oldExtension = hasExtension ? finalName.substring(finalName.lastIndexOf('.')).toLowerCase() : '';
            
            if (['.svg', '.xml'].includes(oldExtension)) {
                finalName = finalName.substring(0, finalName.lastIndexOf('.')) + '.txt';
            } else if (!hasExtension) {
                finalName = `${finalName}.txt`;
            } else if (finalName.endsWith('.tsx')) {
                finalName = finalName.replace(/\.tsx$/, '.ts');
            } else if (finalName.endsWith('.jsx')) {
                finalName = finalName.replace(/\.jsx$/, '.js');
            } else if (finalName.endsWith('.mjs') || finalName.endsWith('.cjs')) {
                finalName = finalName.replace(/\.(m|c)js$/, '.js');
            } else if (finalName.endsWith('.yaml') || finalName.endsWith('.yml')) {
                finalName = finalName.replace(/\.ya?ml$/, '.md');
            } else if (finalName.endsWith('.conf') || finalName.endsWith('.ini') || finalName.endsWith('.sh')) {
                finalName = finalName.replace(/\.(conf|ini|sh)$/, '.txt');
            }
            
            // Re-create file object only if name changed
            if (originalName !== finalName) {
                fileToUpload = new File([await fileToUpload.arrayBuffer()], finalName, { type: 'text/plain' });
            }

            await openaiContainerService.uploadFileToContainer(apiKeys.openai, containerId, fileToUpload);

            const logMessage = originalName === finalName
                ? `Uploaded "${originalName}".`
                : `Uploaded "${originalName}" as "${finalName}" to meet API requirements.`;
            addLog({ agent: 'CODEX', event: 'Upload', detail: logMessage, level: LogLevel.Success });
            
            await listContainerFiles(containerId);
        } catch(error) {
             addLog({ agent: 'CODEX', event: 'Error', detail: `Failed to upload file: ${(error as Error).message}`, level: LogLevel.Error });
             throw error;
        }
    }, [apiKeys.openai, listContainerFiles, addLog]);

    const uploadZipToContainer = useCallback(async (containerId: string, zipFile: File) => {
        addLog({ agent: 'Foundry', event: 'Zip Upload', detail: `Unpacking ${zipFile.name}...`, level: LogLevel.Info });
        try {
            const jszip = new JSZip();
            const zip = await jszip.loadAsync(zipFile);
            
            const fileProcessingPromises: Promise<File | null>[] = [];
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico'];
    
            zip.forEach((relativePath, zipEntry) => {
                if (zipEntry.dir) return;

                const filePromise = (async (): Promise<File | null> => {
                    const originalName = zipEntry.name.split('/').filter(Boolean).pop() || zipEntry.name;
                    
                    if (!originalName) return null; // Skip if no name

                    const blob = await zipEntry.async('blob');
                    // Skip empty files
                    if (blob.size === 0) {
                        addLog({ agent: 'Foundry', event: 'File Skipped', detail: `Skipped empty file: ${originalName}`, level: LogLevel.Warning });
                        return null;
                    }

                    // Filter out unsupported image types
                    if (imageExtensions.some(ext => originalName.toLowerCase().endsWith(ext))) {
                        addLog({ agent: 'Foundry', event: 'File Skipped', detail: `Skipped unsupported image file: ${originalName}`, level: LogLevel.Warning });
                        return null;
                    }

                    let fileName = originalName;
                    let fileType = blob.type;
                    
                    const hasExtension = fileName.includes('.');
                    const oldExtension = hasExtension ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase() : '';
                    
                    if (['.svg', '.xml'].includes(oldExtension)) {
                        fileName = fileName.substring(0, fileName.lastIndexOf('.')) + '.txt';
                        fileType = 'text/plain';
                        addLog({ agent: 'Foundry', event: 'File Converted', detail: `Converted ${originalName} to ${fileName} for compatibility.`, level: LogLevel.Info });
                    } else if (!hasExtension) {
                        fileName = `${fileName}.txt`;
                        fileType = 'text/plain';
                        addLog({ agent: 'Foundry', event: 'File Converted', detail: `Converted extensionless file ${originalName} to ${fileName}.`, level: LogLevel.Info });
                    } else if (fileName.endsWith('.tsx')) {
                        fileName = fileName.replace(/\.tsx$/, '.ts');
                        fileType = 'text/typescript';
                    } else if (fileName.endsWith('.jsx')) {
                        fileName = fileName.replace(/\.jsx$/, '.js');
                        fileType = 'text/javascript';
                    } else if (fileName.endsWith('.mjs') || fileName.endsWith('.cjs')) {
                        fileName = fileName.replace(/\.(m|c)js$/, '.js');
                        fileType = 'text/javascript';
                    } else if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
                        fileName = fileName.replace(/\.ya?ml$/, '.md');
                        fileType = 'text/markdown';
                    } else if (fileName.endsWith('.conf') || fileName.endsWith('.ini') || fileName.endsWith('.sh')) {
                        fileName = fileName.replace(/\.(conf|ini|sh)$/, '.txt');
                        fileType = 'text/plain';
                    }

                    return new File([blob], fileName, { type: fileType });
                })();
                fileProcessingPromises.push(filePromise);
            });
            
            const processedFiles = await Promise.all(fileProcessingPromises);
            const filesToUpload = processedFiles.filter((file): file is File => file !== null);

            if (filesToUpload.length === 0) {
                addLog({ agent: 'Foundry', event: 'Zip Info', detail: `Zip file "${zipFile.name}" contains no supported files to upload.`, level: LogLevel.Warning });
                return;
            }
    
            addLog({ agent: 'Foundry', event: 'Zip Upload', detail: `Uploading ${filesToUpload.length} files as a batch... This may take a moment.`, level: LogLevel.Info });
    
            await openaiContainerService.uploadFileBatchToContainer(apiKeys.openai, containerId, filesToUpload);
    
            await listContainerFiles(containerId);
            await detectScriptsInContainer(containerId);
    
            addLog({ agent: 'Foundry', event: 'Zip Success', detail: `Successfully uploaded ${filesToUpload.length} files from ${zipFile.name}. Unsupported files were converted or skipped.`, level: LogLevel.Success });
        } catch (error) {
            console.error("Failed to process zip file:", error);
            addLog({ agent: 'Foundry', event: 'Zip Error', detail: `Failed to process zip file: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [addLog, apiKeys.openai, listContainerFiles, detectScriptsInContainer]);


    const createOpenAIContainer = useCallback(async (name: string) => {
        if (!user?.email) {
            addLog({ agent: 'CODEX', event: 'Error', detail: 'User email not found, cannot create container.', level: LogLevel.Error });
            return;
        }
        try {
            const fullName = `${name} @${user.email}`;
            const { vectorStore, assistantId } = await openaiContainerService.createContainer(apiKeys.openai, fullName);
            
            const newContainerForState: Container = { 
                ...vectorStore, 
                name: name,
                owner: user.email,
                assistantId: assistantId,
            };
            
            setContainers(prev => [...prev, newContainerForState]);
            addLog({ agent: 'CODEX', event: 'Create', detail: `Vector Store & Assistant for "${name}" created.`, level: LogLevel.Success });
        } catch (error) {
            addLog({ agent: 'CODEX', event: 'Error', detail: `Failed to create container: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [apiKeys.openai, user, addLog]);

    const deleteOpenAIContainer = useCallback(async (id: string) => {
        const containerToDelete = containers.find(c => c.id === id);
        if (!containerToDelete) return;

        addLog({ agent: 'CODEX', event: 'Purge', detail: `Purging container "${containerToDelete.name}"...`, level: LogLevel.Warning });
        setContainers(prev => prev.filter(c => c.id !== id));
        if (selectedContainerId === id) {
            setSelectedContainerId(null);
        }

        try {
            await openaiContainerService.deleteContainer(apiKeys.openai, containerToDelete);
            addLog({ agent: 'CODEX', event: 'Purge Complete', detail: `Container "${containerToDelete.name}" successfully purged.`, level: LogLevel.Success });
        } catch (error) {
            addLog({ agent: 'CODEX', event: 'Error', detail: `Failed to purge container "${containerToDelete.name}": ${(error as Error).message}. Restoring.`, level: LogLevel.Error });
            setContainers(prev => [...prev, containerToDelete].sort((a,b) => b.created_at - a.created_at));
        }
    }, [apiKeys.openai, addLog, containers, selectedContainerId]);

    const runScriptInContainer = useCallback(async (containerId: string, scriptName: string) => {
        setContainers(prev => prev.map(c => c.id === containerId ? {...c, serverState: 'running', serverLogs: [...(c.serverLogs || []), `> npm run ${scriptName}`, 'Server is now running... (simulation)'] } : c));
    }, []);

    const stopScriptInContainer = useCallback(async (containerId: string) => {
        setContainers(prev => prev.map(c => c.id === containerId ? {...c, serverState: 'stopped', serverLogs: [...(c.serverLogs || []), 'Server stopped by user.'] } : c));
    }, []);

    const updateContainerEnvVars = useCallback(async (containerId: string, envVars: { [key: string]: string }) => {
        setContainers(prev => prev.map(c => c.id === containerId ? {...c, envVars } : c));
        addLog({ agent: 'Foundry', event: 'Env Update', detail: `Environment variables updated for container ${containerId}.`, level: LogLevel.Info });
    }, [addLog]);

    const debugContainerWithAI = useCallback(async (containerId: string) => {
        const container = containers.find(c => c.id === containerId);
        if (!container || !container.serverLogs) return;

        const serverFile = container.files?.find(f => f.name === 'server.js');
        if (!serverFile) {
            addLog({ agent: 'Foundry', event: 'Debug Error', detail: 'Could not find server.js to debug.', level: LogLevel.Error });
            return;
        }
        
        const addCliHistory = (message: ChatMessage) => setAgentCliHistory(prev => ({ ...prev, [containerId]: [...(prev[containerId] || []), message]}));
        addCliHistory({ id: `agent-thinking-${Date.now()}`, type: 'ai_response', text: 'Debugger is analyzing...' });
        
        const code = await openaiContainerService.getContainerFileContent(apiKeys.openai, serverFile.id);
        const diagnosis = await geminiService.debugCode(container.serverLogs, code, apiKeys.gemini);
        
        setAgentCliHistory(prev => ({
            ...prev,
            [containerId]: prev[containerId]
                .filter(m => !(m.type === 'ai_response' && m.text.includes('Debugger is analyzing')))
                .concat({ id: `agent-resp-${Date.now()}`, type: 'ai_response', text: `AI Debugger Diagnosis:\n\n${diagnosis}` })
        }));

    }, [containers, apiKeys.openai, apiKeys.gemini, addLog]);

    const generateContainerPreview = useCallback(async (containerId: string) => {
        const container = containers.find(c => c.id === containerId);
        if (!container) return;
        const serverFile = container.files?.find(f => f.name === 'server.js');
        if (!serverFile) {
            addLog({ agent: 'Foundry', event: 'Preview Error', detail: 'Could not find server.js to generate preview.', level: LogLevel.Error });
            return;
        }
        addLog({ agent: 'Foundry', event: 'Preview', detail: 'Generating AI-powered preview...', level: LogLevel.Info });
        const code = await openaiContainerService.getContainerFileContent(apiKeys.openai, serverFile.id);
        const html = await geminiService.generatePreviewForCode(code, apiKeys.gemini);
        setContainers(prev => prev.map(c => c.id === containerId ? { ...c, predictedHtml: html } : c));
    }, [containers, apiKeys.openai, apiKeys.gemini, addLog]);

    const handleTerminalCommand = useCallback(async (cli: 'codex' | 'gemini', command: string) => {
        const addHistory = (line: Omit<TerminalLine, 'id'>) => {
            const newLine = { ...line, id: `term-${Date.now()}` };
            if (cli === 'codex') setCodexHistory(prev => [...prev, newLine]); else setGeminiHistory(prev => [...prev, newLine]);
        };
        addHistory({ text: command, type: 'input' });

        const [cmd, ...args] = command.trim().split(/\s+/);
        
        const executeGeminiCommand = async () => {
            if (cmd === 'emulate') {
                const filePath = args[0];
                const file = findFileByPath(filePath);
                if (!file || file.type !== 'file' || !file.content) {
                    return addHistory({ text: `Error: File not found or is empty: ${filePath}`, type: 'error' });
                }
                const lang = filePath.endsWith('.py') ? 'python' : filePath.endsWith('.php') ? 'php' : null;
                if (!lang) {
                    return addHistory({ text: 'Error: Emulation only supports .py and .php files.', type: 'error' });
                }
                
                addHistory({ text: `Emulating ${lang} script: ${filePath}...`, type: 'output' });
                const emulatedOutput = await geminiService.emulateServerSideScript(file.content, lang, apiKeys.gemini);
                const safeOutput = JSON.stringify(emulatedOutput);

                const newHtmlFileName = 'index.html';
                const parentPath = file.path.substring(0, file.path.lastIndexOf('/'));
                const newHtmlPath = `${parentPath}/${newHtmlFileName}`;

                const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Emulation of ${file.name}</title>
    <style>body { font-family: sans-serif; background: #111; color: #eee; }</style>
</head>
<body>
    <h1>Emulated output of ${file.name}</h1>
    <pre id="output"></pre>
    <script>
        // This is a simulation.
        // In a real scenario, this fetch would hit a live server.
        // Here, we are using the pre-emulated output from Gemini.
        const emulatedData = ${safeOutput};
        
        // Simulate an async fetch
        function fakeFetch() {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        text: () => Promise.resolve(emulatedData)
                    });
                }, 500);
            });
        }

        fakeFetch()
            .then(res => res.text())
            .then(data => {
                document.getElementById('output').textContent = data;
            })
            .catch(err => {
                document.getElementById('output').textContent = 'Error: ' + err.message;
            });
    </script>
</body>
</html>`;
                
                setFiles(currentFiles => upsertFileByPath(currentFiles, newHtmlPath, htmlContent).newTree);
                addHistory({ text: `Success! Created ${newHtmlPath} to display the emulated output.`, type: 'output' });
                
            } else {
                 addHistory({ text: `GEMINI CLI command '${cmd}' not implemented here.`, type: 'error' });
            }
        };

        const executeCodexCommand = async () => {
             switch (cmd) {
                case 'container':
                    const subCommand = args[0];
                    switch (subCommand) {
                        case 'list': addHistory({ text: containers.map(c => `ID: ${c.id}\n  Name: ${c.name}\n  Status: ${c.status}\n  Owner: ${c.owner}`).join('\n\n') || 'No containers.', type: 'output' }); break;
                        case 'create':
                            const name = args.slice(args.indexOf('--name') + 1).join(' ').replace(/"/g, '');
                            if (name) { addHistory({ text: `Creating container "${name}"...`, type: 'output' }); await createOpenAIContainer(name); } 
                            else { addHistory({ text: 'Error: --name is required.', type: 'error' }); } break;
                        case 'delete':
                            const id = args[args.indexOf('--id') + 1];
                            if(id) { addHistory({ text: `Deleting container ${id}...`, type: 'output' }); await deleteOpenAIContainer(id); } 
                            else { addHistory({ text: 'Error: --id is required.', type: 'error' }); } break;
                        case 'upload':
                            const fileToUpload = findFileByPath(args[args.indexOf('--file') + 1]);
                            const containerId = args[args.indexOf('--id') + 1];
                            if(fileToUpload && containerId) { addHistory({ text: `Uploading ${fileToUpload.name} to ${containerId}...`, type: 'output' }); await uploadFileToContainer(containerId, fileToUpload); }
                            else { addHistory({ text: 'Error: --id and --file are required.', type: 'error' }); } break;
                        default: addHistory({ text: `Error: Unknown container command '${subCommand}'.`, type: 'error' });
                    } break;
                 case 'help': addHistory({ text: `CODEX CLI Help:\n- container list\n- container create --name "<name>"\n- container delete --id <id>\n- container upload --id <id> --file <path>`, type: 'help' }); break;
                default: addHistory({ text: `Error: Unknown command '${cmd}'.`, type: 'error' });
             }
        };

        if (cli === 'codex') await executeCodexCommand();
        else if (cli === 'gemini') await executeGeminiCommand();

    }, [findFileByPath, containers, createOpenAIContainer, deleteOpenAIContainer, uploadFileToContainer, apiKeys.gemini]);
    
    const generateImages = useCallback(async (prompt: string) => {
        addLog({ agent: 'ImageGen', event: 'Request', detail: `Image for: "${prompt}"`, level: LogLevel.Trigger });
        const results = await geminiService.generateImages(prompt, apiKeys.gemini);
        if (results) {
            setGeneratedImages(prev => [...results.map(base64 => ({ id: `img-${Date.now()}-${Math.random()}`, prompt, base64, createdAt: Date.now() })), ...prev]);
            addLog({ agent: 'ImageGen', event: 'Success', detail: `Generated ${results.length} image(s).`, level: LogLevel.Success });
        } else {
            addLog({ agent: 'ImageGen', event: 'Error', detail: 'Image generation failed.', level: LogLevel.Error });
        }
    }, [apiKeys.gemini, addLog]);

    const deleteGeneratedImage = useCallback((id: string) => {
        setGeneratedImages(prev => prev.filter(img => img.id !== id));
        addLog({ agent: 'ImageGen', event: 'Delete', detail: `Deleted image ${id}.`, level: LogLevel.Warning });
    }, [addLog]);

    const selectContainer = (id: string | null) => {
        setSelectedContainerId(id);
        if(id && !agentCliHistory[id]) setAgentCliHistory(prev => ({...prev, [id]: []}));
        if(id && !agentThreadMap[id]) setAgentThreadMap(prev => ({...prev, [id]: null}));
    };

    const handleContainerTerminalCommand = useCallback(async (containerId: string, command: string) => {
        const addHistory = (line: Omit<ContainerTerminalLine, 'id'>) => setContainerTerminalHistory(prev => ({ ...prev, [containerId]: [...(prev[containerId] || []), { ...line, id: `cterm-${Date.now()}`}]}));
        addHistory({ text: command, type: 'input' });
        
        const [cmd, ...args] = command.trim().split(/\s+/);
        
        switch (cmd) {
            case 'ls':
                await listContainerFiles(containerId);
                const updatedContainer = containers.find(c => c.id === containerId);
                addHistory({ text: updatedContainer?.files?.map(f => f.name).join('\n') || 'No files found.', type: 'output' });
                break;
            case 'cat':
                const path = args[0];
                const fileToRead = containers.find(c=>c.id===containerId)?.files?.find(f=>f.name===path);
                if (!fileToRead) return addHistory({ text: `cat: ${path}: No such file`, type: 'error' });
                try {
                    const content = await openaiContainerService.getContainerFileContent(apiKeys.openai, fileToRead.id);
                    addHistory({ text: content, type: 'output' });
                } catch(e) { addHistory({ text: `Error reading file: ${(e as Error).message}`, type: 'error' }); }
                break;
            case 'help': addHistory({ text: "Available commands:\nls - List files\ncat <filepath> - View file content", type: 'help' }); break;
            default: addHistory({ text: `bash: command not found: ${cmd}`, type: 'error' });
        }
    }, [apiKeys.openai, containers, listContainerFiles]);

    const installRecipeToContainer = useCallback(async (containerId: string, recipe: 'express') => {
        if (recipe !== 'express') return;
    
        const addServerLog = (log: string) => {
            setContainers(prev => prev.map(c => c.id === containerId ? { ...c, serverLogs: [...(c.serverLogs || []), log] } : c));
        };
    
        setContainers(prev => prev.map(c => c.id === containerId ? {...c, serverState: 'installing', serverLogs: ['> Installing express server recipe...'] } : c));
        
        try {
            const pjson = new File([JSON.stringify({
                name: "express-server",
                version: "1.0.0",
                description: "Express server created by Foundry",
                main: "server.js",
                scripts: { "start": "node server.js", "dev": "node --watch server.js" },
                dependencies: { "express": "^4.19.2" }
            }, null, 2)], 'package.json', { type: 'application/json' });
    
            const sjs = new File([
                `const express = require('express');\n` +
                `const app = express();\n` +
                `const port = process.env.PORT || 3000;\n\n` +
                `app.get('/', (req, res) => {\n` +
                `  res.send('Hello from your Express server in the Foundry!');\n` +
                `});\n\n` +
                `app.listen(port, () => {\n` +
                `  console.log(\`Server listening at http://localhost:\${port}\`);\n` +
                `});`
            ], 'server.js', { type: 'application/javascript' });
    
            await uploadFileToContainer(containerId, pjson);
            await uploadFileToContainer(containerId, sjs);
            await detectScriptsInContainer(containerId);
            addServerLog('✓ package.json and server.js uploaded.');
            addServerLog('\n> npm install (simulated)');
    
            await new Promise(res => setTimeout(res, 1500));
            addServerLog('up to date, audited 1 package in 1s');
            
            await new Promise(res => setTimeout(res, 500));
            await runScriptInContainer(containerId, 'start');
            addLog({agent: 'Foundry', event: 'Install', detail: 'Express server installed and started successfully.', level: LogLevel.Success});
    
        } catch(e) {
            setContainers(prev => prev.map(c => c.id === containerId ? {...c, serverState: 'error', serverLogs: [...(c.serverLogs || []), `Error: ${(e as Error).message}`] } : c));
            addLog({ agent: 'Foundry', event: 'Install Error', detail: `Failed to install recipe.`, level: LogLevel.Error }); 
        }
    }, [uploadFileToContainer, addLog, detectScriptsInContainer, runScriptInContainer]);

    const handleAgentCommand = useCallback(async (containerId: string, command: string) => {
        const addCliHistory = (message: ChatMessage) => setAgentCliHistory(prev => ({ ...prev, [containerId]: [...(prev[containerId] || []), message]}));
        addCliHistory({ id: `agent-cmd-${Date.now()}`, type: 'user', text: command });
        
        const container = containers.find(c => c.id === containerId);
        if (!container?.assistantId) {
            addCliHistory({id: 'err', type: 'ai_response', text: 'Error: Assistant not found for this container. The link may have been lost. Please recreate the container.'});
            return;
        }

        const [cmd] = command.trim().split(/\s+/);
        if (cmd.startsWith('/')) { // Handle local slash commands
            return addCliHistory({id:'err', type:'ai_response', text: 'Slash commands not implemented in this version.'});
        }
        
        // Treat as prompt for the assistant
        addCliHistory({ id: `agent-thinking-${Date.now()}`, type: 'ai_response', text: 'Agent is thinking...' });
        const threadId = agentThreadMap[containerId] ?? null;
        const { threadId: newThreadId, response } = await openaiContainerService.runAgent(apiKeys.openai, container.assistantId, threadId, command);
        
        if (newThreadId !== threadId) setAgentThreadMap(prev => ({...prev, [containerId]: newThreadId}));
        
        // Replace thinking message with actual response
        setAgentCliHistory(prev => ({
            ...prev,
            [containerId]: prev[containerId]
                .filter(m => !(m.type === 'ai_response' && m.text === 'Agent is thinking...'))
                .concat({ id: `agent-resp-${Date.now()}`, type: 'ai_response', text: response })
        }));
    }, [apiKeys.openai, containers, agentThreadMap]);

    const applyInstallationRecommendation = useCallback(async (containerId: string, messageId: string) => {
        const message = agentCliHistory[containerId]?.find(m => m.id === messageId) as InstallationRecommendationMessage | undefined;
        if (!message) return;
        setAgentCliHistory(prev => ({ ...prev, [containerId]: prev[containerId].map(m => (m.id === messageId && m.type === 'installation_recommendation') ? { ...m, status: 'installing' } : m)}));
        
        try {
            await installRecipeToContainer(containerId, 'express'); // Use the recipe installer
            addLog({agent: "Foundry", event: "Install", detail: `Installed "${message.title}"`, level: LogLevel.Success });
            setAgentCliHistory(prev => ({ ...prev, [containerId]: prev[containerId].map(m => (m.id === messageId && m.type === 'installation_recommendation') ? { ...m, status: 'installed' } : m)}));
        } catch (e) {
            addLog({agent: "Foundry", event: "Install Error", detail: `Failed to install.`, level: LogLevel.Error });
        }
    }, [agentCliHistory, installRecipeToContainer, addLog]);

    const fetchOpenAIFiles = useCallback(async (purpose?: string) => {
        if (!apiKeys.openai) return;
        try {
            const files = await openaiService.listFiles(apiKeys.openai, purpose);
            setOpenAIFiles(files);
        } catch (error) {
            addLog({ agent: 'System', event: 'Error', detail: `Failed to fetch OpenAI files: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [apiKeys.openai, addLog]);

    const uploadOpenAIFile = useCallback(async (file: File, purpose: string) => {
        if (!apiKeys.openai) return;
        addLog({ agent: 'System', event: 'Upload', detail: `Uploading "${file.name}" for purpose: ${purpose}...`, level: LogLevel.Info });
        try {
            const originalName = file.name;
            let fileToUpload: File = file;

            // Skip empty files
            if (fileToUpload.size === 0) {
                addLog({ agent: 'System', event: 'Upload Error', detail: `Upload failed: File "${originalName}" is empty.`, level: LogLevel.Error });
                return;
            }

            // Apply stricter rules only for 'assistants' purpose which uses file_search
            if (purpose === 'assistants') {
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico'];
                if (imageExtensions.some(ext => originalName.toLowerCase().endsWith(ext))) {
                    addLog({ agent: 'System', event: 'Upload Error', detail: `Cannot upload unsupported image file "${originalName}" for 'assistants' purpose.`, level: LogLevel.Error });
                    return; // Stop upload
                }
            }

            let finalName = file.name;
            const hasExtension = finalName.includes('.');
            const oldExtension = hasExtension ? finalName.substring(finalName.lastIndexOf('.')).toLowerCase() : '';
            
            // Apply conversions for 'assistants' purpose, where retrieval is strict
            if (purpose === 'assistants') {
                if (['.svg', '.xml'].includes(oldExtension)) {
                    finalName = finalName.substring(0, finalName.lastIndexOf('.')) + '.txt';
                } else if (!hasExtension) {
                    finalName = `${finalName}.txt`;
                }
            }
            
            // Apply other general conversions for all purposes
            if (finalName.endsWith('.tsx')) {
                finalName = finalName.replace(/\.tsx$/, '.ts');
            } else if (finalName.endsWith('.jsx')) {
                finalName = finalName.replace(/\.jsx$/, '.js');
            } else if (finalName.endsWith('.mjs') || finalName.endsWith('.cjs')) {
                finalName = finalName.replace(/\.(m|c)js$/, '.js');
            } else if (finalName.endsWith('.yaml') || finalName.endsWith('.yml')) {
                finalName = finalName.replace(/\.ya?ml$/, '.md');
            } else if (finalName.endsWith('.conf') || finalName.endsWith('.ini') || finalName.endsWith('.sh')) {
                finalName = finalName.replace(/\.(conf|ini|sh)$/, '.txt');
            }

            // Re-create file object only if name changed
            if (originalName !== finalName) {
                fileToUpload = new File([await fileToUpload.arrayBuffer()], finalName, { type: 'text/plain' });
            }

            await openaiService.uploadFile(apiKeys.openai, fileToUpload, purpose);
            
            const logMessage = originalName === finalName
                ? `File "${originalName}" uploaded.`
                : `File "${originalName}" uploaded as "${finalName}" to meet API requirements.`;
            addLog({ agent: 'System', event: 'Success', detail: logMessage, level: LogLevel.Success });

            await fetchOpenAIFiles();
        } catch (error) {
            addLog({ agent: 'System', event: 'Error', detail: `Upload failed: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [apiKeys.openai, addLog, fetchOpenAIFiles]);


    const deleteOpenAIFile = useCallback(async (fileId: string) => {
        if (!apiKeys.openai) return;
        const fileName = openAIFiles.find(f => f.id === fileId)?.filename || fileId;
        addLog({ agent: 'System', event: 'Delete', detail: `Deleting file "${fileName}"...`, level: LogLevel.Warning });
        try {
            await openaiService.deleteFile(apiKeys.openai, fileId);
            addLog({ agent: 'System', event: 'Success', detail: 'File deleted.', level: LogLevel.Success });
            setOpenAIFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (error) {
            addLog({ agent: 'System', event: 'Error', detail: `Delete failed: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [apiKeys.openai, addLog, openAIFiles]);

    const getOpenAIFileContent = useCallback(async (fileId: string): Promise<string | null> => {
        if (!apiKeys.openai) return null;
        try {
            const blob = await openaiService.retrieveFileContent(apiKeys.openai, fileId);
            if (blob) {
                if (blob.type.startsWith('text/') || blob.type.includes('json')) {
                    return await blob.text();
                }
                return `Cannot display binary file content of type: ${blob.type}`;
            }
            return 'Could not retrieve file content.';
        } catch (error) {
            addLog({ agent: 'System', event: 'Error', detail: `Failed to get file content: ${(error as Error).message}`, level: LogLevel.Error });
            return `Error: ${(error as Error).message}`;
        }
    }, [apiKeys.openai, addLog]);
    
    const downloadOpenAIFile = useCallback(async (file: OpenAIFile) => {
        if (!apiKeys.openai) return;
        addLog({ agent: 'System', event: 'Download', detail: `Preparing download for "${file.filename}"...`, level: LogLevel.Info });
        try {
            const blob = await openaiService.retrieveFileContent(apiKeys.openai, file.id);
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                addLog({ agent: 'System', event: 'Success', detail: 'Download started.', level: LogLevel.Success });
            } else {
                 throw new Error("Received null content from service.");
            }
        } catch (error) {
            addLog({ agent: 'System', event: 'Error', detail: `Download failed: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [apiKeys.openai, addLog]);
    
    // --- Computer Agent Session Management ---
    const addComputerLog = useCallback((type: ComputerAgentLog['type'], text: string) => {
        const newLog: ComputerAgentLog = { id: `ca-log-${Date.now()}`, timestamp: new Date().toISOString(), type, text };
        setComputerAgentSession(prev => ({ ...prev, logs: [...prev.logs, newLog] }));
    }, []);

    const stopComputerAgentSession = useCallback(() => {
        setComputerAgentSession(prev => {
            if (prev.isRunning) {
                addComputerLog('status', 'Session stopped by user.');
                return { ...prev, isRunning: false };
            }
            return prev;
        });
    }, [addComputerLog]);

    const startComputerAgentSession = useCallback(async (prompt: string) => {
        setComputerAgentSession({ ...initialComputerAgentSession, isRunning: true, prompt });
        addComputerLog('user', prompt);
        
        let currentUrl: string | null = null;
        let lastResponseId: string | null = null;
        let lastCallId: string | null = null;
        let screenshotBase64 = '';

        try {
            // Initial Request
            addComputerLog('status', 'Sending initial prompt to agent...');
            const initialRequest = {
                model: 'gpt-4-turbo-preview',
                tools: [{ type: 'computer_use_preview', display_width: 1024, display_height: 768, environment: 'browser' }],
                input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }],
                reasoning: { summary: 'concise' },
                truncation: 'auto',
            };
            let response = await openaiService.createComputerUseResponse(apiKeys.openai, initialRequest);
            lastResponseId = response.id;
            
            // Main Loop
            for (let i = 0; i < 20; i++) { // Safety break after 20 steps
                if (!computerAgentSessionRef.current.isRunning) break;

                const computerCall = response.output.find(item => item.type === 'computer_call') as ComputerCall | undefined;
                const reasoning = response.output.find(item => item.type === 'reasoning') as ReasoningItem | undefined;

                if (reasoning?.summary?.[0]?.text) {
                    addComputerLog('reasoning', reasoning.summary[0].text);
                }

                if (!computerCall) {
                    const textItem = response.output.find((item): item is TextItem => item.type === 'text');
                    const final_text = textItem?.text || 'Agent finished without a final message.';
                    addComputerLog('status', `Session complete: ${final_text}`);
                    break;
                }

                lastCallId = computerCall.call_id;
                const action = computerCall.action;
                addComputerLog('action', `${action.type.toUpperCase()}: ${JSON.stringify(action)}`);
                
                // --- SIMULATION ---
                // Here we determine the next state of the simulated browser
                const reasoningText = reasoning?.summary?.[0]?.text.toLowerCase() || '';
                const urlMatch = reasoningText.match(/go to\s+(https?:\/\/[^\s]+)/) || reasoningText.match(/navigate to\s+(https?:\/\/[^\s]+)/);
                if(urlMatch && urlMatch[1]) {
                    currentUrl = urlMatch[1];
                    addComputerLog('url', `Navigating to: ${currentUrl}`);
                }

                const pageDescription = `A web page at URL '${currentUrl || 'unknown'}' after the agent performed the following action: ${reasoningText || JSON.stringify(action)}`;

                addComputerLog('status', 'Generating simulated webpage view...');
                const newHtml = await geminiService.generatePageHtml(pageDescription, apiKeys.gemini);
                setComputerAgentSession(prev => ({ ...prev, currentHtml: newHtml, currentUrl }));

                addComputerLog('status', 'Generating screenshot of simulated view...');
                screenshotBase64 = await generateScreenshotFromHtml(newHtml);
                
                // --- END SIMULATION ---

                addComputerLog('status', 'Sending screenshot to agent...');
                const subsequentRequest = {
                    previous_response_id: lastResponseId,
                    model: 'gpt-4-turbo-preview',
                    tools: [{ type: 'computer_use_preview', display_width: 1024, display_height: 768, environment: 'browser' }],
                    input: [{
                        call_id: lastCallId,
                        type: 'computer_call_output',
                        output: { type: 'input_image', image_url: `data:image/png;base64,${screenshotBase64}` },
                        ...(currentUrl && {current_url: currentUrl})
                    }],
                    reasoning: { summary: 'concise' },
                    truncation: 'auto',
                };
                
                response = await openaiService.createComputerUseResponse(apiKeys.openai, subsequentRequest);
                lastResponseId = response.id;
            }

        } catch (error) {
            console.error("Computer Agent Error:", error);
            addComputerLog('error', `An error occurred: ${(error as Error).message}`);
        } finally {
            if (computerAgentSessionRef.current.isRunning) {
                 addComputerLog('status', 'Session finished.');
            }
            setComputerAgentSession(prev => ({...prev, isRunning: false}));
        }

    }, [apiKeys, addComputerLog]);
    
    // --- AI Control Command Execution ---
    const executeAiCommand = useCallback(async (command: ParsedCommand) => {
        addLog({ agent: 'AI Control', event: 'Command', detail: `${command.command}: ${JSON.stringify(command.params)}`, level: LogLevel.Trigger });

        try {
            switch (command.command) {
                case 'create_file':
                case 'edit_file':
                    if (command.params.filePath && typeof command.params.content === 'string') {
                        setFiles(currentFiles => upsertFileByPath(currentFiles, command.params.filePath, command.params.content).newTree);
                        addLog({ agent: 'AI Control', event: 'Success', detail: `File ${command.params.filePath} has been created/updated.`, level: LogLevel.Success });
                    } else {
                        throw new Error("Missing filePath or content for file operation.");
                    }
                    break;
                case 'delete_file':
                    // Helper function to delete node by path
                    const deleteNodeByPath = (root: FileNode, path: string): FileNode => {
                         if (path === '/' || path.startsWith('/home') && path.split('/').length <= 2) return root; // Safety
                         const pathParts = path.split('/').filter(p => p);
                         const nodeName = pathParts.pop();
                         const parentPath = '/' + pathParts.join('/');
                         if (!nodeName) return root;
                         return transformNodeRecursive(root, parentPath, (parentNode) => {
                             if (!parentNode.children) return parentNode;
                             return { ...parentNode, children: parentNode.children.filter(child => child.name !== nodeName) };
                         });
                    };
                    if (command.params.filePath) {
                        setFiles(currentFiles => deleteNodeByPath(currentFiles, command.params.filePath));
                        addLog({ agent: 'AI Control', event: 'Success', detail: `Deleted ${command.params.filePath}.`, level: LogLevel.Success });
                    } else {
                        throw new Error("Missing filePath for delete operation.");
                    }
                    break;
                case 'list_files':
                    const listDirectoryContents = (root: FileNode, path: string): string => {
                        const node = findNodeByPathRecursive(path, root);
                        if (!node || node.type !== FileType.Directory || !node.children) {
                            return `Error: Directory not found or not a directory: ${path}`;
                        }
                        return node.children.length === 0 ? `Directory is empty.` : node.children.map(c => c.name + (c.type === 'directory' ? '/' : '')).join('\n');
                    };
                     if (command.params.path) {
                        const contents = listDirectoryContents(files, command.params.path);
                        addLog({ agent: 'AI Control', event: 'Info', detail: `Contents of ${command.params.path}:\n${contents}`, level: LogLevel.Info });
                     } else {
                        throw new Error("Missing path for list operation.");
                     }
                    break;
                case 'analyze_file':
                     if (command.params.filePath) {
                        const file = findFileByPath(command.params.filePath, files);
                        if (file && file.content) {
                            const analysis = await geminiService.analyzeCode(file.name, file.content, apiKeys.gemini);
                            if (analysis) {
                                setMessages(prev => [...prev, { id: `analysis-${Date.now()}`, type: 'file_analysis', fileName: file.name, filePath: file.path, analysis }]);
                            }
                        } else {
                            throw new Error(`File not found or is empty: ${command.params.filePath}`);
                        }
                     } else {
                        throw new Error("Missing filePath for analysis.");
                     }
                    break;
                default:
                    throw new Error(`Unknown command: ${command.command}`);
            }
        } catch (error) {
             addLog({ agent: 'AI Control', event: 'Error', detail: `Failed to execute command: ${(error as Error).message}`, level: LogLevel.Error });
        }
    }, [addLog, files, findFileByPath, apiKeys.gemini]);
    
    // --- Realtime Session Management ---
    const toggleAiControlMode = useCallback(() => {
        setRealtimeSession(prev => {
            const isEnabled = !prev.isAiControlEnabled;
            addLog({ agent: 'System', event: 'AI Control', detail: isEnabled ? 'Enabled' : 'Disabled', level: isEnabled ? LogLevel.Success : LogLevel.Warning });
            return { ...prev, isAiControlEnabled: isEnabled };
        });
    }, [addLog]);

    const cleanupRealtimeResources = useCallback(() => {
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        if (audioProcessorRef.current) {
            audioProcessorRef.current.disconnect();
            audioProcessorRef.current = null;
        }
        if (audioContextRef.current?.state !== 'closed') {
           audioContextRef.current?.close().catch(e => console.error("Error closing AudioContext:", e));
        }
    
        wsRef.current = null;
        audioContextRef.current = null;
        mediaStreamRef.current = null;
        audioQueueRef.current = [];
        isPlayingRef.current = false;
    }, []);

    const stopRealtimeSession = useCallback(() => {
        if (realtimeSessionRef.current.status === RealtimeSessionStatus.CONNECTED) {
            setRealtimeSession(prev => ({ ...prev, status: RealtimeSessionStatus.CLOSING }));
            wsRef.current?.close(1000, "User requested session stop."); // Normal closure
        }
    }, []);

    const playNextAudioChunk = useCallback(() => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            setRealtimeSession(prev => ({...prev, isSpeaking: false}));
            return;
        }

        isPlayingRef.current = true;
        setRealtimeSession(prev => ({...prev, isSpeaking: true}));
        
        const audioData = audioQueueRef.current.shift();
        if (audioData && audioContextRef.current) {
            audioContextRef.current.decodeAudioData(audioData, (buffer) => {
                const source = audioContextRef.current!.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContextRef.current!.destination);
                source.onended = playNextAudioChunk;
                source.start();
            }, (error) => {
                console.error("Error decoding audio data:", error);
                playNextAudioChunk(); // Try next chunk
            });
        }
    }, []);

    const handleRealtimeMessage = useCallback(async (data: any) => {
        const updateTranscript = (source: 'user' | 'ai', text: string, isFinal: boolean) => {
            setRealtimeSession(prev => {
                const lastItem = [...prev.transcript].reverse().find(i => i.source === source);
                if (lastItem && !lastItem.isFinal) {
                    const newTranscript = prev.transcript.slice(0, -1);
                    newTranscript.push({ ...lastItem, text: lastItem.text + text, isFinal });
                    return { ...prev, transcript: newTranscript };
                }
                return { ...prev, transcript: [...prev.transcript, { id: `transcript-${Date.now()}-${Math.random()}`, source, text, isFinal }] };
            });
        };

        switch (data.type) {
            case 'conversation.item.input_audio_transcription.delta':
                updateTranscript('user', data.delta, false);
                break;
            case 'conversation.item.input_audio_transcription.completed':
                setRealtimeSession(prev => ({...prev, transcript: prev.transcript.map(t => t.source === 'user' ? {...t, isFinal: true} : t)}));
                break;
            case 'response.text.delta':
                updateTranscript('ai', data.delta, false);
                break;
            case 'response.text.done':
                 setRealtimeSession(prev => ({...prev, transcript: prev.transcript.map(t => t.source === 'ai' ? {...t, isFinal: true} : t)}));
                 if (realtimeSessionRef.current.isAiControlEnabled) {
                     const lastMessage = [...realtimeSessionRef.current.transcript].reverse().find(item => item.source === 'ai' && item.isFinal);
                     if (lastMessage && lastMessage.text) {
                         const command = await commandParserService.parseTextForCommand(lastMessage.text, apiKeys.gemini);
                         if (command) {
                             await executeAiCommand(command);
                         }
                     }
                 }
                break;
            case 'response.audio.delta':
                const binaryString = atob(data.delta);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for(let i=0; i<len; i++) bytes[i] = binaryString.charCodeAt(i);
                audioQueueRef.current.push(bytes.buffer);
                if (!isPlayingRef.current) {
                    playNextAudioChunk();
                }
                break;
        }
    }, [apiKeys.gemini, executeAiCommand, playNextAudioChunk]);

    const startAudioProcessing = useCallback((stream: MediaStream) => {
        try {
            const context = new AudioContext();
            audioContextRef.current = context;
            
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);
            audioProcessorRef.current = processor;
            
            source.connect(processor);
            processor.connect(context.destination);
            
            processor.onaudioprocess = (e) => {
                if (wsRef.current?.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const targetSampleRate = 24000;
                const sourceSampleRate = context.sampleRate;
                const ratio = sourceSampleRate / targetSampleRate;
                
                // Simple resampling
                const resampled = new Float32Array(Math.floor(inputData.length / ratio));
                for (let i = 0; i < resampled.length; i++) {
                    resampled[i] = inputData[Math.floor(i * ratio)];
                }
                
                // Convert to PCM16
                const pcm16 = new Int16Array(resampled.length);
                for (let i = 0; i < resampled.length; i++) {
                    let s = Math.max(-1, Math.min(1, resampled[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                
                // Convert to Base64
                const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(pcm16.buffer) as any));

                wsRef.current.send(JSON.stringify({
                    type: 'input_audio_buffer.append',
                    audio: base64
                }));
            };
        } catch (error) {
            console.error('Failed to start audio processing:', error);
            setRealtimeSession(prev => ({...prev, status: RealtimeSessionStatus.ERROR, errorDetails: 'Failed to initialize audio processor.'}));
            wsRef.current?.close();
        }
    }, []);

    const startRealtimeSession = useCallback(async () => {
        if (!apiKeys.openai) {
            setRealtimeSession({ ...initialRealtimeSession, status: RealtimeSessionStatus.ERROR, errorDetails: 'OpenAI API key is not set.' });
            return;
        }

        setRealtimeSession({ ...initialRealtimeSession, status: RealtimeSessionStatus.CONNECTING });

        try {
            // 1. Get microphone permission and stream first to avoid server timeout.
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // 2. Once permission is granted, create the remote session.
            const sessionData = await openaiService.createRealtimeSession(apiKeys.openai);
            if (!sessionData) throw new Error('Failed to create realtime session.');
            
            // 3. Now, open the WebSocket connection. The client_secret is the authentication token.
            const ws = new WebSocket(`wss://api.openai.com/v1/realtime/sessions/${sessionData.client_secret.value}/connect`);
            wsRef.current = ws;

            ws.onopen = () => {
                setRealtimeSession(prev => ({ ...prev, status: RealtimeSessionStatus.CONNECTED }));
                // 4. Start processing the already-acquired audio stream.
                startAudioProcessing(stream);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleRealtimeMessage(data);
                } catch (e) {
                    console.error("Error parsing WebSocket message:", e);
                }
            };
            
            ws.onerror = (event: Event) => {
                // The 'onclose' event will provide the specific error details.
                // We log here just for debugging purposes.
                console.log('A WebSocket transport error occurred. The onclose event will follow with details.', event);
            };
            
            ws.onclose = (event: CloseEvent) => {
                console.log(`WebSocket connection closed. Code: ${event.code}, Reason: "${event.reason}", Was clean: ${event.wasClean}`);
                cleanupRealtimeResources();
                
                // Normal closure is code 1000. event.wasClean can sometimes be false for normal closures.
                if (event.wasClean || event.code === 1000) {
                    setRealtimeSession(initialRealtimeSession);
                } else {
                    let errorDetails = `Connection closed unexpectedly. Code: ${event.code}.`;
                    if (event.reason) {
                        errorDetails += ` Reason: ${event.reason}`;
                    }
                    if (event.code === 1006) {
                        errorDetails += " (This is often a network or server issue).";
                    }
                    
                    setRealtimeSession({
                        ...initialRealtimeSession,
                        status: RealtimeSessionStatus.ERROR,
                        errorDetails: errorDetails.trim()
                    });
                }
            };
        } catch (error) {
            cleanupRealtimeResources();
            let errorMessage = (error as Error).message;
            if (errorMessage.includes('Permission denied') || errorMessage.includes('permission')) {
                errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings and try again.';
            }
            setRealtimeSession({ ...initialRealtimeSession, status: RealtimeSessionStatus.ERROR, errorDetails: errorMessage });
        }
    }, [apiKeys.openai, startAudioProcessing, handleRealtimeMessage, cleanupRealtimeResources]);

     const deleteFileNode = useCallback((nodeId: string) => {
        setFiles(currentFiles => {
            const { parent, node } = findNodeAndParent(nodeId, currentFiles);
            if (!parent || !node) return currentFiles;
            return transformNodeRecursive(currentFiles, parent.id, p => ({
                ...p,
                children: p.children?.filter(c => c.id !== nodeId)
            }));
        });
    }, []);

    const renameFileNode = useCallback((nodeId: string, newName: string) => {
        setFiles(currentFiles => {
            const { parent, node } = findNodeAndParent(nodeId, currentFiles);
            if (!parent || !node || !newName.trim() || parent.children?.some(c => c.name === newName && c.id !== nodeId)) {
                if (parent?.children?.some(c => c.name === newName)) alert(`A file or folder named "${newName}" already exists.`);
                return currentFiles;
            }

            const updatePaths = (n: FileNode, newPath: string): FileNode => ({
                ...n,
                path: newPath,
                children: n.children?.map(c => updatePaths(c, `${newPath}/${c.name}`))
            });

            return transformNodeRecursive(currentFiles, nodeId, n => ({ ...updatePaths(n, `${parent.path === '/' ? '' : parent.path}/${newName}`), name: newName }));
        });
    }, []);

    const duplicateFileNode = useCallback((nodeId: string) => {
        setFiles(currentFiles => {
            const { parent, node } = findNodeAndParent(nodeId, currentFiles);
            if (!parent || !node) return currentFiles;
            
            const newNode = deepCopyNode(node, parent.path);
            newNode.name = getUniqueName(node.name, parent.children || []);
            newNode.path = `${parent.path === '/' ? '' : parent.path}/${newNode.name}`;

            return addNodeToTree(currentFiles, parent.id, newNode);
        });
    }, []);

    const moveFileNode = useCallback((draggedNodeId: string, targetNodeId: string) => {
        setFiles(currentFiles => {
            const { parent: draggedParent, node: draggedNode } = findNodeAndParent(draggedNodeId, currentFiles);
            const { node: targetNode } = findNodeAndParent(targetNodeId, currentFiles);

            if (!draggedParent || !draggedNode || !targetNode || targetNode.type !== FileType.Directory || draggedNode.id === targetNode.id || targetNode.path.startsWith(draggedNode.path)) {
                return currentFiles;
            }

            // 1. Remove node from old parent
            let treeAfterRemoval = transformNodeRecursive(currentFiles, draggedParent.id, p => ({
                ...p,
                children: p.children?.filter(c => c.id !== draggedNodeId)
            }));

            // 2. Update paths of the dragged node and its children
            const updatePaths = (n: FileNode, newPath: string): FileNode => ({
                ...n,
                path: newPath,
                children: n.children?.map(c => updatePaths(c, `${newPath}/${c.name}`))
            });
            const updatedDraggedNode = updatePaths(draggedNode, `${targetNode.path === '/' ? '' : targetNode.path}/${draggedNode.name}`);
            
            // 3. Add node to new parent
            return addNodeToTree(treeAfterRemoval, targetNodeId, updatedDraggedNode);
        });
    }, []);
    
    const downloadContainerFileToLocal = useCallback(async (containerId: string, fileId: string) => {
        const container = containers.find(c => c.id === containerId);
        const fileMeta = container?.files?.find(f => f.id === fileId);
        if(!fileMeta) return;

        addLog({agent: "System", event: "Download", detail: `Downloading ${fileMeta.name} from container to local workspace...`, level: LogLevel.Info});
        try {
            const content = await openaiContainerService.getContainerFileContent(apiKeys.openai, fileId);
            setFiles(prevFiles => {
                const { newTree, updatedNode } = upsertFileByPath(prevFiles, `/home/${fileMeta.name}`, content);
                setActiveFileId(updatedNode.id);
                return newTree;
            });
            addLog({agent: "System", event: "Success", detail: `${fileMeta.name} downloaded and opened.`, level: LogLevel.Success});
        } catch(e) {
            addLog({agent: "System", event: "Error", detail: `Failed to download file: ${(e as Error).message}`, level: LogLevel.Error});
        }
    }, [addLog, apiKeys.openai, containers]);


    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-primary text-bright-text font-semibold text-lg">Loading Studio...</div>;
    }

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const contextValue: AppContextType = {
        user, files, setFiles, activeFileId, setActiveFileId, activeFile, updateActiveFileContent, findFileByPath,
        messages, sendChatMessage, resetChat, createNewNode, addFilesFromZip, refreshPreview, previewKey, previewOverride, setPreviewOverride, previewDirectoryTree,
        githubRepos, commitToGithub, githubService, apiKeys, setApiKeys, chatroomMessages, sendChatroomMessage,
        logs, addLog, ajenticState, setAjenticState, runFileInPreview, dismissMessage, applyCodeSuggestion, applyBuildStep,
        codexHistory, geminiHistory, handleTerminalCommand, generatedImages, generateImages, deleteGeneratedImage,
        containers, createOpenAIContainer, deleteOpenAIContainer, listContainerFiles, uploadFileToContainer, uploadZipToContainer, refreshContainers,
        selectedContainerId, selectContainer, containerTerminalHistory, handleContainerTerminalCommand, installRecipeToContainer,
        agentCliHistory, handleAgentCommand, applyInstallationRecommendation, 
        openAIFiles, fetchOpenAIFiles, uploadOpenAIFile, deleteOpenAIFile, getOpenAIFileContent, downloadOpenAIFile,
        downloadContainerFileToLocal,
        computerAgentSession, startComputerAgentSession, stopComputerAgentSession,
        realtimeSession, startRealtimeSession, stopRealtimeSession, toggleAiControlMode, executeAiCommand,
        // New Runtime functions
        detectScriptsInContainer, runScriptInContainer, stopScriptInContainer, updateContainerEnvVars, debugContainerWithAI, generateContainerPreview,
        // New File Tree Manipulation Functions
        deleteFileNode, renameFileNode, moveFileNode, duplicateFileNode
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="flex flex-col h-screen w-screen overflow-hidden">
                <header className="flex-shrink-0 bg-primary border-b border-secondary flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold text-bright-text">GEMINI STUDIO</h1>
                        <nav className="flex items-center gap-2">
                            {Object.values(MainViewTab).map(tab => (
                                (user.isAdmin || !adminOnlyTabs.includes(tab)) && (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center ${activeTab === tab ? 'bg-accent text-black font-semibold' : 'text-dim-text hover:bg-secondary'}`}>
                                        {tab === MainViewTab.A2A && <WorkflowIcon className="w-4 h-4 mr-2" />}
                                        {tab === MainViewTab.ImageGen && <ImageIcon className="w-4 h-4 mr-2" />}
                                        {tab === MainViewTab.Automator && <MonitorIcon className="w-4 h-4 mr-2" />}
                                        {tab === MainViewTab.REALTIME && <MicrophoneIcon className="w-4 h-4 mr-2" />}
                                        {tab}
                                    </button>
                                )
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-dim-text">
                            <UserIcon className="w-5 h-5"/>
                            <span>{user.email} ({user.role}) {user.isAdmin && <span className="text-highlight font-semibold">(Admin)</span>}</span>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-dim-text hover:text-bright-text rounded-full hover:bg-secondary">
                          <LogOutIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </header>
                <main className="flex-grow overflow-auto bg-primary">
                    {activeTab === MainViewTab.IDE && <IDE />}
                    {activeTab === MainViewTab.Admin && user.isAdmin && <AdminDashboard />}
                    {activeTab === MainViewTab.Automator && user.isAdmin && <ComputerAgent />}
                    {activeTab === MainViewTab.Chatroom && <Chatroom />}
                    {activeTab === MainViewTab.Containers && <ContainersDashboard />}
                    {activeTab === MainViewTab.Integrations && <Integrations />}
                    {activeTab === MainViewTab.HISTORY && <History />}
                    {activeTab === MainViewTab.A2A && user.isAdmin && <A2AInstructions />}
                    {activeTab === MainViewTab.ImageGen && user.isAdmin && <ImageGenerator />}
                    {activeTab === MainViewTab.REALTIME && <Realtime />}
                </main>
            </div>
        </AppContext.Provider>
    );
};

export default App;