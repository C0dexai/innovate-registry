import React, { useState, useEffect } from 'react';
import { GeneratedCode } from '../types';
import { idbGet } from '../idb';
import { Button } from './ui/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { LayoutIcon } from './icons/LayoutIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { JsIcon } from './icons/JsIcon';
import { CssIcon } from './icons/CssIcon';


interface CodePreviewProps {
  projectName: string;
  onClose: () => void;
}

type TabName = 'Preview' | 'HTML' | 'CSS' | 'JS';

const CodeViewer: React.FC<{ code: string }> = ({ code }) => (
    <pre className="bg-dark-base-200/50 border border-dark-base-300/30 p-4 rounded-lg text-sm text-dark-base-content/90 overflow-auto h-full">
        <code>{code}</code>
    </pre>
);

export const CodePreview: React.FC<CodePreviewProps> = ({ projectName, onClose }) => {
    const [code, setCode] = useState<GeneratedCode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabName>('Preview');

    useEffect(() => {
        const fetchCode = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await idbGet<GeneratedCode>(projectName);
                if (data) {
                    setCode(data);
                } else {
                    setError('No preview data found. Please generate it first.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load preview data from the database.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCode();
    }, [projectName]);

    const srcDoc = `
        <html>
            <head>
                <style>
                    body { margin: 0; }
                    ${code?.css || ''}
                </style>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
                ${code?.html || ''}
                <script>${code?.js || ''}</script>
            </body>
        </html>
    `;
    
    const tabConfig: { name: TabName, icon: React.ReactNode }[] = [
        { name: 'Preview', icon: <LayoutIcon className="w-5 h-5"/> },
        { name: 'HTML', icon: <CodeBracketIcon className="w-5 h-5"/> },
        { name: 'CSS', icon: <CssIcon className="w-5 h-5"/> },
        { name: 'JS', icon: <JsIcon className="w-5 h-5"/> },
    ];

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex-grow h-full flex flex-col items-center justify-center">
                    <SpinnerIcon className="w-12 h-12 text-brand-primary animate-spin-slow" />
                    <p className="mt-4 text-md text-dark-base-content/80">Loading Preview...</p>
                </div>
            );
        }

        if (error || !code) {
            return (
                 <div className="flex-grow h-full flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-bold text-red-400">Error</h2>
                    <p className="mt-2 text-dark-base-content/80">{error || 'Could not display preview.'}</p>
                </div>
            );
        }
        
        switch (activeTab) {
            case 'Preview':
                return <iframe srcDoc={srcDoc} title="Code Preview" className="w-full h-full border-0 bg-white rounded-lg" sandbox="allow-scripts"/>;
            case 'HTML':
                return <CodeViewer code={code.html} />;
            case 'CSS':
                return <CodeViewer code={code.css} />;
            case 'JS':
                return <CodeViewer code={code.js} />;
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col bg-dark-base-200/70 backdrop-blur-sm" style={{ height: 'calc(100vh - 73px)' }}>
            <div className="p-4 border-b border-dark-base-300/50 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-dark-base-content">Generated Code</h2>
                <Button onClick={onClose} className="!py-2 !px-4 text-sm bg-dark-base-300 hover:bg-dark-base-300/80 text-dark-base-content/80 !font-medium">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Configuration
                </Button>
            </div>
            
            <div className="flex-shrink-0 border-b border-dark-base-300/50 bg-dark-base-100/30 px-4">
                <nav className="flex space-x-2" aria-label="Tabs">
                    {tabConfig.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`
                                ${activeTab === tab.name
                                    ? 'bg-brand-secondary text-black shadow-glow-pink'
                                    : 'bg-dark-base-300/50 text-dark-base-content/70 hover:bg-dark-base-300/80 hover:text-dark-base-content'
                                }
                                whitespace-nowrap py-2 px-4 rounded-t-lg font-medium text-sm flex items-center gap-2 transition-all duration-300
                            `}
                        >
                            {tab.icon}
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="flex-grow p-4 overflow-auto bg-dark-base-100">
                 {renderContent()}
            </div>
        </div>
    );
};