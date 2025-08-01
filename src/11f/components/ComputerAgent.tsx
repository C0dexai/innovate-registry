import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { PlayIcon, SquareIcon, BotIcon, UserIcon, ArrowRightIcon, AlertTriangleIcon, CheckCircleIcon, InfoIcon } from './Icons';
import type { ComputerAgentLog } from '../types';

const LogLine: React.FC<{ log: ComputerAgentLog }> = ({ log }) => {
    const getIcon = () => {
        switch (log.type) {
            case 'user': return <UserIcon className="w-4 h-4 text-accent" />;
            case 'reasoning': return <BotIcon className="w-4 h-4 text-sky-400" />;
            case 'action': return <ArrowRightIcon className="w-4 h-4 text-lime-400" />;
            case 'error': return <AlertTriangleIcon className="w-4 h-4 text-red-400" />;
            case 'status': return <InfoIcon className="w-4 h-4 text-amber-400" />;
            case 'url': return <InfoIcon className="w-4 h-4 text-purple-400" />;
            default: return <InfoIcon className="w-4 h-4 text-dim-text" />;
        }
    };

    const textClass = log.type === 'error' ? 'text-red-400' : 'text-bright-text';

    return (
        <div className="flex items-start gap-3 p-1.5 hover:bg-secondary/50 rounded-md">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-grow">
                <span className="font-bold uppercase text-xs text-dim-text mr-2">{log.type}</span>
                <span className={`text-sm whitespace-pre-wrap break-words ${textClass}`}>{log.text}</span>
            </div>
        </div>
    );
};


const ComputerAgent: React.FC = () => {
    const { computerAgentSession, startComputerAgentSession, stopComputerAgentSession, apiKeys } = useContext(AppContext);
    const [prompt, setPrompt] = useState('Go to bing.com and search for the latest news about OpenAI.');
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [computerAgentSession.logs]);
    
    const handleStart = () => {
        if(prompt.trim() && !computerAgentSession.isRunning) {
            startComputerAgentSession(prompt);
        }
    };
    
    return (
        <div className="flex h-full bg-primary text-bright-text">
            {/* Control & Log Panel */}
            <div className="w-1/3 min-w-[400px] flex flex-col border-r border-secondary">
                <div className="flex-shrink-0 p-4 space-y-4 border-b border-secondary">
                    <h2 className="text-2xl font-bold">Automator Agent</h2>
                    {!apiKeys.openai && (
                         <div className="p-3 bg-highlight/20 text-highlight rounded-lg text-center text-sm">
                            Please set up your OpenAI API key in 'Integrations' to use the Automator.
                        </div>
                    )}
                    <div>
                        <label htmlFor="agent-prompt" className="block text-sm font-semibold text-dim-text mb-1">Task Prompt</label>
                        <textarea
                            id="agent-prompt"
                            rows={3}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full bg-secondary p-2 rounded-md border border-slate-600 focus:ring-accent focus:border-accent text-sm"
                            placeholder="Enter a task for the agent..."
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleStart}
                            disabled={computerAgentSession.isRunning || !apiKeys.openai || !prompt.trim()}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            <PlayIcon className="w-5 h-5"/> Start Session
                        </button>
                         <button
                            onClick={stopComputerAgentSession}
                            disabled={!computerAgentSession.isRunning}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            <SquareIcon className="w-5 h-5"/> Stop Session
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-2" ref={logContainerRef}>
                     <div className="space-y-1">
                        {computerAgentSession.logs.map(log => <LogLine key={log.id} log={log} />)}
                        {computerAgentSession.isRunning && <div className="text-dim-text animate-pulse p-2">Agent is working...</div>}
                    </div>
                </div>
            </div>
            {/* "Browser" View Panel */}
            <div className="flex-grow flex flex-col bg-black">
                <div className="flex-shrink-0 bg-secondary p-2 flex items-center text-sm">
                    <div className="bg-primary rounded px-3 py-1 w-full font-mono truncate" title={computerAgentSession.currentUrl || 'No URL'}>
                        {computerAgentSession.currentUrl || 'about:blank'}
                    </div>
                </div>
                 <div className="flex-grow w-full h-full p-4 bg-black">
                    <iframe
                        key={computerAgentSession.currentHtml} // Re-render iframe when HTML changes
                        srcDoc={computerAgentSession.currentHtml}
                        title="Simulated Browser"
                        sandbox="allow-same-origin" // Minimal permissions
                        className="w-full h-full border-2 border-secondary rounded-lg bg-white"
                    />
                </div>
            </div>
        </div>
    );
};

export default ComputerAgent;