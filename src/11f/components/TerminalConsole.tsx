
import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import type { TerminalLine } from '../types';
import { TerminalIcon, HelpCircleIcon } from './Icons';
import { geminiService } from '../services/geminiService';

type CliType = 'codex' | 'gemini';

const renderLine = (line: TerminalLine) => {
    switch(line.type) {
        case 'input':
            return <p><span className="text-neon-green">user@studio</span>:<span className="text-accent">~</span>$ {line.text}</p>;
        case 'output':
            return <p className="text-bright-text whitespace-pre-wrap">{line.text}</p>;
        case 'error':
            return <p className="text-neon-red whitespace-pre-wrap">{line.text}</p>;
        case 'help':
            return <p className="text-accent whitespace-pre-wrap">{line.text}</p>;
        default:
            return <p>{line.text}</p>;
    }
}

export const TerminalConsole: React.FC = () => {
    const { codexHistory, geminiHistory, handleTerminalCommand, apiKeys } = useContext(AppContext);
    const [activeCLI, setActiveCLI] = useState<CliType>('codex');
    const [input, setInput] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const history = activeCLI === 'codex' ? codexHistory : geminiHistory;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            await handleTerminalCommand(activeCLI, input);
            setInput('');
            setSuggestion('');
        }
    };
    
    // Debounced suggestion fetching
    useEffect(() => {
        if (!input.trim() || !apiKeys.gemini) {
            setSuggestion('');
            return;
        }
        
        setIsSuggesting(true);
        const handler = setTimeout(() => {
            geminiService.getCommandSuggestion(input, activeCLI, apiKeys.gemini)
                .then(setSuggestion)
                .finally(() => setIsSuggesting(false));
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [input, activeCLI, apiKeys.gemini]);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, [activeCLI]);

    return (
        <div className="h-full bg-black text-white font-mono text-sm flex flex-col">
            <div className="flex-shrink-0 flex items-center border-b border-gray-700">
                 <button 
                    onClick={() => setActiveCLI('codex')}
                    className={`px-4 py-2 text-xs ${activeCLI === 'codex' ? 'bg-gray-800 text-white' : 'bg-black text-gray-400 hover:bg-gray-900'}`}
                 >
                    CODEX CLI
                 </button>
                 <button 
                    onClick={() => setActiveCLI('gemini')}
                    className={`px-4 py-2 text-xs ${activeCLI === 'gemini' ? 'bg-gray-800 text-white' : 'bg-black text-gray-400 hover:bg-gray-900'}`}
                 >
                    GEMINI CLI
                 </button>
            </div>
            <div ref={scrollRef} className="flex-grow p-2 overflow-y-auto space-y-1">
                {history.map(line => (
                    <div key={line.id}>{renderLine(line)}</div>
                ))}
            </div>
            <div className="flex-shrink-0 p-2 border-t border-gray-700">
                 <div className="flex items-center gap-2">
                    <span className="text-neon-green">{activeCLI}@studio</span>
                    <span className="text-accent">~</span>
                    <span>$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleCommand}
                        className="flex-grow bg-transparent text-white focus:outline-none"
                        spellCheck="false"
                        autoComplete="off"
                    />
                </div>
                 {suggestion && (
                    <div className="text-xs text-gray-500 pl-4 mt-1 flex items-center gap-1">
                        <span className="font-bold">Hint:</span>
                        <span>{isSuggesting ? '...' : suggestion}</span>
                    </div>
                )}
            </div>
        </div>
    );
};