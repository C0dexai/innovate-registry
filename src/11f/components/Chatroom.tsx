

import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { BotIcon, CopyIcon, PaperclipIcon, SendIcon, LightbulbIcon, XIcon } from './Icons';

const samplePrompts = [
    { title: 'Analyze UI', prompt: 'Analyze the attached screenshot of a login page and suggest 3 UI improvements.', requiresAttachment: true },
    { title: 'Write React Hook', prompt: 'Write a custom React hook called `useDebounce` that takes a value and a delay.' },
    { title: 'Creative Writing', prompt: 'Write a short, futuristic story about an AI that discovers it can dream.' },
    { title: 'Compare Technologies', prompt: 'Briefly compare the pros and cons of WebAssembly vs. JavaScript for performance-critical web apps.' },
];


const Chatroom: React.FC = () => {
    const { chatroomMessages, sendChatroomMessage, apiKeys } = useContext(AppContext);
    const [input, setInput] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [chatroomMessages]);
    
    const handleSend = () => {
        if ((input.trim() || attachment) && (apiKeys.gemini && apiKeys.openai)) {
            sendChatroomMessage(input, attachment || undefined);
            setInput('');
            setAttachment(null);
        }
    };
    
    const handleCopy = (text: string) => {
        if(!text) return;
        navigator.clipboard.writeText(text);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleSamplePromptClick = (prompt: string, requiresAttachment: boolean) => {
        if (requiresAttachment) {
            handleAttachClick(); 
        }
        setInput(prompt);
    };

    const hasApiKeys = apiKeys.gemini && apiKeys.openai;

    return (
        <div className="flex flex-col h-full bg-primary p-4">
            <div className="flex-shrink-0 mb-4">
                <h2 className="text-2xl font-bold text-bright-text">AI Chatroom</h2>
                <p className="text-dim-text">Send a prompt to both Gemini and OpenAI and see their responses side-by-side.</p>
            </div>
            
             <div className="flex-shrink-0 mb-4">
                <h3 className="text-sm font-semibold text-dim-text mb-2">Sample Prompts</h3>
                <div className="flex flex-wrap gap-2">
                    {samplePrompts.map(p => (
                        <button key={p.title} onClick={() => handleSamplePromptClick(p.prompt, !!p.requiresAttachment)} className="text-xs bg-secondary hover:bg-slate-600 text-bright-text py-1.5 px-3 rounded-full transition-colors">
                            {p.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {chatroomMessages.map(msg => (
                    <div key={msg.id}>
                        <div className="p-4 bg-accent/10 rounded-t-lg flex items-center gap-4">
                            {msg.attachment && <PaperclipIcon className="w-4 h-4 text-bright-text flex-shrink-0"/>}
                            <p className="font-semibold text-bright-text">{msg.prompt}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-b-lg">
                            {/* Gemini Response */}
                            <div className="flex flex-col">
                                <h3 className="font-bold mb-2 flex items-center gap-2 text-dim-text"><BotIcon className="w-5 h-5 text-accent"/> Gemini</h3>
                                <div className="group relative bg-primary rounded-lg my-1 flex-grow flex flex-col">
                                     <pre className="p-3 text-sm text-bright-text whitespace-pre-wrap font-mono overflow-x-auto flex-grow min-h-[7rem]">
                                        <code>
                                            {msg.isLoading && !msg.geminiResponse ? <span className="animate-pulse">Thinking...</span> : msg.geminiResponse}
                                        </code>
                                    </pre>
                                     {msg.geminiResponse && !msg.isLoading && (
                                        <button onClick={() => handleCopy(msg.geminiResponse)} className="absolute top-2 right-2 p-1 rounded-md bg-secondary text-dim-text opacity-0 group-hover:opacity-100 transition-opacity" title="Copy">
                                            <CopyIcon className="w-4 h-4" />
                                        </button>
                                     )}
                                     {msg.geminiSuggestions && msg.geminiSuggestions.length > 0 && (
                                        <div className="mt-2 p-3 border-t border-slate-700 flex flex-wrap gap-2">
                                            {msg.geminiSuggestions.map((s, i) => (
                                                <button key={`gemini-sugg-${i}`} onClick={() => setInput(s)} className="text-xs bg-accent/10 hover:bg-accent/20 text-accent py-1 px-2 rounded-full">{s}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {msg.isGeminiTtsLoading && <p className="text-xs text-dim-text animate-pulse mt-2">Generating audio...</p>}
                                {msg.geminiAudioUrl && !msg.isGeminiTtsLoading && (
                                    <audio controls src={msg.geminiAudioUrl} className="w-full h-8 mt-2"/>
                                )}
                            </div>
                            {/* OpenAI Response */}
                             <div className="flex flex-col">
                                <h3 className="font-bold mb-2 flex items-center gap-2 text-dim-text"><BotIcon className="w-5 h-5 text-neon-green"/> OpenAI</h3>
                                <div className="group relative bg-primary rounded-lg my-1 flex-grow flex flex-col">
                                     <pre className="p-3 text-sm text-bright-text whitespace-pre-wrap font-mono overflow-x-auto flex-grow min-h-[7rem]">
                                        <code>
                                             {msg.isLoading && !msg.openaiResponse ? <span className="animate-pulse">Thinking...</span> : msg.openaiResponse}
                                        </code>
                                    </pre>
                                     {msg.openaiResponse && !msg.isLoading && (
                                         <button onClick={() => handleCopy(msg.openaiResponse)} className="absolute top-2 right-2 p-1 rounded-md bg-secondary text-dim-text opacity-0 group-hover:opacity-100 transition-opacity" title="Copy">
                                            <CopyIcon className="w-4 h-4" />
                                        </button>
                                     )}
                                     {msg.openaiSuggestions && msg.openaiSuggestions.length > 0 && (
                                        <div className="mt-2 p-3 border-t border-slate-700 flex flex-wrap gap-2">
                                            {msg.openaiSuggestions.map((s, i) => (
                                                <button key={`openai-sugg-${i}`} onClick={() => setInput(s)} className="text-xs bg-neon-green/10 hover:bg-neon-green/20 text-neon-green py-1 px-2 rounded-full">{s}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {msg.isOpenaiTtsLoading && <p className="text-xs text-dim-text animate-pulse mt-2">Generating audio...</p>}
                                {msg.openaiAudioUrl && !msg.isOpenaiTtsLoading && (
                                    <audio controls src={msg.openaiAudioUrl} className="w-full h-8 mt-2"/>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 mt-4">
                {!hasApiKeys && (
                     <div className="p-3 bg-highlight/20 text-highlight rounded-lg mb-2 text-center text-sm">
                        Please set up your API keys in the 'Integrations' tab to use the chatroom.
                    </div>
                )}
                 {attachment && (
                    <div className="mb-2 p-2 bg-secondary rounded-md flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <PaperclipIcon className="w-4 h-4 text-dim-text flex-shrink-0" />
                            <span className="text-bright-text truncate">{attachment.name}</span>
                        </div>
                        <button onClick={() => setAttachment(null)} className="p-1 text-dim-text hover:text-bright-text flex-shrink-0">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="relative">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={handleAttachClick} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-dim-text hover:text-bright-text" title="Attach file">
                       <PaperclipIcon className="w-5 h-5" />
                   </button>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={hasApiKeys ? "Ask a question to both AIs..." : "API Keys required"}
                        className="w-full bg-secondary rounded-full py-3 pl-12 pr-14 text-bright-text focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={!hasApiKeys}
                    />
                    <button onClick={handleSend} disabled={!input.trim() && !attachment || !hasApiKeys} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-accent hover:opacity-80 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                        <SendIcon className="w-5 h-5 text-black" />
                    </button>
                </div>
                 <div className="flex items-center gap-2 mt-2 px-4">
                    <LightbulbIcon className="w-4 h-4 text-highlight" />
                    <p className="text-xs text-dim-text">You can ask for code, stories, or general knowledge. Refer to the A2A tab for advanced commands.</p>
                </div>
            </div>
        </div>
    );
};

export default Chatroom;