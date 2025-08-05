
import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../types';
import { CreativeIcon, TechnicalIcon, CheckIcon } from './icons';

interface AgentSelectorProps {
  selectedAgent: Agent;
  onAgentChange: (agent: Agent) => void;
  disabled: boolean;
}

const AGENT_CONFIG = {
  lyra: {
    name: 'Lyra',
    description: 'Creative Assistant',
    Icon: CreativeIcon,
    color: 'text-neon-pink',
    shadow: 'hover:shadow-glow-pink',
    border: 'border-neon-pink/50'
  },
  kara: {
    name: 'Kara',
    description: 'Technical Analyst',
    Icon: TechnicalIcon,
    color: 'text-neon-green',
    shadow: 'hover:shadow-glow-green',
    border: 'border-neon-green/50'
  },
};

const AgentSelector: React.FC<AgentSelectorProps> = ({ selectedAgent, onAgentChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedConfig = AGENT_CONFIG[selectedAgent];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);


  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-center p-3 px-4 bg-neon-input text-text-main rounded-md font-semibold transition-all duration-200 border ${selectedConfig.border} ${selectedConfig.shadow} disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`Current Agent: ${selectedConfig.name} - ${selectedConfig.description}`}
      >
        <selectedConfig.Icon className={`mr-2 ${selectedConfig.color}`} />
        <span className="hidden sm:inline">{selectedConfig.name}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-neon-panel border border-neon-border rounded-lg shadow-lg z-20">
          <div className="p-2">
            <p className="text-xs text-text-main/70 px-2 pb-1">Select Agent</p>
            {Object.entries(AGENT_CONFIG).map(([key, config]) => {
              const agentKey = key as Agent;
              const isSelected = selectedAgent === agentKey;
              return (
                <button
                  key={key}
                  onClick={() => {
                    onAgentChange(agentKey);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center text-left p-2 rounded-md hover:bg-neon-input/50 ${isSelected ? 'bg-neon-input/70' : ''}`}
                >
                  <config.Icon className={`mr-3 flex-shrink-0 ${config.color}`} />
                  <div className="flex-grow">
                    <p className="font-semibold text-sm text-text-main">{config.name}</p>
                    <p className="text-xs text-text-main/70">{config.description}</p>
                  </div>
                  {isSelected && <CheckIcon className="w-4 h-4 text-primary ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSelector;
