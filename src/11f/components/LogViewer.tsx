
import React, { useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { LogLevel } from '../types';
import type { LogEntry } from '../types';
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon, GitBranchIcon, TerminalIcon } from './Icons';

const LogIcon: React.FC<{ level: LogLevel }> = ({ level }) => {
    switch (level) {
        case LogLevel.Error:
            return <AlertTriangleIcon className="w-4 h-4 text-neon-red flex-shrink-0" />;
        case LogLevel.Warning:
            return <AlertTriangleIcon className="w-4 h-4 text-neon-yellow flex-shrink-0" />;
        case LogLevel.Success:
            return <CheckCircleIcon className="w-4 h-4 text-neon-green flex-shrink-0" />;
        case LogLevel.Handoff:
            return <GitBranchIcon className="w-4 h-4 text-accent flex-shrink-0" />;
        case LogLevel.Trigger:
            return <TerminalIcon className="w-4 h-4 text-highlight flex-shrink-0" />;
        default:
            return <InfoIcon className="w-4 h-4 text-dim-text flex-shrink-0" />;
    }
};

const getLevelClasses = (level: LogLevel): string => {
    switch (level) {
        case LogLevel.Error: return 'text-neon-red';
        case LogLevel.Warning: return 'text-neon-yellow';
        case LogLevel.Success: return 'text-neon-green';
        case LogLevel.Handoff: return 'text-accent';
        case LogLevel.Trigger: return 'text-highlight';
        default: return 'text-dim-text';
    }
};

export const LogViewer: React.FC = () => {
    const { logs } = useContext(AppContext);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="h-full bg-black text-white font-mono text-xs flex flex-col">
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-2">
                {logs.map((log: LogEntry) => (
                    <div key={log.id} className="flex items-start gap-2 mb-1.5">
                        <LogIcon level={log.level} />
                        <span className="text-gray-500 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`font-bold w-24 flex-shrink-0 ${getLevelClasses(log.level)}`}>[{log.agent}]</span>
                        <span className={`w-20 flex-shrink-0 ${getLevelClasses(log.level)}`}>{log.event.toUpperCase()}</span>
                        <p className="whitespace-pre-wrap break-words text-bright-text flex-1">{log.detail}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};