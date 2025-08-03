
import React, { useState, useEffect, useRef } from 'react';
import { GeminiIcon, OpenAIIcon, OrchestratorIcon } from './FileIcons';

type Status = 'idle' | 'running' | 'complete';
interface LogEntry {
    domain: 'A' | 'B' | 'Supervisor';
    agent: string;
    message: string;
}

const simulationSteps: LogEntry[] = [
    { domain: 'A', agent: 'Lyra', message: 'New task received: "Update security protocols". Analyzing requirements...' },
    { domain: 'A', agent: 'Lyra', message: 'Creating secure data package for cross-domain handoff.' },
    { domain: 'Supervisor', agent: 'Meta-Agents', message: 'API Call: Transferring package from Domain A to Domain B...' },
    { domain: 'Supervisor', agent: 'Meta-Agents', message: 'Supervisory Review: Augmenting context... "Verify against latest Zero-Day exploits".' },
    { domain: 'B', agent: 'Kara', message: 'Package received. Decrypting and validating parameters.' },
    { domain: 'B', agent: 'Kara', message: 'Executing updates on Domain B systems. Applying augmented context.' },
    { domain: 'B', agent: 'Kara', message: 'Task complete. Generating confirmation and knowledge sync packet.' },
    { domain: 'Supervisor', agent: 'Meta-Agents', message: 'API Call: Transferring confirmation from Domain B to Domain A.' },
    { domain: 'A', agent: 'Lyra', message: 'Confirmation received. Integrating updates. Knowledge base synchronized.' },
    { domain: 'Supervisor', agent: 'Meta-Agents', message: 'Orchestration Complete. All domains aligned.' },
];

const OrchestratorView: React.FC = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logsEndRefA = useRef<HTMLDivElement>(null);
    const logsEndRefB = useRef<HTMLDivElement>(null);
    const logsEndRefS = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logsEndRefA.current?.scrollIntoView({ behavior: 'smooth' });
        logsEndRefB.current?.scrollIntoView({ behavior: 'smooth' });
        logsEndRefS.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const runSimulation = () => {
        setStatus('running');
        setLogs([]);
        
        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < simulationSteps.length) {
                setLogs(prev => [...prev, simulationSteps[currentStep]]);
                currentStep++;
            } else {
                setStatus('complete');
                clearInterval(interval);
            }
        }, 1500);
    };

    const resetSimulation = () => {
        setStatus('idle');
        setLogs([]);
    }

    const getDomainLogs = (domain: 'A' | 'B' | 'Supervisor') => logs.filter(log => log.domain === domain);

    const renderLog = (log: LogEntry, index: number) => (
        <div key={index} className="mb-3 text-sm animate-fade-in">
            <p className="font-bold text-fuchsia-400 uppercase tracking-wider">{log.agent}</p>
            <p className="text-cyan-200 font-light">{log.message}</p>
        </div>
    );
    
    const DomainColumn: React.FC<{
        domain: 'A' | 'B' | 'Supervisor',
        title: string,
        icon: React.ReactElement,
        logs: LogEntry[],
        logRef: React.RefObject<HTMLDivElement>
    }> = ({ domain, title, icon, logs, logRef }) => (
         <div className="flex flex-col bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden h-full">
            <div className="flex-shrink-0 flex items-center gap-3 p-3 bg-slate-800 border-b border-slate-700">
                {icon}
                <h3 className="text-lg font-bold uppercase tracking-wider text-white">{title}</h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {logs.map(renderLog)}
                <div ref={logRef} />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wider flex items-center justify-center gap-3"><OrchestratorIcon className="h-8 w-8" /> Cross-Domain Orchestration</h2>
                <p className="text-lg text-neutral-300 font-light max-w-4xl mx-auto">
                   "This system orchestrates agent-to-agent automation and knowledge management across two domains via API, leveraging supervised cross-relational intelligence from GEMINI and OPENAI for fully autonomous, contextual, and auditable updates and documentation workflows."
                </p>
            </div>
            
            <div className="text-center mb-8">
                <button
                    onClick={status === 'running' ? undefined : (status === 'idle' ? runSimulation : resetSimulation)}
                    disabled={status === 'running'}
                    className="bg-red-700 text-white font-bold py-3 px-8 rounded-md hover:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 uppercase tracking-widest text-lg transform hover:scale-105 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500"
                >
                    {status === 'idle' && 'Initiate Orchestration'}
                    {status === 'running' && 'Orchestration in Progress...'}
                    {status === 'complete' && 'Run Again'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[50vh]">
                <DomainColumn 
                    domain="A"
                    title="Domain A: Cassa Vegas"
                    icon={<GeminiIcon className="h-6 w-6 text-cyan-400" />}
                    logs={getDomainLogs('A')}
                    logRef={logsEndRefA}
                />
                <DomainColumn 
                    domain="Supervisor"
                    title="Supervisory AI"
                    icon={<OrchestratorIcon className="h-6 w-6 text-fuchsia-400" />}
                    logs={getDomainLogs('Supervisor')}
                    logRef={logsEndRefS}
                />
                <DomainColumn 
                    domain="B"
                    title="Domain B: External Ops"
                    icon={<OpenAIIcon className="h-6 w-6 text-green-400" />}
                    logs={getDomainLogs('B')}
                    logRef={logsEndRefB}
                />
            </div>
        </div>
    );
};

export default OrchestratorView;
