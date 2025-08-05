import React, { useState } from 'react';
import Editor from "@monaco-editor/react";
import { SpinnerIcon, LightbulbIcon, HistoryIcon, GitCommitIcon, CreativeIcon, TechnicalIcon, OrchestrationIcon } from './icons';
import { GenerationSettings, AiProvider, HistoryItem, ActiveFile, Agent } from '../types';
import AgentSelector from './AgentSelector';

type MainTab = 'editor' | 'inference';
type InferenceTab = 'settings' | 'activity' | 'orchestration';

interface CentralPanelProps {
  activeFile: ActiveFile | null;
  editorContent: string;
  onEditorChange: (value: string | undefined) => void;
  isEditorDirty: boolean;
  onCommit: (message: string) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onSuggest: () => void;
  isSuggesting: boolean;
  examplePrompts: string[];
  onExamplePromptClick: (prompt: string) => void;
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
  history: HistoryItem[];
  onRestoreHistory: (item: HistoryItem) => void;
  agent: Agent;
  onAgentChange: (agent: Agent) => void;
  activeMainTab: MainTab;
  setActiveMainTab: (tab: MainTab) => void;
  activeInferenceTab: InferenceTab;
  setActiveInferenceTab: (tab: InferenceTab) => void;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'text-primary border-b-2 border-primary' : 'text-text-main/70 hover:bg-neon-input/50 hover:text-text-main'}`} style={{ textShadow: isActive ? '0 0 5px #00f6ff' : 'none' }}>{label}</button>
);

const SubTabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${isActive ? 'bg-neon-pink text-dark shadow-glow-pink' : 'bg-neon-panel text-text-main/80 hover:bg-neon-pink/20 hover:text-neon-pink'}`}>{label}</button>
);

const PROMPTS_PER_PAGE = 3;

const CommitModal: React.FC<{ onCommit: (message: string) => void; onClose: () => void; }> = ({ onCommit, onClose }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (message.trim()) {
            onCommit(message);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-neon-panel border border-neon-purple rounded-lg p-6 w-full max-w-md shadow-lg shadow-neon-purple/20">
                <h3 className="text-xl font-bold text-primary mb-4">Commit Changes</h3>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter commit message..."
                    className="w-full h-24 p-3 bg-neon-input border border-neon-border rounded-md text-text-input placeholder-text-main/50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                />
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-neon-input text-text-main rounded-md font-semibold hover:bg-neon-input/70">Cancel</button>
                    <button onClick={handleSubmit} disabled={!message.trim()} className="px-4 py-2 bg-primary text-dark rounded-md font-bold hover:shadow-glow-blue disabled:bg-gray-500 disabled:cursor-not-allowed">Commit</button>
                </div>
            </div>
        </div>
    );
};

