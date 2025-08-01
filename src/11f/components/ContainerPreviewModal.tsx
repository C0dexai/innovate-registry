import React from 'react';
import { XIcon } from './Icons';

interface ContainerPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    htmlContent: string;
    url: string;
}

export const ContainerPreviewModal: React.FC<ContainerPreviewModalProps> = ({ isOpen, onClose, htmlContent, url }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-primary rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-2 border-b border-slate-600 flex-shrink-0">
                    <h3 className="text-lg font-bold text-bright-text ml-2">Live Application Preview</h3>
                    <button onClick={onClose} className="p-1 text-dim-text hover:text-bright-text rounded-full">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow p-4 flex flex-col">
                     {/* Fake browser chrome */}
                    <div className="flex-shrink-0 bg-secondary p-2 rounded-t-md flex items-center text-sm border-b border-slate-600">
                        <div className="bg-primary rounded px-3 py-1 w-full font-mono truncate">
                            {url}
                        </div>
                    </div>
                    {/* Content */}
                    <div className="flex-grow w-full h-full bg-white rounded-b-md">
                        <iframe
                            srcDoc={htmlContent}
                            title="Live Application Preview"
                            sandbox="allow-scripts allow-same-origin"
                            className="w-full h-full border-none rounded-b-md"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};