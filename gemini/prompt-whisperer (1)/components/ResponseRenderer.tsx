import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Button } from './ui/Button';

const CodeBlock: React.FC<{ children: string }> = ({ children }) => {
    const [copied, setCopied] = useState(false);
    const codeContent = children.replace(/^\s*(\w+)\n/, '');
    const language = (children.match(/^\s*(\w+)\n/) || [])[1] || '';

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 bg-gray-950 rounded-md overflow-hidden border border-blue-500/30">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-900">
                <span className="text-xs text-blue-300 font-sans font-semibold">{language || 'code'}</span>
                 <Button variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy code">
                    {copied ? 'Copied!' : React.cloneElement(ICONS.COPY, { className: 'h-4 w-4' })}
                </Button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto"><code className={`language-${language}`}>{codeContent}</code></pre>
        </div>
    )
}

const ImagePlaceholder: React.FC<{ prompt: string }> = ({ prompt }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 bg-gray-800 rounded-md border-2 border-dashed border-fuchsia-500/20 p-4 text-center text-gray-400">
             <div className="flex justify-end -mr-2 -mt-2">
                <Button variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy image prompt">
                    {copied ? 'Copied!' : React.cloneElement(ICONS.COPY, { className: 'h-4 w-4' })}
                </Button>
            </div>
            <div className="flex flex-col items-center justify-center h-32">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-fuchsia-400/60 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <p className="text-sm font-semibold">Image Placeholder</p>
                <p className="text-xs mt-1 font-mono bg-black/50 px-2 py-1 rounded">{prompt}</p>
            </div>
        </div>
    )
}

export const ResponseRenderer: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`|\[IMAGE:.*?\])/g);

    return (
        <div className="prose prose-invert prose-sm max-w-none text-gray-200 whitespace-pre-wrap">
            {parts.map((part, index) => {
                if (!part) return null;
                if (part.startsWith('```') && part.endsWith('```')) {
                    return <CodeBlock key={index}>{part.slice(3, -3)}</CodeBlock>
                }
                if (part.startsWith('[IMAGE:') && part.endsWith(']')) {
                    const imagePrompt = part.slice(7, -1).trim();
                    return <ImagePlaceholder key={index} prompt={imagePrompt} />
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};