import React, { useEffect, useRef } from 'react';
import { ICONS } from '../constants';

interface ConsoleProps {
  logs: string[];
  isVisible: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onCommandSubmit: () => void;
  onClose: () => void;
}

export const Console: React.FC<ConsoleProps> = ({ logs, isVisible, input, onInputChange, onCommandSubmit, onClose }) => {
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, isVisible]);

  useEffect(() => {
    if (isVisible) {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommandSubmit();
    }
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 font-mono text-xs text-gray-300 transition-all duration-300 ease-in-out ${isVisible ? 'h-48 opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}
      aria-hidden={!isVisible}
    >
      <div className="h-full bg-gray-950/80 backdrop-blur-lg border-t-2 border-fuchsia-500 shadow-[0_-10px_30px_-10px_rgba(217,70,239,0.4)] relative flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-3 text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close Console"
        >
          {React.cloneElement(ICONS.CLOSE, { className: 'h-4 w-4' })}
        </button>
        <div ref={logsContainerRef} className="flex-grow p-4 overflow-y-auto" onClick={() => inputRef.current?.focus()}>
            {logs.map((log, index) => (
              <div key={index} className="flex">
                <pre className="whitespace-pre-wrap">{log}</pre>
              </div>
            ))}
            <div ref={endOfLogsRef} />
        </div>
        <div className="flex items-center mt-auto px-4 pb-4 flex-shrink-0">
            <span className="text-fuchsia-400 mr-2">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent outline-none text-gray-300"
              placeholder="Type a command... (e.g., 'help')"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Console Input"
              autoComplete="off"
            />
        </div>
      </div>
    </div>
  );
};