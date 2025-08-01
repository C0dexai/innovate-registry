

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { BotIcon, UserIcon, CopyIcon, GitBranchIcon } from './Icons';
import type { ChatMessage } from '../types';
import { SyntaxHighlighter } from './SyntaxHighlighter';

const History: React.FC = () => {
    const { messages, chatroomMessages } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'studio' | 'chatroom'>('studio');

    const renderStudioMessage = (msg: ChatMessage) => {
        switch(msg.type) {
            case 'user':
                return (
                     <div className="flex items-start gap-3 w-full">
                        <div className="flex-grow flex justify-end">
                            <div className="max-w-xl rounded-lg p-3 bg-accent text-black font-semibold text-sm whitespace-pre-wrap">{msg.text}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-dim-text" /></div>
                    </div>
                );
            case 'ai_response':
                 return (
                     <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-2"><BotIcon className="w-5 h-5 text-black" /></div>
                        <div className="max-w-2xl flex-grow">
                             <SyntaxHighlighter code={msg.text || "No response recorded."} />
                        </div>
                    </div>
                );
            case 'orchestration_status':
                return (
                    <div className="flex items-center gap-3 text-sm text-dim-text py-1 mx-12">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.agentName === 'System' ? 'bg-slate-500' : 'bg-highlight'}`}>
                            <BotIcon className="w-4 h-4 text-white" />
                        </div>
                        <div><span className="font-bold text-highlight">{msg.agentName}:</span> {msg.text}</div>
                    </div>
                );
            case 'orchestration_handoff':
                return (
                    <div className="flex items-center gap-3 text-sm text-accent py-2 my-2 mx-12 border-y border-dashed border-secondary">
                        <GitBranchIcon className="w-6 h-6 flex-shrink-0" />
                        <div>Handoff: <span className="font-bold">{msg.fromAgent}</span> → <span className="font-bold">{msg.toAgent}</span></div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto text-bright-text">
            <h2 className="text-3xl font-bold mb-2">Conversation History</h2>
            <p className="text-dim-text mb-8">Review your past interactions with the AI. All conversations are saved in your browser.</p>

            <div className="border-b border-secondary mb-4">
                <button
                    onClick={() => setActiveTab('studio')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'studio' ? 'text-accent border-b-2 border-accent' : 'text-dim-text'}`}
                >
                    Studio Chat
                </button>
                <button
                    onClick={() => setActiveTab('chatroom')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'chatroom' ? 'text-accent border-b-2 border-accent' : 'text-dim-text'}`}
                >
                    AI Chatroom
                </button>
            </div>

            <div className="space-y-6">
                {activeTab === 'studio' && (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                             <div key={msg.id}>
                                {renderStudioMessage(msg)}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'chatroom' && (
                    <div className="space-y-6">
                        {chatroomMessages.map((msg) => (
                             <div key={msg.id}>
                                <div className="p-4 bg-accent/10 rounded-t-lg">
                                    <p className="font-semibold text-bright-text">{msg.prompt}</p>

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-b-lg">
                                    <div>
                                        <h3 className="font-bold mb-2 flex items-center gap-2 text-dim-text"><BotIcon className="w-5 h-5 text-accent"/> Gemini</h3>
                                        <SyntaxHighlighter code={msg.geminiResponse} />
                                        {msg.geminiAudioUrl && !msg.isGeminiTtsLoading && (
                                            <audio controls src={msg.geminiAudioUrl} className="w-full h-8 mt-2"/>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-2 flex items-center gap-2 text-dim-text"><BotIcon className="w-5 h-5 text-neon-green"/> OpenAI</h3>
                                        <SyntaxHighlighter code={msg.openaiResponse} />
                                        {msg.openaiAudioUrl && !msg.isOpenaiTtsLoading && (
                                            <audio controls src={msg.openaiAudioUrl} className="w-full h-8 mt-2"/>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;