import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import type { InstallationRecommendationMessage } from '../types';
import { CheckCircleIcon, SparklesIcon, FileIcon } from './Icons';
import { SyntaxHighlighter } from './SyntaxHighlighter';


export const InstallationRecommendationCard: React.FC<{ containerId: string, message: InstallationRecommendationMessage }> = ({ containerId, message }) => {
    const { applyInstallationRecommendation } = useContext(AppContext);

    const handleApply = () => {
        if (message.status === 'pending') {
            applyInstallationRecommendation(containerId, message.id);
        }
    };
    
    const statusPillClasses = {
        pending: 'bg-slate-600 text-dim-text',
        installing: 'bg-amber-600 text-amber-100 animate-pulse',
        installed: 'bg-green-600 text-green-100',
    };
    
    if (message.codeBlocks.length === 0) {
        return (
            <div className="bg-secondary p-3 rounded-lg my-2">
                <p className="text-sm text-dim-text">{message.description}</p>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-3 w-full my-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-2">
                <SparklesIcon className="w-4 h-4 text-highlight" />
            </div>
            <div className="flex-grow max-w-2xl bg-secondary rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-bright-text">{message.title}</h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusPillClasses[message.status]}`}>
                        {message.status.toUpperCase()}
                    </span>
                </div>
                <p className="text-sm text-dim-text mt-2 mb-4 whitespace-pre-wrap">{message.description}</p>
                
                <div className="space-y-3">
                    {message.codeBlocks.map((block, index) => (
                        <div key={index}>
                             <div className="flex items-center gap-2 text-xs text-dim-text mb-1">
                                <FileIcon className="w-3 h-3"/>
                                <span>{block.filePath}</span>
                            </div>
                            <SyntaxHighlighter language={block.language} code={block.code} />
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-600 flex items-center">
                    <button 
                        onClick={handleApply}
                        disabled={message.status !== 'pending'}
                        className="w-full text-sm bg-accent text-white py-1.5 px-3 rounded-md hover:bg-sky-400 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <SparklesIcon className="w-4 h-4"/> Install
                    </button>
                </div>
            </div>
        </div>
    );
};