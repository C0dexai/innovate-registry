import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import type { BuildStepMessage, CodeAnalysis } from '../types';
import { CheckCircleIcon, SparklesIcon, BotIcon, PlayIcon, FileIcon } from './Icons';
import { geminiService } from '../services/geminiService';
import { SyntaxHighlighter } from './SyntaxHighlighter';


export const BuildStepCard: React.FC<{ message: BuildStepMessage }> = ({ message }) => {
    const { applyBuildStep, apiKeys } = useContext(AppContext);
    const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (isAnalyzing || !message.codeBlocks.length) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        
        // Analyze the first code block for simplicity
        const block = message.codeBlocks[0];
        const result = await geminiService.analyzeCode(block.filePath, block.code, apiKeys.gemini);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    const handleApply = () => {
        if (message.status === 'pending') {
            applyBuildStep(message.id);
        }
    };
    
    const statusPillClasses = {
        pending: 'bg-slate-600 text-dim-text',
        applying: 'bg-amber-600 text-amber-100 animate-pulse',
        applied: 'bg-green-600 text-green-100',
    };

    return (
        <div className="flex items-start gap-3 w-full">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-2"><BotIcon className="w-5 h-5 text-white" /></div>
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

                {isAnalyzing && <div className="text-sm text-dim-text animate-pulse my-2">Analyzing code...</div>}
                {analysis && (
                     <details className="text-sm my-3 bg-primary p-3 rounded-lg">
                        <summary className="cursor-pointer text-dim-text hover:text-bright-text font-semibold">View Analysis</summary>
                        <p className="mt-2 text-bright-text whitespace-pre-wrap">{analysis.summary}</p>
                        <ul className="mt-2 space-y-2 list-disc list-inside text-bright-text pl-2">
                           {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </details>
                )}

                <div className="mt-4 pt-3 border-t border-slate-600 flex items-center gap-3">
                     <button
                        onClick={handleAnalyze}
                        disabled={message.status !== 'pending' || isAnalyzing}
                        className="flex-1 text-sm bg-slate-600 text-bright-text py-1.5 px-3 rounded-md hover:bg-slate-500 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <SparklesIcon className="w-4 h-4"/> Analyze Code
                    </button>
                    <button 
                        onClick={handleApply}
                        disabled={message.status !== 'pending'}
                        className="flex-1 text-sm bg-accent text-white py-1.5 px-3 rounded-md hover:bg-sky-400 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlayIcon className="w-4 h-4"/> Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};