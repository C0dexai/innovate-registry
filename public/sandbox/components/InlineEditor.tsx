import React, { useState } from 'react';
import CodeEditor from './CodePreview';
import { SaveIcon, XIcon } from './Icons';

interface InlineEditorProps {
    elementHtml: string;
    position: { top: number; left: number };
    onSave: (newHtml: string) => void;
    onCancel: () => void;
}

const InlineEditor: React.FC<InlineEditorProps> = ({ elementHtml, position, onSave, onCancel }) => {
    const [currentCode, setCurrentCode] = useState(elementHtml);

    const editorStyle: React.CSSProperties = {
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: `calc(100vh - ${position.top + 20}px)`,
        maxWidth: `calc(100vw - ${position.left + 20}px)`,
    };
    
    const handleSave = () => {
        onSave(currentCode);
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onCancel}
            ></div>
            
            {/* Editor Popup */}
            <div
                style={editorStyle}
                className="fixed z-50 flex flex-col bg-[var(--card-bg)] border border-[var(--neon-purple)] rounded-lg shadow-2xl neon-glow-purple animate-fade-in"
            >
                <div className="flex items-center justify-between p-2 bg-black/30 border-b border-[var(--card-border)]">
                    <h3 className="font-bold text-sm text-[var(--neon-pink)]">Edit Element</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} className="flex items-center gap-1.5 text-sm bg-[var(--neon-green)] hover:brightness-125 text-black font-bold py-1 px-3 rounded-md transition-all" title="Save Changes">
                           <SaveIcon className="h-4 w-4" /> Save
                        </button>
                         <button onClick={onCancel} className="p-1.5 hover:bg-white/10 rounded-md text-gray-300" title="Cancel">
                           <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="w-[450px] h-[250px] overflow-hidden">
                    <CodeEditor
                        value={currentCode}
                        language="html"
                        onChange={setCurrentCode}
                        onSave={handleSave}
                    />
                </div>
            </div>
        </>
    );
};

export default InlineEditor;
