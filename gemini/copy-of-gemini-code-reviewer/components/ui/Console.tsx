import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Agent, ConsoleEntry, BottomPanelTab } from '../../types.ts';
import { parseResponse } from '../../utils/parsing.ts';
import { ask } from '../../services/aiService.ts';
import CodeBlock from './CodeBlock.tsx';
import { AgentIcon } from './AgentIcon.tsx';
import { TerminalIcon, PlayIcon } from './Icons.tsx';

interface ConsoleProps {
    activeAgent: Agent;
    history: ConsoleEntry[];
    onAddConsoleEntry: (entry: Omit<ConsoleEntry, 'id'>) => void;
    onClearConsole: () => void;
    agents: Agent[];
    setActiveAgentId: (id: string) => void;
    setActiveTab: (tab: BottomPanelTab) => void;
}

const helpText = `Available Gemini CLI commands:
- /ask <prompt>              : Ask the active agent a question (or just type without a command).
- /agent list                : List all available agents.
- /agent set <name>          : Set the active agent by its full name.
- /review [path]             : Request an AI code review (uses active file if no path).
- /clear                     : Clear the console history.
- /help                      : Show this help message.`;

const Console: React.FC<ConsoleProps> = (props) => {
  const { 
    activeAgent, history, onAddConsoleEntry, 
    onClearConsole, agents, setActiveAgentId, setActiveTab
  } = props;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfHistoryRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<null | HTMLInputElement>(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);
  
  const handleSlashCommand = useCallback(async (fullCommand: string) => {
    const [command, ...args] = fullCommand.split(/\s+/);

    switch(command) {
        case '/help':
            onAddConsoleEntry({ type: 'system', text: helpText });
            break;
        case '/clear':
            onClearConsole();
            break;
        case '/review':
            onAddConsoleEntry({ type: 'system', text: `Review command is now handled by the "Review Code" button or in the "Source Control" panel.` });
            break;
        case '/agent': {
            const subCommand = args[0];
            if (subCommand === 'list') {
                const agentList = agents.map(a => `- ${a.name} ${a.id === activeAgent.id ? '(active)' : ''}`).join('\n');
                onAddConsoleEntry({ type: 'system', text: `Available agents:\n${agentList}` });
            } else if (subCommand === 'set') {
                const agentName = args.slice(1).join(' ');
                const agentToSet = agents.find(a => a.name.toLowerCase() === agentName.toLowerCase());
                if (agentToSet) {
                    setActiveAgentId(agentToSet.id);
                    onAddConsoleEntry({ type: 'system', text: `Active agent set to: ${agentToSet.name}` });
                } else {
                    onAddConsoleEntry({ type: 'error', text: `Agent "${agentName}" not found. Use '/agent list' to see available agents.` });
                }
            } else {
                onAddConsoleEntry({ type: 'error', text: "Usage: /agent <list|set name>" });
            }
            break;
        }
        default:
            onAddConsoleEntry({ type: 'error', text: `Unknown command: ${command}. Type /help for a list of commands.` });
    }
  }, [activeAgent, agents, onAddConsoleEntry, onClearConsole, setActiveAgentId]);
  
  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const commandText = input.trim();
    onAddConsoleEntry({ type: 'command', text: commandText });
    setInput('');
    
    if (commandText.startsWith('/')) {
        await handleSlashCommand(commandText);
        return;
    }

    setIsLoading(true);
    try {
      const result = await ask(commandText, activeAgent);
      const { lastCodeBlock } = parseResponse(result);
      onAddConsoleEntry({ type: 'response', text: result, agent: activeAgent, prompt: commandText, lastCodeBlock });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      onAddConsoleEntry({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onAddConsoleEntry, handleSlashCommand, activeAgent]);

  return (
    <div className="bg-slate-900/70 h-full flex flex-col font-mono text-sm text-slate-300" onClick={() => inputRef.current?.focus()}>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="whitespace-pre-wrap leading-relaxed">
            {entry.type === 'command' && (
              <div className="flex items-start">
                <span className="text-cyan-400 mr-2 flex-shrink-0">$</span>
                <span className="flex-1 text-cyan-400">{entry.text}</span>
              </div>
            )}
            {entry.type === 'response' && entry.agent && (
              <div className="flex items-start group">
                 <div className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-700/50 mr-2.5 mt-0.5 flex-shrink-0">
                    <AgentIcon agent={entry.agent} className="w-3 h-3 text-violet-400" />
                </div>
                <div className="flex-1 space-y-2">
                    {parseResponse(entry.text).parts.map((part, partIndex) => {
                        if (part.type === 'code') {
                            return <CodeBlock key={partIndex} language={part.language} code={part.content} />
                        }
                        return <div key={partIndex} dangerouslySetInnerHTML={{ __html: part.content.replace(/`([^`]+)`/g, '<code class="bg-slate-700 rounded px-1.5 py-1 font-mono text-violet-300 text-sm">$1</code>') }}></div>
                    })}
                </div>
              </div>
            )}
            {entry.type === 'system' && (
              <div className="flex items-start">
                 {entry.text.toLowerCase().includes('workflow') ? 
                    <PlayIcon className="w-4 h-4 text-slate-500 mr-2 mt-0.5 flex-shrink-0" /> :
                    <TerminalIcon className="w-4 h-4 text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                 }
                 <span className="flex-1 text-slate-400">{entry.text}</span>
              </div>
            )}
            {entry.type === 'error' && (
               <p className="text-red-400">Error: {entry.text}</p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center text-slate-400">
            <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{activeAgent.name} is thinking...</span>
          </div>
        )}
        <div ref={endOfHistoryRef} />
      </div>
      <form onSubmit={handleFormSubmit} className="flex items-center mt-auto border-t border-slate-700 p-2 flex-shrink-0">
        <span className="text-cyan-400 mx-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent focus:outline-none placeholder:text-slate-500"
          placeholder={`Ask ${activeAgent.name}, or type /help...`}
          disabled={isLoading}
          autoFocus
        />
      </form>
    </div>
  );
};

export default Console;