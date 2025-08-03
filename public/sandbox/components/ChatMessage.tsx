import React, { useState } from 'react';
import type { ChatMessage } from '../types';
import { GeminiIcon, UserCircleIcon, CheckIcon, CopyIcon } from './Icons';
import ChatContentParser from './ChatContentParser';

interface ChatMessageProps {
    message: ChatMessage;
    onApplyCode: (code: { path: string; content: string }[]) => void;
}

const ChatMessageView: React.FC<ChatMessageProps> = ({ message, onApplyCode }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (message.role === 'system') {
        return (
            <div className="text-center my-4">
                <p className="text-xs text-gray-500 italic px-4 py-1 bg-black/20 rounded-full inline-block">
                    {message.content}
                </p>
            </div>
        );
    }
    
    const getRoleStyles = () => {
        switch (message.role) {
            case 'model':
                return {
                    container: '',
                    iconContainer: 'bg-[var(--neon-purple)]',
                    icon: <GeminiIcon className="h-5 w-5 text-black" />,
                    bubble: 'bg-black/30 border border-[var(--neon-purple)] text-[var(--text-color)]',
                    glow: 'neon-glow-purple',
                };
            case 'user':
            default:
                return {
                    container: 'flex-row-reverse',
                    iconContainer: 'bg-[var(--neon-blue)]',
                    icon: <UserCircleIcon className="h-5 w-5 text-black" />,
                    bubble: 'bg-black/30 border border-[var(--neon-blue)] text-[var(--text-color)]',
                    glow: 'neon-glow-blue',
                };
        }
    };

    const handleCopy = () => {
        const textToCopy = message.role === 'model' 
            ? (message.explanation || message.content) 
            : message.content;
            
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    const styles = getRoleStyles();

    return (
        <div className={`flex items-start gap-3 my-4 ${styles.container}`}>
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${styles.iconContainer} ${styles.glow}`}>
                {styles.icon}
            </div>
            <div className={`p-4 rounded-xl max-w-xl relative group ${styles.bubble}`}>
                <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={isCopied ? "Copied!" : "Copy text"}
                >
                    {isCopied ? <CheckIcon className="h-4 w-4 text-[var(--neon-green)]" /> : <CopyIcon className="h-4 w-4 text-gray-300" />}
                </button>
                
                 <ChatContentParser 
                    content={message.role === 'model' ? (message.explanation || message.content) : message.content}
                    codeSnippets={message.code}
                    onApplyCode={onApplyCode}
                 />
            </div>
        </div>
    );
};

export default ChatMessageView;