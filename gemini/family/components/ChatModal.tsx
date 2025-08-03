import React from 'react';
import { Agent } from '../types';
import AgentView from './AgentView';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, agent }) => {
  if (!isOpen || !agent) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-red-600/30 rounded-lg shadow-2xl shadow-red-900/50 w-full max-w-6xl h-[90vh] flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-6 md:p-8 h-full">
            <AgentView agent={agent} />
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
