
import React from 'react';
import { ShieldCheckIcon } from './icons';

const AgentStatus: React.FC = () => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="relative">
        <ShieldCheckIcon className="w-6 h-6 text-[var(--color-primary)]" />
        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--color-background)]"></span>
      </div>
      <div>
        <p className="font-bold text-white">Orchestrator Agent</p>
        <p className="text-[var(--color-text-muted)]">System Status: Nominal</p>
      </div>
    </div>
  );
};

export default AgentStatus;
