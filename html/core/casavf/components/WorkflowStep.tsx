
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import CodeBlock from './CodeBlock';

type Status = 'pending' | 'running' | 'complete' | 'error';

interface WorkflowStepProps {
  phase: number;
  agentName: string;
  agentRole: string;
  fileName: string;
  status: Status;
  content: string;
  language: string;
}

const StatusIndicator: React.FC<{ status: Status }> = ({ status }) => {
  const baseClasses = "text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border";
  switch (status) {
    case 'complete':
      return <span className={`${baseClasses} bg-green-900/50 text-green-400 border-green-700`}>Complete</span>;
    case 'running':
      return <span className={`${baseClasses} bg-blue-900/50 text-blue-400 border-blue-700`}>In Progress</span>;
    case 'error':
      return <span className={`${baseClasses} bg-yellow-900/50 text-yellow-400 border-yellow-700`}>Error</span>;
    case 'pending':
    default:
      return <span className={`${baseClasses} bg-slate-700 text-slate-400 border-slate-600`}>Pending</span>;
  }
};

const WorkflowStep: React.FC<WorkflowStepProps> = ({ phase, agentName, agentRole, fileName, status, content, language }) => {
  const isComplete = status === 'complete';
  const isRunning = status === 'running';
  
  const stepOpacity = (status === 'pending' && 'opacity-50');

  return (
    <div className={`relative pl-10 py-4 border-l-2 border-slate-700 transition-opacity duration-500 ${stepOpacity}`}>
      <div className="absolute -left-[11px] top-6 h-5 w-5 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
         <div className={`h-3 w-3 rounded-full transition-colors duration-500 ${isComplete ? 'bg-red-500' : 'bg-slate-600'} ${isRunning ? 'bg-blue-400 animate-pulse' : ''}`}></div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white uppercase">{`Phase ${phase}: ${agentName}`}</h3>
          <p className="text-sm text-red-400 font-light">{agentRole} &rarr; <span className="font-mono text-neutral-400">{fileName}</span></p>
        </div>
        <StatusIndicator status={status} />
      </div>
      
      {isRunning && (
        <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce"></div>
                <p className="text-red-400 text-sm">Tasking agent...</p>
            </div>
        </div>
      )}
      
      {isComplete && content && (
        <CodeBlock content={content} language={language} />
      )}
    </div>
  );
};

export default WorkflowStep;
