
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface MonacoLikeEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const MonacoLikeEditor: React.FC<MonacoLikeEditorProps> = ({ value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    const syncScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    // This is a simple language detection for syntax highlighting purposes
    const language = useMemo(() => {
        const trimmedCode = value.trim();
        if (trimmedCode.startsWith('<')) return 'html';
        if (trimmedCode.startsWith('{') || trimmedCode.startsWith('[')) return 'json';
        if (trimmedCode.includes('className=')) return 'javascript'; // Likely JSX/TSX
        return 'javascript';
    }, [value]);

    return (
        <div className="relative w-full h-full font-mono text-sm leading-relaxed">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleValueChange}
                onScroll={syncScroll}
                className="absolute inset-0 w-full h-full p-4 resize-none border-0 bg-transparent text-transparent caret-white z-10 outline-none"
                spellCheck="false"
                autoComplete="off"
            />
            <div
                ref={preRef as any}
                className="absolute inset-0 w-full h-full p-0 m-0 overflow-auto pointer-events-none"
            >
                <SyntaxHighlighter code={value} language={language} />
            </div>
        </div>
    );
};
