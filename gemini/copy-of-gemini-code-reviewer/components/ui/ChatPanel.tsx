import React, { useState, useEffect, useRef } from 'react';
import { Agent, ChatMessage } from '../../types.ts';
import { AgentIcon } from './AgentIcon.tsx';
import { TrashIcon, UserCircleIcon, PaperAirplaneIcon } from './Icons.tsx';

interface ChatPanelProps {
    agent: Agent;
    history: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
    onClearChat: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ agent, history, isLoading, onSendMessage, onClearChat }) => {
    const [input, setInput] = useState('');
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput('');
    };
    
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    return (
        <div className="h-full flex flex-col bg-slate-800">
            <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 flex-shrink-0">
                        <AgentIcon agent={agent} className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-slate-200">Chat with {agent.name}</h3>
                </div>
                <button 
                    onClick={onClearChat}
                    title="Clear chat history"
                    className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {history.length === 0 && !isLoading && (
                    <div className="text-center text-slate-500 pt-10">
                        <p>No messages yet.</p>
                        <p className="text-sm">Start the conversation below.</p>
                    </div>
                )}
                {history.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                           <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 flex-shrink-0">
                                <AgentIcon agent={agent} className="w-6 h-6 text-violet-400" />
                           </div>
                        )}
                        <div className={`max-w-xl rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                           <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.role === 'user' && (
                            <UserCircleIcon className="w-10 h-10 text-slate-500 flex-shrink-0" />
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 flex-shrink-0">
                            <AgentIcon agent={agent} className="w-6 h-6 text-violet-400" />
                        </div>
                        <div className="max-w-xl rounded-lg px-4 py-2 bg-slate-700 text-slate-300">
                           <div className="flex items-center justify-center gap-1.5">
                               <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                               <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                               <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>

            <div className="flex-shrink-0 border-t border-slate-700 p-2">
                 <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder={`Message ${agent.name}...`}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                 </form>
            </div>
        </div>
    );
};

export default ChatPanel;
