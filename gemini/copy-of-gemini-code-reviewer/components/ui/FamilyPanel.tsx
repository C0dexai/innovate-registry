import React, { useState } from 'react';
import { Agent, BottomPanelTab, Tool } from '../../types.ts';
import { AgentIcon } from './AgentIcon.tsx';
import { XMarkIcon, WrenchScrewdriverIcon, PlusCircleIcon, TrashIcon, ChatBubbleLeftRightIcon, PencilSquareIcon } from './Icons.tsx';

// This needs to be defined here or imported if it were in a separate file
const generateSystemPrompt = (agent: Omit<Agent, 'systemPrompt' | 'id' | 'provider'>): string => {
  const toolDescriptions = agent.tools.map(tool => `- **${tool.name}:** ${tool.use}`).join('\n');
  return `You are ${agent.name}, a specialized AI agent.\n\n**Role:** ${agent.role}\n**Voice Configuration:** ${agent.voice}\n\nYour capabilities are defined by the following tools:\n${toolDescriptions}\n\nBased on your role and tools, provide expert assistance. Adhere to your persona and leverage your specified capabilities to answer user prompts.`;
};


interface AgentEditorProps {
    agent: Agent;
    onSave: (agent: Agent) => void;
    onCancel: () => void;
}

const AgentEditor: React.FC<AgentEditorProps> = ({ agent, onSave, onCancel }) => {
    const [currentAgent, setCurrentAgent] = useState<Agent>(JSON.parse(JSON.stringify(agent)));

    const handleFieldChange = (field: keyof Omit<Agent, 'tools' | 'id' | 'provider'>, value: string) => {
        setCurrentAgent(prev => ({...prev, [field]: value}));
    };
    
    const handleToolChange = (index: number, field: keyof Tool, value: string) => {
        const newTools = [...currentAgent.tools];
        newTools[index] = {...newTools[index], [field]: value};
        setCurrentAgent(prev => ({...prev, tools: newTools}));
    };

    const addTool = () => {
        setCurrentAgent(prev => ({...prev, tools: [...prev.tools, { name: '', use: ''}]}));
    }

    const removeTool = (index: number) => {
        setCurrentAgent(prev => ({...prev, tools: prev.tools.filter((_, i) => i !== index)}));
    }

    const handleGeneratePrompt = () => {
        const newPrompt = generateSystemPrompt(currentAgent);
        setCurrentAgent(prev => ({ ...prev, systemPrompt: newPrompt }));
    };

    return (
        <div className="p-4 bg-slate-900 overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-100">Edit Agent: {agent.name}</h2>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-700"><XMarkIcon className="w-6 h-6"/></button>
            </div>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                    <input type="text" value={currentAgent.name} onChange={(e) => handleFieldChange('name', e.target.value)} className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                    <input type="text" value={currentAgent.role} onChange={(e) => handleFieldChange('role', e.target.value)} className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Voice</label>
                    <input type="text" value={currentAgent.voice} onChange={(e) => handleFieldChange('voice', e.target.value)} className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"/>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-slate-200 mb-2 flex items-center gap-2"><WrenchScrewdriverIcon className="w-5 h-5 text-slate-400"/>Tools</h3>
                    <div className="space-y-2">
                        {currentAgent.tools.map((tool, index) => (
                            <div key={index} className="flex gap-2 p-2 bg-slate-800 rounded-md border border-slate-700">
                                <input type="text" value={tool.name} onChange={e => handleToolChange(index, 'name', e.target.value)} placeholder="Tool Name" className="w-1/3 bg-slate-700 text-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"/>
                                <input type="text" value={tool.use} onChange={e => handleToolChange(index, 'use', e.target.value)} placeholder="Tool Use Description" className="flex-grow bg-slate-700 text-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"/>
                                <button onClick={() => removeTool(index)} className="p-1 text-red-500 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addTool} className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-violet-300 hover:text-white hover:bg-violet-900/50 border border-dashed border-slate-600">
                        <PlusCircleIcon className="w-5 h-5"/> Add Tool
                    </button>
                </div>
                <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-300">System Prompt</label>
                        <button onClick={handleGeneratePrompt} className="text-xs text-violet-400 hover:text-violet-300 font-semibold">Generate from Profile</button>
                    </div>
                    <textarea value={currentAgent.systemPrompt} onChange={(e) => handleFieldChange('systemPrompt', e.target.value)} rows={8} className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"/>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 sticky bottom-0 py-2 bg-slate-900">
                <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-600">Cancel</button>
                <button onClick={() => onSave(currentAgent)} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700">Save Changes</button>
            </div>
        </div>
    );
};


interface FamilyPanelProps {
    agents: Agent[];
    setAgents: (agents: Agent[]) => void;
    activeAgentId: string;
    setActiveAgentId: (id: string) => void;
    setActiveTab: (tab: BottomPanelTab) => void;
}

const FamilyPanel: React.FC<FamilyPanelProps> = ({ agents, setAgents, activeAgentId, setActiveAgentId, setActiveTab }) => {
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

    const handleSaveAgent = (agentToSave: Agent) => {
        setAgents(agents.map(a => a.id === agentToSave.id ? agentToSave : a));
        setEditingAgent(null);
    };

    const handleChatClick = (agentId: string) => {
        setActiveAgentId(agentId);
        setActiveTab('chat');
    }

    if (editingAgent) {
        return <AgentEditor agent={editingAgent} onSave={handleSaveAgent} onCancel={() => setEditingAgent(null)} />;
    }

    const nonReviewerAgents = agents.filter(a => a.name !== 'Code Reviewer');

    return (
        <div className="p-4 overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-4">AI Family</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {nonReviewerAgents.map(agent => (
                    <div key={agent.id} className={`bg-slate-900 p-4 rounded-lg border flex flex-col justify-between transition-all duration-200 ${activeAgentId === agent.id ? 'border-violet-500 shadow-lg shadow-violet-500/10' : 'border-slate-700/50 hover:border-slate-600'}`}>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700/50 flex-shrink-0">
                                    <AgentIcon agent={agent} className="w-6 h-6 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-100">{agent.name}</h3>
                                    <p className="text-xs text-slate-400">{agent.role}</p>
                                </div>
                            </div>
                            <div className="text-sm text-slate-400 space-y-1 mt-3">
                                {agent.tools.slice(0, 2).map((tool, index) => (
                                    <p key={index} className="truncate" title={tool.use}>- {tool.use}</p>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/50">
                            <button 
                                onClick={() => setActiveAgentId(agent.id)}
                                disabled={activeAgentId === agent.id}
                                className="flex-1 px-3 py-1.5 rounded-md text-xs font-semibold disabled:bg-violet-500 disabled:text-white bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                            >
                                {activeAgentId === agent.id ? 'Active' : 'Set Active'}
                            </button>
                             <button onClick={() => handleChatClick(agent.id)} title="Chat" className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"><ChatBubbleLeftRightIcon className="w-4 h-4"/></button>
                            <button onClick={() => setEditingAgent(agent)} title="Edit" className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"><PencilSquareIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FamilyPanel;
