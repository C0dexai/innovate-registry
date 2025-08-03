
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, WorkflowTopic } from '../types';
import LoadingSpinner from './LoadingSpinner';
import TypingIndicator from './TypingIndicator';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: WorkflowTopic | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean; // Initial elaboration loading
  isChatLoading: boolean; // Subsequent message loading
  error: string | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, topic, messages, onSendMessage, isLoading, isChatLoading, error }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isChatLoading && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/80 border border-fuchsia-500/30 rounded-lg shadow-2xl shadow-fuchsia-900/50 w-full max-w-2xl h-[90vh] flex flex-col p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-start pb-4 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-fuchsia-500 uppercase tracking-wider">{topic?.title}</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
        
        <div className="flex-1 my-4 overflow-y-auto pr-2 font-light">
            {isLoading && <LoadingSpinner />}
            
            {error && !hasMessages && (
                <div className="text-center text-red-500 p-4">
                    <h3 className="text-xl font-bold mb-2 uppercase">System Anomaly</h3>
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && messages.map((msg, index) => (
                <div key={index} className={`flex items-end my-3 gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-fuchsia-900/50 flex items-center justify-center border-2 border-fuchsia-600/50 neon-glow-fuchsia">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fuchsia-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    )}
                    <div className={`max-w-md md:max-w-lg p-3 rounded-lg prose prose-invert prose-p:text-cyan-200 prose-p:font-light prose-headings:text-fuchsia-400 prose-headings:uppercase max-w-none ${msg.role === 'user' ? 'bg-cyan-900/50 text-white' : 'bg-slate-800'}`}>
                        {msg.content.split('\n').filter(p => p.trim() !== "").map((paragraph, index) => (
                            <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
                        ))}
                    </div>
                </div>
            ))}
            {isChatLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
        </div>
        
        <div className="flex-shrink-0 pt-4 mt-auto border-t border-slate-700">
             {error && hasMessages && (
                <p className="text-center text-red-500 text-sm mb-2">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={!isLoading ? "Ask a follow-up question..." : "Kara is running the numbers..."}
                    disabled={isLoading || isChatLoading}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition"
                />
                <button 
                    type="submit" 
                    disabled={isLoading || isChatLoading || !inputValue.trim()}
                    className="bg-fuchsia-700 text-white font-bold p-2 rounded-md hover:bg-fuchsia-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-opacity-75 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500"
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;