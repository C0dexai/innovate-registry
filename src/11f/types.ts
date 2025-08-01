

export enum FileType {
  File = 'file',
  Directory = 'directory',
}

export interface FileNode {
  name: string;
  id: string;
  type: FileType;
  content?: string;
  children?: FileNode[];
  path: string;
}

export interface ContextMenuItem {
    label: string;
    action: () => void;
    icon: React.ReactNode;
}


export interface OrchestrationAgent {
    name:string;
    role: string;
    expertise: string;
    llm: 'Gemini' | 'OpenAI';
}

export interface OrchestrationStep {
    step: string;
    agent: string;

    action: string;
    handoff: string | null;
}

export interface CodeBlock {
    language: string;
    code: string;
    filePath: string;
}

export interface BuildStepMessage {
    id: string;
    type: 'build_step';
    title: string;
    description: string;
    status: 'pending' | 'applying' | 'applied';
    codeBlocks: CodeBlock[];
}

export interface InstallationRecommendationMessage {
    id: string;
    type: 'installation_recommendation';
    title: string;
    description: string;
    status: 'pending' | 'installing' | 'installed';
    codeBlocks: CodeBlock[];
}


export type ChatMessage = 
    | { id: string; type: 'user'; text: string; attachment?: { name: string; type: string; size: number } }
    | { id: string; type: 'ai_response'; text: string; suggestions?: string[] }
    | { id:string; type: 'orchestration_status'; agentName: string; text: string }
    | { id: string; type: 'orchestration_handoff'; fromAgent: string; toAgent: string; text: string }
    | { id: string; type: 'file_analysis'; fileName: string; filePath: string; analysis: CodeAnalysis }
    | BuildStepMessage
    | InstallationRecommendationMessage;

export enum UserRole {
  Agent = 'AGENT',
  Assistant = 'ASSISTANT',
}

export interface User {
  email: string;
  isAdmin: boolean;
  role: UserRole;
}

export enum MainViewTab {
  IDE = 'STUDIO',
  Chatroom = 'CHATROOM',
  ImageGen = 'Image Gen',
  A2A = 'A2A',
  Automator = 'AUTOMATOR',
  Containers = 'CONTAINERS',
  Integrations = 'INTEGRATIONS',
  HISTORY = 'HISTORY',
  REALTIME = 'REALTIME',
  Admin = 'ADMIN',
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
}

export interface GithubFile {
    name: string;
    type: 'file' | 'dir';
    path: string;
    sha: string;
}

export interface GithubServiceType {
    getRepositories: () => Promise<GithubRepo[]>;
    commitFilesToRepo: (repo: string, commitMessage: string, fileTree: FileNode) => Promise<string>;
    getRepoContents: (repoName: string, path?: string) => Promise<GithubFile[]>;
    getRepoFileContent: (sha: string, repoName: string) => Promise<string>;
}

export interface ApiKeys {
    gemini: string;
    openai: string;
}

export interface ChatroomMessage {
    id: string;
    prompt: string;
    attachment?: { name: string; type: string; size: number };
    geminiResponse: string;
    openaiResponse: string;
    geminiSuggestions?: string[];
    openaiSuggestions?: string[];
    openaiAudioUrl?: string;
    geminiAudioUrl?: string;
    isOpenaiTtsLoading?: boolean;
    isGeminiTtsLoading?: boolean;
    isLoading: boolean;
}

export interface CodeAnalysis {
    summary: string;
    analysis: string;
    suggestions: string[];
}

export enum LogLevel {
    Info = 'info',
    Handoff = 'handoff',
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
    Trigger = 'trigger',
}

export interface LogEntry {
    id: string;
    timestamp: string;
    agent: string;
    event: string;
    detail: string;
    level: LogLevel;
    code_ref?: string;
}

