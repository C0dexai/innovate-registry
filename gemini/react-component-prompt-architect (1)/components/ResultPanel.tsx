import React, { useState, useEffect } from 'react';
import OutputSection from './OutputSection';
import PreviewSection from './PreviewSection';
import type { FullPromptState } from '../types';

interface ResultPanelProps {
  prompt: string;
  onBuild: () => void;
  isBuilding: boolean;
  componentCode: string;
  promptState: FullPromptState;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ prompt, onBuild, isBuilding, componentCode, promptState }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'preview'>('prompt');

  useEffect(() => {
    if (isBuilding) {
      setActiveTab('preview');
    }
  }, [isBuilding]);

  const TabButton = ({ id, label }: { id: 'prompt' | 'preview'; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
        activeTab === id
          ? 'border-[var(--color-primary)] text-white'
          : 'border-transparent text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-text-muted)]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full glass-card rounded-lg border-[var(--border-color)]">
      <div className="flex-shrink-0 border-b border-[var(--border-color)] pl-2">
        <TabButton id="prompt" label="Generated Prompt" />
        <TabButton id="preview" label="Component Preview" />
      </div>
      <div className="flex-grow p-4 overflow-hidden">
        <div className={`h-full ${activeTab === 'prompt' ? '' : 'hidden'}`}>
             <OutputSection prompt={prompt} onBuild={onBuild} isBuilding={isBuilding} />
        </div>
        <div className={`h-full ${activeTab === 'preview' ? '' : 'hidden'}`}>
            <PreviewSection 
              componentCode={componentCode} 
              isBuilding={isBuilding} 
              promptState={promptState}
            />
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;