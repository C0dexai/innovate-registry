
import React from 'react';

export interface Agent {
  name: string;
  gender: 'Male' | 'Female';
  role: string;
  skills: string[];
  voice_style: string;
  personality: string;
  personality_prompt: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface WorkflowTopic {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  details: string[];
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

export interface CuaAction {
  thought: string;
  action_type: 'click' | 'type' | 'scroll' | 'wait' | 'done';
  coordinates?: { x: number; y: number }; // Percentage 0-1
  text_to_type?: string;
  scroll_direction?: 'up' | 'down' | 'left' | 'right';
  duration_ms?: number;
  summary?: string;
}

export type ViewType = 'workflow' | 'explorer' | 'operator' | 'orchestrator' | string;