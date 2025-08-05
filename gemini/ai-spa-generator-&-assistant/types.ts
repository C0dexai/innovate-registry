
import React from 'react';

export type Agent = 'lyra' | 'kara';

export type FileContents = Record<string, string>;

export interface AIResponse {
  previewContent: string;
  codeContent: string;
}

export interface AIResponseWithSuggestions extends AIResponse {
    suggestions: string[];
}

export type ActiveTab = 'preview' | 'code';

export type AiProvider = 'gemini' | 'openai';

export interface GenerationSettings {
  provider: AiProvider;
  temperature: number;
}

export interface HistoryItem {
  id: number;
  prompt: string;
  response: AIResponse;
  fileName: string;
  fileContent: string;
  timestamp: string;
  agent: Agent;
}

// GitHub Integration Types
export interface GitHubNode {
  path: string;
  type: 'tree' | 'blob';
  name:string;
  children?: GitHubNode[];
}

export interface ActiveFile {
    path:string;
    content: string;
    sha: string;
}