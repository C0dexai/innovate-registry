import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface InlineCodeBlockProps {
    language: string;
    code: string;
}

const InlineCodeBlock: React.FC<InlineCodeBlockProps> = ({ language, code }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="chat-code-preview my-2">
            <div className="chat-code-preview-header">
                <span className="text-xs font-semibold tracking-wider text-gray-400">{language}</span>
                <button
                    onClick={handleCopy}
                    className="p-1.5 bg-black/20 hover:bg-black/40 rounded-md"
                    aria-label={isCopied ? "Copied!" : "Copy code"}
                >
                    {isCopied ? <CheckIcon className="h-4 w-4 text-[var(--neon-green)]" /> : <CopyIcon className="h-4 w-4 text-gray-300" />}
                </button>
            </div>
            <pre>
                <code>{code}</code>
            </pre>
        </div>
    );
};

export default InlineCodeBlock;
