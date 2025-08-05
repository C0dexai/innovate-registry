import React from 'react';
import { AiIcon } from './icons/AiIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface FooterProps {
  apiStatus: 'Idle' | 'Busy' | 'Error';
}

const Footer: React.FC<FooterProps> = ({ apiStatus }) => {
  const getStatusIndicator = () => {
    switch(apiStatus) {
      case 'Busy':
        return <span className="text-neon-yellow flex items-center gap-1"><SpinnerIcon className="w-4 h-4 animate-spin"/> Busy</span>;
      case 'Error':
        return <span className="text-brand-secondary">Error</span>;
      case 'Idle':
      default:
        return <span className="text-neon-green flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> Idle</span>;
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-dark-base-200/80 backdrop-blur-xl text-dark-base-content border-t border-brand-primary/50 h-12" style={{boxShadow: '0 0 25px rgba(0, 191, 255, 0.4)'}}>
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <AiIcon className="w-5 h-5 text-brand-primary" />
          <div className="flex items-center gap-2 border-r border-dark-base-300 pr-3">
            <span>AGENT_SUPERVISOR:</span>
            <span className="font-bold text-dark-base-content">Project_Initiator_01</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span>STATUS:</span>
            <span className="font-bold text-neon-green">Nominal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>AI Core:</span>
          <span className="font-bold">{getStatusIndicator()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;