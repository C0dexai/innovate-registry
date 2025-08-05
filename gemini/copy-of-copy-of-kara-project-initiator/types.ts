
export interface GithubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
  };
  html_url: string;
  description: string;
  default_branch: string;
}

export interface GithubTreeItem {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}

export interface GithubTree {
  sha: string;
  url: string;
  tree: GithubTreeItem[];
  truncated: boolean;
}

export interface GithubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file';
  content: string; // base64 encoded
  encoding: 'base64';
}

export interface GithubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null; // author can be null
  html_url: string;
}

export interface ActivityLog {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

// For rendering file explorer
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  children?: { [key: string]: FileTreeNode };
}

export interface Agent {
    name: string;
    role: string;
}

export interface ProjectDetails {
    templateId: string;
    overview: {
        projectName: string;
        projectType: string;
        description: string;
        duration: string;
        teamSize: number;
    };
    user: {
        methodology: string;
        goals: string;
        hasStrictDeadlines: boolean;
        budget: string;
        techStack: string[];
        securityEmphasis: number;
        uxFocus: string;
        outputDetailLevel: string;
        excludePhases: string[];
    };
    ai: {
        formality: number;
        conciseness: number;
        riskAversion: number;
        industryFocus: string;
        innovationVsStability: number;
        proposeTooling: boolean;
    };
    system: {
        jiraIntegration: { enabled: boolean; apiKey: string; projectId: string };
        githubIntegration: { enabled: boolean; apiKey: string; orgName: string };
        slackNotifications: { enabled: boolean; webhookUrl: string };
        defaultCloudProvider: string;
        dataRetentionPolicy: string;
        logLevel: string;
    };
    agents?: Agent[];
}

export interface WorkflowPhase {
    agentName?: string;
    phaseName: string;
    description: string;
    activities: string[];
    suggestedTools?: string[];
}

export interface Workflow {
    projectName: string;
    workflow: WorkflowPhase[];
}

export interface LivePreviewComponent {
    name: string;
    description: string;
    elements: string[];
}

export interface LivePreviewLayout {
    layoutType: string;
    theme: {
        mode: 'light' | 'dark';
        primaryColor: string;
        font: string;
    };
    components: LivePreviewComponent[];
}

export interface GeneratedCode {
    html: string;
    css: string;
    js: string;
}
