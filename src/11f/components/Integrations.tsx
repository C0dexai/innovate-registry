import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { openaiService } from '../services/openaiService';
import type { ApiKeys } from '../types';

const Integrations: React.FC = () => {
    const { apiKeys, setApiKeys } = useContext(AppContext);
    const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);
    const [status, setStatus] = useState<{ gemini: string; openai: string }>({ gemini: '', openai: '' });
    const [loading, setLoading] = useState<{ gemini: boolean; openai: boolean }>({ gemini: false, openai: false });

    const handleKeyChange = (service: 'gemini' | 'openai', value: string) => {
        setLocalKeys(prev => ({ ...prev, [service]: value }));
    };

    const handleSaveAndValidate = async (service: 'gemini' | 'openai') => {
        setLoading(prev => ({ ...prev, [service]: true }));
        setStatus(prev => ({ ...prev, [service]: 'Validating...' }));
        
        const key = localKeys[service];
        let isValid = false;

        try {
            if (service === 'gemini') {
                isValid = await geminiService.validateKey(key);
            } else {
                isValid = await openaiService.validateKey(key);
            }

            if (isValid) {
                setApiKeys(localKeys); // Save all keys to context/persistence
                setStatus(prev => ({ ...prev, [service]: 'API Key validated and saved!' }));
            } else {
                setStatus(prev => ({ ...prev, [service]: 'Invalid API Key.' }));
            }
        } catch (error) {
             setStatus(prev => ({ ...prev, [service]: 'Validation failed.' }));
             console.error(`Validation error for ${service}:`, error);
        }

        setLoading(prev => ({ ...prev, [service]: false }));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto text-bright-text">
            <h2 className="text-3xl font-bold mb-2">API Integrations</h2>
            <p className="text-dim-text mb-8">Manage your API keys for Gemini and OpenAI. Keys are stored securely in your browser's local database.</p>
            
            <div className="space-y-8">
                {/* Gemini Card */}
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Google Gemini</h3>
                    <div className="space-y-2">
                        <label htmlFor="gemini-key" className="text-sm font-medium text-dim-text">API Key</label>
                        <input
                            id="gemini-key"
                            type="password"
                            value={localKeys.gemini}
                            onChange={(e) => handleKeyChange('gemini', e.target.value)}
                            className="w-full bg-primary p-2 rounded-md border border-slate-600 focus:ring-accent focus:border-accent"
                            placeholder="Enter your Google AI Studio API Key"
                        />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            onClick={() => handleSaveAndValidate('gemini')}
                            disabled={loading.gemini}
                            className="bg-accent text-white py-2 px-4 rounded-lg hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading.gemini ? 'Validating...' : 'Save & Validate Key'}
                        </button>
                        <p className={`text-sm ${status.gemini.includes('Invalid') ? 'text-red-400' : 'text-green-400'}`}>{status.gemini}</p>
                    </div>
                </div>

                {/* OpenAI Card */}
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">OpenAI</h3>
                    <div className="space-y-2">
                        <label htmlFor="openai-key" className="text-sm font-medium text-dim-text">API Key</label>
                        <input
                            id="openai-key"
                            type="password"
                            value={localKeys.openai}
                            onChange={(e) => handleKeyChange('openai', e.target.value)}
                            className="w-full bg-primary p-2 rounded-md border border-slate-600 focus:ring-accent focus:border-accent"
                            placeholder="Enter your OpenAI API Key (sk-...)"
                        />
                    </div>
                     <div className="mt-4 flex items-center justify-between">
                        <button
                            onClick={() => handleSaveAndValidate('openai')}
                            disabled={loading.openai}
                            className="bg-accent text-white py-2 px-4 rounded-lg hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading.openai ? 'Validating...' : 'Save & Validate Key'}
                        </button>
                        <p className={`text-sm ${status.openai.includes('Invalid') ? 'text-red-400' : 'text-green-400'}`}>{status.openai}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integrations;