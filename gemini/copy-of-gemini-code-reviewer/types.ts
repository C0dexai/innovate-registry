export interface Tool {
  name: string;
  use: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  voice: string;
  tools: Tool[];
  systemPrompt: string;
  provider: 'gemini' | 'openai' | 'custom';
}

export interface ConsoleEntry {
  id: string;
  type: 'command' | 'response' | 'error' | 'system';
  text: string;
  prompt?: string;
  agent?: Agent;
  lastCodeBlock?: string;
}

export type OpenFile = {
  id: string;
  path: string;
  name: string;
  content: string;
  sha: string;
  isDirty: boolean;
};

export type VFSFile = {
  path: string;
  content: string;
};

export type ChatMessage = {
  id:string;
  role: 'user' | 'model';
  text: string;
};

export type BottomPanelTab = 'console' | 'chat' | 'review' | 'source-control' | 'orchestration' | 'inference' | 'family';

export type WorkflowStep = {
  agentId: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
};

export interface GitTreeFile {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
    url: string;
}

export interface FileTreeNode {
    name: string;
    path: string;
    type: 'blob' | 'tree';
    sha?: string;
    children?: FileTreeNode[];
}

export interface RepoDetails {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    default_branch: string;
}

export interface Suggestion {
  id: string;
  heading: string;
  description: string;
  originalCode?: string;
  suggestedCode?: string;
  language?: string;
}
