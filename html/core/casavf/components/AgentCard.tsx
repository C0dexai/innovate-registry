import React from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 flex flex-col h-full transform transition-all duration-300 hover:scale-105 hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-red-500/10">
      <div className="flex-grow">
        <h3 className={`text-2xl font-bold uppercase ${agent.name === 'Kara' ? 'kara-glow text-red-500' : 'text-white'}`}>{agent.name}</h3>
        <p className="text-red-400 font-light mt-1">{agent.role}</p>
        <p className="text-neutral-400 font-light mt-4 italic text-sm">{agent.personality}</p>
      </div>
      <button 
        onClick={() => onSelect(agent)}
        className="mt-6 w-full bg-red-700 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 uppercase tracking-wider"
      >
        Talk to {agent.name}
      </button>
    </div>
  );
};

export default AgentCard;
