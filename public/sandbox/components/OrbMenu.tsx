import React, { useState } from 'react';
import { GeminiIcon, LayoutIcon, SaveIcon } from './Icons';

interface OrbMenuProps {
  onSave: () => void;
  lastSavedTimestamp: Date | null;
  onToggleFocusMode: () => void;
}

const OrbMenu: React.FC<OrbMenuProps> = ({ onSave, lastSavedTimestamp, onToggleFocusMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formatTime = (date: Date | null) => {
        if (!date) return 'never';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {isOpen && (
                <div className="mb-3 p-3 bg-[var(--card-bg)] backdrop-blur-md border border-[var(--neon-purple)] rounded-lg shadow-2xl neon-glow-purple flex flex-col gap-2 w-48 animate-fade-in-up">
                    <button
                        onClick={() => { onSave(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-2 text-left text-sm text-gray-200 hover:bg-black/40 rounded-md transition-colors"
                    >
                        <SaveIcon className="h-5 w-5 text-[var(--neon-green)]" />
                        <span>Page Save</span>
                    </button>
                    <button
                        onClick={() => { onToggleFocusMode(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-2 text-left text-sm text-gray-200 hover:bg-black/40 rounded-md transition-colors"
                    >
                        <LayoutIcon className="h-5 w-5 text-[var(--neon-blue)]" />
                        <span>Focus Mode</span>
                    </button>
                    <button
                        disabled
                        className="flex items-center gap-3 w-full p-2 text-left text-sm text-gray-500 cursor-not-allowed"
                    >
                        <span className="font-mono text-xs text-[var(--neon-blue)]">Recall</span>
                        <span>Page Recall</span>
                    </button>
                     <div className="border-t border-[var(--card-border)] my-1"></div>
                     <div className="px-2 text-xs text-gray-400">
                        <p>Last saved: {formatTime(lastSavedTimestamp)}</p>
                     </div>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[var(--neon-pink)] neon-glow-purple' : 'bg-[var(--neon-purple)] neon-glow-blue'}`}
                aria-label="Open session menu"
                title="Session Menu"
            >
                <GeminiIcon className={`h-8 w-8 text-black transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
        </div>
    );
};

export default OrbMenu;