import React, { useEffect, useState, useMemo } from 'react';
import { marked } from 'marked';
import InlineCodeBlock from './InlineCodeBlock';
import { CheckIcon } from './Icons';

interface ChatContentParserProps {
    content: string;
    codeSnippets?: { path: string; content: string }[];
    onApplyCode: (code: { path:string; content:string }[]) => void;
}

const ChatContentParser: React.FC<ChatContentParserProps> = ({ content, codeSnippets, onApplyCode }) => {
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        const parseMd = async () => {
            try {
                // Remove code blocks from the main content before parsing
                const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
                const html = await marked.parse(contentWithoutCode);
                setHtmlContent(html);
            } catch (error) {
                console.error("Error parsing markdown", error);
                setHtmlContent(`<p>${content.replace(/\n/g, '<br>')}</p>`);
            }
        };
        parseMd();
    }, [content]);

    const codeBlocks = useMemo(() => {
        const regex = /```(\w+)?\n([\s\S]*?)```/g;
        const blocks = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            blocks.push({
                language: match[1] || 'text',
                code: match[2].trim(),
            });
        }
        return blocks;
    }, [content]);
    
    return (
        <div className="text-sm prose" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            
            {codeBlocks.map((block, index) => (
                <InlineCodeBlock key={index} language={block.language} code={block.code} />
            ))}

            {codeSnippets && codeSnippets.length > 0 && (
                 <div className="mt-4 pt-3 border-t border-[var(--neon-green)]/30">
                    <button
                        onClick={() => onApplyCode(codeSnippets)}
                        className="flex items-center gap-2 w-full justify-center text-sm bg-[var(--neon-green)] hover:brightness-125 text-black font-bold py-2 px-3 rounded-md transition-all mt-2"
                        aria-label="Apply generated code to editor"
                    >
                        <CheckIcon className="h-4 w-4" />
                        <span>Apply Code Changes</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatContentParser;