const CentralPanel: React.FC<CentralPanelProps> = (props) => {
  const { 
    activeFile, editorContent, onEditorChange, isEditorDirty, onCommit, 
    prompt, onPromptChange, onGenerate, isLoading, onSuggest, isSuggesting, 
    examplePrompts, onExamplePromptClick, settings, onSettingsChange, history, 
    onRestoreHistory, agent, onAgentChange, activeMainTab, setActiveMainTab, 
    activeInferenceTab, setActiveInferenceTab 
  } = props;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showCommitModal, setShowCommitModal] = useState(false);
  
  const totalPages = Math.ceil(examplePrompts.length / PROMPTS_PER_PAGE);
  const currentPrompts = examplePrompts.slice((currentPage - 1) * PROMPTS_PER_PAGE, currentPage * PROMPTS_PER_PAGE);

  const handleNextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  const handleHistoryClick = (item: HistoryItem) => {
    onRestoreHistory(item);
    setActiveMainTab('editor');
  };

  const handleFinalCommit = (message: string) => {
      onCommit(message);
      setShowCommitModal(false);
  };

  const renderEditor = () => (
    <div className="flex-grow flex flex-col bg-neon-input rounded-b-md rounded-r-md overflow-hidden relative">
      {showCommitModal && <CommitModal onCommit={handleFinalCommit} onClose={() => setShowCommitModal(false)} />}
      <div className="flex justify-between items-center py-2 px-4 bg-neon-panel border-b border-neon-border flex-shrink-0">
        <h2 className="text-md font-semibold text-primary">Editor</h2>
        {activeFile ? (
            <div className="flex items-center gap-4">
                <span className="text-sm text-text-main">{activeFile.path}</span>
                <button
                    onClick={() => setShowCommitModal(true)}
                    disabled={!isEditorDirty || isLoading}
                    className="flex items-center gap-2 px-3 py-1 text-xs bg-neon-green text-dark rounded-md font-bold transition-all duration-200 hover:shadow-glow-green disabled:bg-gray-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <GitCommitIcon />
                    Commit
                </button>
            </div>
        ) : (
             <span className="text-sm text-text-main/60">No file selected</span>
        )}
      </div>
      <Editor
        height="100%"
        language={activeFile?.path.split('.').pop() ?? 'plaintext'}
        value={editorContent}
        onChange={onEditorChange}
        theme="vs-dark"
        options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
        }}
        onMount={(editor, monaco) => {
            monaco.editor.defineTheme('neon-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': '#1a1a1a',
                },
            });
            monaco.editor.setTheme('neon-dark');
        }}
      />
    </div>
  );
  
  const renderInferencePanel = () => (
    <div className="flex-grow flex flex-col bg-neon-input rounded-b-md rounded-r-md overflow-hidden p-4 text-text-main">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold text-primary">Inference & Orchestration</h2>
            <div className="flex items-center gap-2 p-1 bg-neon-panel/50 rounded-lg">
                <SubTabButton label="Settings" isActive={activeInferenceTab === 'settings'} onClick={() => setActiveInferenceTab('settings')} />
                <SubTabButton label="Activity Log" isActive={activeInferenceTab === 'activity'} onClick={() => setActiveInferenceTab('activity')} />
                 <SubTabButton label="Orchestration" isActive={activeInferenceTab === 'orchestration'} onClick={() => setActiveInferenceTab('orchestration')} />
            </div>
        </div>
        {activeInferenceTab === 'settings' ? renderSettingsContent() : activeInferenceTab === 'activity' ? renderActivityLogContent() : renderOrchestrationContent()}
    </div>
  );

  const renderSettingsContent = () => (
     <div className="space-y-6">
        <div>
            <label htmlFor="ai-provider" className="block text-sm font-medium mb-1 text-neon-purple">AI Provider</label>
            <select id="ai-provider" value={settings.provider} onChange={(e) => onSettingsChange({ ...settings, provider: e.target.value as AiProvider })} className="w-full p-2 bg-neon-panel border border-neon-border rounded-md outline-none focus:ring-2 focus:ring-primary">
                <option value="gemini">Gemini</option>
                <option value="openai" disabled>OpenAI (Coming Soon)</option>
            </select>
            <p className="text-xs text-text-main/60 mt-1">Only Gemini is currently supported. The API key is managed by the platform.</p>
        </div>
        <div>
            <label htmlFor="temperature" className="block text-sm font-medium mb-1 text-neon-purple">Temperature: <span className="font-bold text-primary">{settings.temperature.toFixed(1)}</span></label>
            <input type="range" id="temperature" min="0" max="1" step="0.1" value={settings.temperature} onChange={(e) => onSettingsChange({ ...settings, temperature: parseFloat(e.target.value)})} className="w-full h-2 bg-neon-panel rounded-lg appearance-none cursor-pointer accent-primary" />
            <p className="text-xs text-text-main/60 mt-1">Lower values for more predictable, code-like output.</p>
        </div>
    </div>
  );
  
  const renderActivityLogContent = () => (
    <div className="h-full overflow-y-auto">
        {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-main/70">
                <HistoryIcon className="w-10 h-10 mb-2" />
                <p className="font-semibold">No Activity Yet</p>
                <p className="text-sm">Your generated prompts will appear here.</p>
            </div>
        ) : (
            <div className="space-y-2">
                {history.map(item => (
                    <button key={item.id} onClick={() => handleHistoryClick(item)} className="w-full text-left p-2.5 bg-neon-panel border border-neon-border rounded-md cursor-pointer transition-all duration-200 hover:bg-neon-input/50 hover:border-neon-pink/50">
                        <div className="flex items-center gap-2">
                           {item.agent === 'lyra' ? <CreativeIcon className="w-4 h-4 text-neon-pink flex-shrink-0" /> : <TechnicalIcon className="w-4 h-4 text-neon-green flex-shrink-0" />}
                           <p className="text-sm font-semibold truncate text-white" title={item.prompt}>{item.prompt}</p>
                        </div>
                        <div className="flex justify-between items-center mt-1.5 text-xs text-text-main/60 pl-6">
                            <span>{item.fileName}</span>
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                    </button>
                ))}
            </div>
        )}
    </div>
  );

  const renderOrchestrationContent = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-main/70">
        <OrchestrationIcon className="w-10 h-10 mb-4 text-neon-purple" />
        <h3 className="text-lg font-semibold text-white">Cross-Domain Orchestration</h3>
        <p className="text-sm max-w-sm mt-2">This panel will allow you to coordinate tasks and synchronize knowledge between different project domains and AI agents.</p>
        <p className="text-xs text-text-main/50 mt-4">Feature in development.</p>
    </div>
);

  return (
    <section className="bg-neon-panel backdrop-blur-sm border border-neon-border rounded-lg p-2.5 flex flex-col gap-2.5 min-w-0 shadow-lg shadow-neon-purple/10">
       <div className="border-b border-neon-border/50">
            <TabButton label="Editor" isActive={activeMainTab === 'editor'} onClick={() => setActiveMainTab('editor')} />
            <TabButton label="Inference" isActive={activeMainTab === 'inference'} onClick={() => setActiveMainTab('inference')} />
       </div>
      <div className="flex-grow flex flex-col min-h-0">
        {activeMainTab === 'editor' ? renderEditor() : renderInferencePanel()}
      </div>
      
      <div className="flex gap-2.5 flex-shrink-0 mt-2.5">
        <input id="prompt-input" type="text" value={prompt} onChange={(e) => onPromptChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading && prompt.trim()) { e.preventDefault(); onGenerate(); } }} placeholder="Ask the AI to do something..." disabled={!activeFile} className="flex-grow p-3 bg-neon-input border border-neon-border rounded-md text-text-input placeholder-text-main/50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50" />
        <AgentSelector selectedAgent={agent} onAgentChange={onAgentChange} disabled={isLoading || isSuggesting || !activeFile} />
        <button onClick={onSuggest} disabled={isLoading || isSuggesting || !activeFile} className="flex items-center justify-center p-3 px-4 bg-neon-input text-neon-pink rounded-md font-semibold transition-all duration-200 border border-neon-pink/50 hover:bg-neon-pink/20 hover:shadow-glow-pink disabled:opacity-50 disabled:cursor-not-allowed" title="Suggest a prompt">
            {isSuggesting ? <SpinnerIcon /> : <LightbulbIcon />}
        </button>
        <button onClick={onGenerate} disabled={isLoading || !prompt.trim() || isSuggesting || !activeFile} className="flex items-center justify-center p-3 px-6 bg-primary text-dark rounded-md font-bold transition-all duration-200 hover:shadow-glow-blue disabled:bg-gray-500 disabled:cursor-not-allowed">
          {isLoading ? <SpinnerIcon /> : 'Generate'}
        </button>
      </div>
      <div className="bg-neon-input rounded-md p-3 flex-shrink-0 mt-2.5 max-h-[180px] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold text-neon-green" style={{textShadow: '0 0 4px #39ff14'}}>Example Prompts</h3>
            <div className="flex items-center gap-2">
                <span className="text-xs text-text-main/70">Page {currentPage} of {totalPages}</span>
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-2 py-0.5 bg-neon-panel rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20">&lt;</button>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-2 py-0.5 bg-neon-panel rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20">&gt;</button>
            </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {currentPrompts.map((p, i) => ( <div key={i} onClick={() => onExamplePromptClick(p)} className="p-2 bg-neon-panel border border-neon-border rounded-md cursor-pointer text-sm truncate transition-colors duration-200 hover:bg-neon-input/50 hover:border-neon-green/50" title={p}>{p}</div> ))}
        </div>
      </div>
    </section>
  );
};

export default CentralPanel;