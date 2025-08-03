import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons.tsx';

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-slate-950 rounded-lg border border-slate-700/50 my-2 overflow-hidden">
            <div className="flex justify-between items-center bg-slate-800/50 px-4 py-1.5 text-xs text-slate-400">
                <span>{language}</span>
                <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="flex items-center gap-1 hover:text-white" title="Copy code">
                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <pre className="p-4 text-sm overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;
