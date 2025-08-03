import React, { useState, useRef, useEffect } from 'react';
import type { TerminalLine } from '../types';
import { SpinnerIcon } from './Icons';

interface TerminalProps {
    history: TerminalLine[];
    cwd: string;
    onSubmitCommand: (command: string) => void;
    isLoading: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ history, cwd, onSubmitCommand, isLoading }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        onSubmitCommand(inputValue);
        setInputValue('');
    };

    return (
        <div className="h-full w-full bg-[#1e1e1e] text-white font-mono text-sm p-4 flex flex-col" onClick={() => inputRef.current?.focus()}>
            <div className="flex-grow overflow-y-auto" >
                {history.map((line) => (
                    <div key={line.id}>
                        <div className="flex gap-2">
                           <span className="text-green-400">user@sandbox:</span>
                           <span className="text-blue-400">{line.cwd}</span>
                           <span className="text-white">$</span>
                           <p className="flex-1 text-gray-200">{line.command}</p>
                        </div>
                        {line.stdout && <pre className="text-gray-300 whitespace-pre-wrap break-words">{line.stdout}</pre>}
                        {line.stderr && <pre className="text-red-500 whitespace-pre-wrap break-words">{line.stderr}</pre>}
                    </div>
                ))}
                <div ref={endOfHistoryRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex-shrink-0 mt-2">
                 <div className="flex gap-2 items-center">
                    {isLoading ? (
                        <SpinnerIcon className="h-4 w-4 text-yellow-400 animate-spin flex-shrink-0" />
                    ) : (
                        <>
                           <span className="text-green-400">user@sandbox:</span>
                           <span className="text-blue-400">{cwd}</span>
                           <span className="text-white">$</span>
                        </>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-gray-200"
                        disabled={isLoading}
                        spellCheck="false"
                        autoComplete="off"
                        aria-label="Terminal command input"
                    />
                </div>
            </form>
        </div>
    );
};

export default Terminal;
