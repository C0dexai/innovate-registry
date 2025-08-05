
import React, { useState } from 'react';
import AgentView from './components/AgentView';
import WorkflowView from './components/WorkflowView';
import FileExplorerView from './components/FileExplorerView';
import OperatorView from './components/OperatorView';
import OrbMenu from './components/OrbMenu';
import { AGENTS } from './agents';
import { Agent, ViewType } from './types';
import { CrosshairIcon } from './components/FileIcons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(AGENTS[0].name);

  const renderView = () => {
    switch (activeView) {
      case 'workflow':
        return <WorkflowView />;
      case 'explorer':
        return <FileExplorerView />;
      case 'operator':
        return <OperatorView />;
      default:
        const agent = AGENTS.find(a => a.name === activeView);
        return agent 
          ? <AgentView agent={agent} /> 
          : <div className="text-center text-red-500 p-8">Error: Agent not found. The family is on a mission.</div>;
    }
  };

  const tabs = [
    ...AGENTS.map(agent => ({ key: agent.name, label: agent.name, isAgent: true })),
    { key: 'workflow', label: 'The Blueprint', isAgent: false },
    { key: 'explorer', label: 'File Explorer', isAgent: false },
    { key: 'operator', label: 'Operator', isAgent: false, icon: <CrosshairIcon className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-cyan-200">
      <main className="container mx-auto px-4 py-8 md:py-12">
        
        <div className="border-b border-cyan-500/20 mb-8">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`
                  ${activeView === tab.key
                    ? 'border-fuchsia-500 text-white' + ((tab.isAgent && tab.key === 'Kara') || tab.key === 'workflow' ? ' neon-glow-fuchsia' : '')
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}
                  whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm uppercase tracking-wider transition-colors duration-200 focus:outline-none flex items-center gap-2
                `}
                aria-current={activeView === tab.key ? 'page' : undefined}
              >
                {'icon' in tab && tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 md:p-8 min-h-[60vh]">
            {renderView()}
        </div>

        <footer className="text-center mt-16 text-slate-500 font-light">
            <p>CASSA VEGAS | Family First. Code Second. All In.</p>
        </footer>
      </main>
      <OrbMenu activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;