export interface ContainerFile {
    id: string; // Corresponds to OpenAI File ID / Vector Store File ID
    name: string; // The filename
    created_at: number;
    bytes: number;
    status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

export interface Container {
    id: string; // vector store id
    object: 'vector_store';
    created_at: number;
    name: string;
    status: 'expired' | 'in_progress' | 'completed';
    bytes: number;
    // --- Local state, not from API list response ---
    files?: ContainerFile[];
    owner?: string;
    isLoadingFiles?: boolean;
    assistantId?: string; // Storing the associated assistant ID
    // --- Server simulation state ---
    serverState?: 'stopped' | 'installing' | 'running' | 'error' | null;
    serverLogs?: string[];
    npmScripts?: { [key: string]: string };
    envVars?: { [key: string]: string };
    predictedHtml?: string;
}

export interface ContainerTerminalLine {
    id: string;
    text: string;
    type: 'input' | 'output' | 'error' | 'help';
}


export interface AjenticState {
    enabled: boolean;
    concierge_mode: boolean;
    github: {
        last_push: string | null;
        repo: string;
        branch: string;
        last_commit: string;
    };
    google: {
        sheets_linked: boolean;
        drive_linked: boolean;
    };
}

export interface TerminalLine {
    id: string;
    text: string;
    type: 'input' | 'output' | 'error' | 'help';
}

export interface GeneratedImage {
    id: string;
    prompt: string;
    base64: string;
    createdAt: number;
}

export interface OpenAIFile {
  id: string;
  object: 'file';
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
  status?: 'uploaded' | 'processed' | 'error';
}

// --- OpenAI Computer Use Agent Types ---

export type ComputerUseEnvironment = 'browser' | 'mac' | 'windows' | 'ubuntu';

export interface ComputerUseTool {
    type: 'computer_use_preview';
    display_width: number;
    display_height: number;
    environment: ComputerUseEnvironment;
}

export type ComputerUseAction =
    | { type: 'click'; x: number; y: number; button?: 'left' | 'right' | 'middle'; }
    | { type: 'scroll'; x: number; y: number; scroll_x: number; scroll_y: number; }
    | { type: 'keypress'; keys: string[]; }
    | { type: 'type'; text: string; }
    | { type: 'wait'; }
    | { type: 'screenshot'; };

export interface ComputerCall {
    type: 'computer_call';
    id: string;
    call_id: string;
    action: ComputerUseAction;
    pending_safety_checks: any[];
    status: 'completed';
}

export interface ReasoningItem {
    type: 'reasoning';
    id: string;
    summary: { type: 'summary_text', text: string }[];
}

export interface TextItem {
    type: 'text';
    text: string;
}

export type ComputerUseResponseOutputItem = (ComputerCall | ReasoningItem | TextItem);

export interface ComputerUseResponse {
    id: string;
    output: ComputerUseResponseOutputItem[];
}

export interface ComputerAgentLog {
    id: string;
    timestamp: string;
    type: 'user' | 'reasoning' | 'action' | 'status' | 'error' | 'url';
    text: string;
}

export interface ComputerAgentSession {
    isRunning: boolean;
    prompt: string | null;
    logs: ComputerAgentLog[];
    currentHtml: string;
    currentUrl: string | null;
    lastResponseId: string | null;
}

// --- OpenAI Realtime Types ---
export enum RealtimeSessionStatus {
    IDLE = 'idle',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    ERROR = 'error',
    CLOSING = 'closing',
}

export interface RealtimeTranscriptItem {
    id: string;
    source: 'user' | 'ai';
    text: string;
    isFinal: boolean;
}

export interface RealtimeSession {
    status: RealtimeSessionStatus;
    transcript: RealtimeTranscriptItem[];
    errorDetails: string | null;
    isSpeaking: boolean;
    isAiControlEnabled: boolean;
}

export interface ParsedCommand {
    command: string;
    params: { [key: string]: any };
}

export interface CodeSnippet {
    title: string;
    description: string;
    code: string;
}

export interface AppContextType {
    user: User | null;
    files: FileNode;
    setFiles: React.Dispatch<React.SetStateAction<FileNode>>;
    activeFileId: string | null;
    setActiveFileId: (id: string | null) => void;
    activeFile: FileNode | null;
    updateActiveFileContent: (content: string) => void;
    findFileByPath: (path: string) => FileNode | null;
    messages: ChatMessage[];
    sendChatMessage: (text: string, file?: File) => void;
    resetChat: () => void;
    createNewNode: (type: FileType, parentPath?: string) => void;
    addFilesFromZip: (zipFile: File) => void;
    refreshPreview: () => void;
    previewKey: number;
    previewOverride: string | null;
    setPreviewOverride: (content: string | null) => void;
    previewDirectoryTree: (directoryPath: string) => void;
    githubRepos: GithubRepo[];
    commitToGithub: (repo: string, message: string) => Promise<string>;
    githubService: GithubServiceType;
    apiKeys: ApiKeys;
    setApiKeys: (keys: ApiKeys) => void;
    chatroomMessages: ChatroomMessage[];
    sendChatroomMessage: (prompt: string, file?: File) => void;
    logs: LogEntry[];
    addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
    ajenticState: AjenticState;
    setAjenticState: React.Dispatch<React.SetStateAction<AjenticState>>;
    runFileInPreview: (filePath: string) => void;
    dismissMessage: (id: string) => void;
    applyCodeSuggestion: (suggestion: string) => Promise<void>;
    applyBuildStep: (buildStepId: string) => Promise<void>;
    codexHistory: TerminalLine[];
    geminiHistory: TerminalLine[];
    handleTerminalCommand: (cli: 'codex' | 'gemini', command: string) => Promise<void>;
    generatedImages: GeneratedImage[];
    generateImages: (prompt: string) => Promise<void>;
    deleteGeneratedImage: (id: string) => void;
    containers: Container[];
    createOpenAIContainer: (name: string) => Promise<void>;
    deleteOpenAIContainer: (id: string) => Promise<void>;
    listContainerFiles: (containerId: string) => Promise<void>;
    uploadFileToContainer: (containerId: string, file: File | FileNode) => Promise<void>;
    uploadZipToContainer: (containerId: string, zipFile: File) => Promise<void>;
    refreshContainers: () => Promise<void>;
    selectedContainerId: string | null;
    selectContainer: (id: string | null) => void;
    containerTerminalHistory: { [key: string]: ContainerTerminalLine[] };
    handleContainerTerminalCommand: (containerId: string, command: string) => Promise<void>;
    installRecipeToContainer: (containerId: string, recipe: 'express') => Promise<void>;
    agentCliHistory: { [key: string]: ChatMessage[] };
    handleAgentCommand: (containerId: string, command: string) => Promise<void>;
    applyInstallationRecommendation: (containerId: string, messageId: string) => Promise<void>;
    openAIFiles: OpenAIFile[];
    fetchOpenAIFiles: (purpose?: string) => Promise<void>;
    uploadOpenAIFile: (file: File, purpose: string) => Promise<void>;
    deleteOpenAIFile: (fileId: string) => Promise<void>;
    getOpenAIFileContent: (fileId: string) => Promise<string | null>;
    downloadOpenAIFile: (file: OpenAIFile) => Promise<void>;
    downloadContainerFileToLocal: (containerId: string, fileId: string) => Promise<void>;
    computerAgentSession: ComputerAgentSession;
    startComputerAgentSession: (prompt: string) => Promise<void>;
    stopComputerAgentSession: () => void;
    realtimeSession: RealtimeSession;
    startRealtimeSession: () => Promise<void>;
    stopRealtimeSession: () => void;
    toggleAiControlMode: () => void;
    executeAiCommand: (command: ParsedCommand) => Promise<void>;
    
    // New Runtime functions
    detectScriptsInContainer: (containerId: string) => Promise<void>;
    runScriptInContainer: (containerId: string, scriptName: string) => Promise<void>;
    stopScriptInContainer: (containerId: string) => Promise<void>;
    updateContainerEnvVars: (containerId: string, envVars: { [key: string]: string; }) => Promise<void>;
    debugContainerWithAI: (containerId: string) => Promise<void>;
    generateContainerPreview: (containerId: string) => Promise<void>;

    // New File Tree Manipulation Functions
    deleteFileNode: (nodeId: string) => void;
    renameFileNode: (nodeId: string, newName: string) => void;
    moveFileNode: (draggedNodeId: string, targetNodeId: string) => void;
    duplicateFileNode: (nodeId: string) => void;
}