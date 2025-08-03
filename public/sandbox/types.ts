export type FileSystemState = Record<string, string>;

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string; // For user message, system message, or model's brief conversational text
  explanation?: string; // For model's detailed explanation of code, formatted in markdown
  code?: { path: string; content: string; }[]; // Can contain updates for multiple files
}

export interface DraggableComponent {
  id: string;
  name: string;
  html: string;
}

export interface GithubRepo {
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
}

export interface GithubBranch {
  name: string;
  commit: {
    sha: string;
  };
}

export interface GithubUser {
    login: string;
    avatar_url: string;
    html_url: string;
}

export interface FileChange {
  path: string;
  status: 'modified' | 'added' | 'deleted';
}

export interface TerminalLine {
  id: string;
  command: string;
  stdout?: string;
  stderr?: string;
  cwd: string;
}

export interface FileSystemChangeAction {
  action: 'create' | 'update' | 'delete';
  path: string;
  content?: string; // only for create/update
}

export interface TerminalExecutionResult {
    stdout: string;
    stderr: string;
    newCurrentDirectory: string;
    fileSystemChanges: FileSystemChangeAction[];
}