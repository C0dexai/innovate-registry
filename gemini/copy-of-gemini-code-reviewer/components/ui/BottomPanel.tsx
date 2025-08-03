import React, { useRef, useEffect, useState } from 'react';
import type { VFSFile, OpenFile, Agent, ChatMessage, BottomPanelTab, ConsoleEntry, Workflow } from '../../types.ts';
import { EyeIcon, TerminalIcon, UsersIcon, ChatBubbleLeftRightIcon, LightBulbIcon, BeakerIcon, QueueListIcon, ArrowsPointingOutIcon, MinusIcon, HomeIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, CodeBracketIcon } from './Icons.tsx';
import FeedbackDisplay from './FeedbackDisplay.tsx';
import ChatPanel from './ChatPanel.tsx';
import FamilyPanel from './FamilyPanel.tsx';
import Console from './Console.tsx';
// These will be created if needed, for now placeholders
// import InferenceStudioPanel from './InferenceStudioPanel.tsx';
// import OrchestrationPanel from './OrchestrationPanel.tsx';
import SourceControlPanel from './SourceControlPanel.tsx';

interface BottomPanelProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  vfs: VFSFile[];
  openFiles: OpenFile[];
  onCommitFile: (path: string, content: string, message: string) => void;
  activeAgent: Agent;
  onOpenFile: (path: string, sha?: string) => void;
  activeTab: BottomPanelTab;
  setActiveTab: (tab: BottomPanelTab) => void;
  feedback: string;
  isLoadingReview: boolean;
  reviewError: string | null;
  onApplySuggestion: (originalCode: string, suggestedCode: string) => void;
  activeFile: OpenFile | undefined;
  consoleHistory: ConsoleEntry[];
  onAddConsoleEntry: (entry: Omit<ConsoleEntry, 'id'>) => void;
  onClearConsole: () => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  isChatLoading: boolean;
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  activeAgentId: string;
  setActiveAgentId: (id: string) => void;
  workflows: Workflow[];
  setWorkflows: (workflows: Workflow[]) => void;
  onRunWorkflow: (workflowName: string, prompt: string) => void;
}

const BottomPanel: React.FC<BottomPanelProps> = (props) => {
  const { 
    isCollapsed, toggleCollapse, vfs, openFiles, onCommitFile, activeAgent,
    activeTab, setActiveTab, feedback, isLoadingReview, reviewError,
    onApplySuggestion, activeFile, consoleHistory, onAddConsoleEntry,
    onClearConsole, chatHistory, onSendMessage, onClearChat, isChatLoading,
    agents, setAgents, activeAgentId, setActiveAgentId,
  } = props;
  
  const tabs = [
    { id: 'source-control', label: 'Source Control', icon: CodeBracketIcon },
    { id: 'console', label: 'Gemini CLI', icon: TerminalIcon },
    { id: 'family', label: 'Family', icon: UsersIcon },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'review', label: 'AI Review', icon: LightBulbIcon },
    // { id: 'preview', label: 'Preview', icon: EyeIcon },
    // { id: 'inference', label: 'Inference', icon: BeakerIcon },
    // { id: 'orchestration', label: 'Orchestration', icon: QueueListIcon },
  ];
  
  const renderContent = () => {
    if (isCollapsed) return null;

    switch (activeTab) {
      case 'source-control':
        return (
          <SourceControlPanel
            openFiles={openFiles}
            onCommitFile={onCommitFile}
            activeFile={activeFile}
          />
        );
      case 'family':
        return (
          <FamilyPanel
            agents={agents}
            setAgents={setAgents}
            activeAgentId={activeAgentId}
            setActiveAgentId={setActiveAgentId}
            setActiveTab={setActiveTab}
          />
        );
      case 'chat':
        return (
          <ChatPanel 
            agent={activeAgent}
            history={chatHistory}
            isLoading={isChatLoading}
            onSendMessage={onSendMessage}
            onClearChat={onClearChat}
          />
        );
      case 'review':
        return (
            <FeedbackDisplay 
                feedback={feedback}
                isLoading={isLoadingReview}
                error={reviewError}
                onApplySuggestion={onApplySuggestion}
                activeFile={activeFile}
            />
        );
      case 'console':
      default:
        return (
            <Console 
                activeAgent={activeAgent} 
                history={consoleHistory}
                onAddConsoleEntry={onAddConsoleEntry}
                onClearConsole={onClearConsole}
                agents={agents}
                setActiveAgentId={setActiveAgentId}
                setActiveTab={setActiveTab}
            />
        );
    }
  };
  
  return (
    <div className="bg-slate-900 h-full flex flex-col border-t border-slate-700">
      <div className="flex items-center justify-between p-2 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center bg-slate-800 rounded-lg p-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BottomPanelTab)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 flex-shrink-0 ${activeTab === tab.id ? 'bg-violet-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
              aria-pressed={activeTab === tab.id}
              title={tab.label}
            >
              <tab.icon className="w-4 h-4" />
              {!isCollapsed && tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-md hover:bg-slate-700 text-slate-400"
          title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          {isCollapsed ? <ArrowsPointingOutIcon className="w-5 h-5" /> : <MinusIcon className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex-grow overflow-auto bg-slate-800">
        {renderContent()}
      </div>
    </div>
  );
};

export default BottomPanel;
