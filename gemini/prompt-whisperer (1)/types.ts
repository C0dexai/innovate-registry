
export interface PromptTemplate {
  name: string;
  category: string;
  system: string;
  userExample: string;
  modelExample: string;
  prompt: string;
  isWorkflow?: boolean;
}

export interface Variable {
  id: string;
  key: string;
  value: string;
}

export interface PromptSettings {
  systemInstruction: string;
  temperature: number;
  conciseness: 'default' | 'brief' | 'detailed';
  formality: 'default' | 'casual' | 'formal';
}

export interface Iteration {
  id: string;
  prompt: string;
  userExample: string;
  modelExample: string;
  fullPrompt: string; // Serialized contents sent to the API
  response: string;
  settings: PromptSettings;
  variables: Variable[];
  timestamp: string;
  bookmarked: boolean;
}

export interface VirtualFile {
  name: string;
  content: {
    prompt: string;
    userExample: string;
    modelExample: string;
    variables: Variable[];
    settings: PromptSettings;
  };
}


export interface AgentDefinition {
  role: string;
  verbs: string[];
}

export interface StepDefinition {
  id: number;
  name: string;
  agent: string;
  verb: string;
  input: string;
  output: string;
  handover_to: string;
}

export interface WorkflowDefinition {
  meta: {
    flow_name: string;
    flow_id?: number;
    owner: string;
    description: string;
  };
  agents: Record<string, AgentDefinition>;
  schedule?: {
    trigger: string;
    fallback_cron?: string;
  };
  steps: StepDefinition[];
}

export interface PreviewState {
  code: string;
  css: string;
  props: string; // Stored as a JSON string for easy editing
}