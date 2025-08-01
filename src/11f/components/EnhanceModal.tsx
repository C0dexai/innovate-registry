import React, { useState } from 'react';
import { Modal } from './Modal';
import { SparklesIcon } from './Icons';

interface EnhanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEnhance: (description: string) => Promise<void>;
}

export const EnhanceModal: React.FC<EnhanceModalProps> = ({ isOpen, onClose, onEnhance }) => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        setIsLoading(true);
        await onEnhance(description);
        setIsLoading(false);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enhance Code with AI">
            <form onSubmit={handleSubmit}>
                <p className="text-sm text-dim-text mb-4">Describe the change you want to make to the current file. For example: "Refactor to use async/await" or "Add error handling to the fetch call".</p>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-primary p-2 rounded-md border border-slate-600 focus:ring-accent focus:border-accent"
                    placeholder="Enter enhancement description..."
                    required
                />
                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={isLoading || !description.trim()} className="bg-highlight text-white font-semibold py-2 px-5 rounded-lg hover:opacity-80 flex items-center gap-2 disabled:bg-slate-600">
                       {isLoading ? 'Enhancing...' : <><SparklesIcon className="w-4 h-4"/> Enhance Code</>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
