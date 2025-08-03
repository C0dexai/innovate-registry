import React from 'react';
import { XMarkIcon, LightBulbIcon } from './Icons.tsx';
import { RepoDetails } from '../../types.ts';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  repoDetails: RepoDetails | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, repoDetails }) => {
  if (!isOpen) return null;

  const ApiKeyPlaceholder = ({ serviceName, envVar, isConfigured }: { serviceName: string, envVar: string, isConfigured: boolean }) => (
    <div>
        <label htmlFor={`${serviceName}-key`} className="block text-sm font-medium text-slate-300 mb-1">{serviceName} API Key</label>
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className={`text-sm ${isConfigured ? 'text-green-400' : 'text-red-400'}`}>
                {isConfigured ? 'Configured via environment variable' : 'Not configured'}
            </p>
        </div>
        <div className="bg-blue-900/50 border border-blue-700 text-blue-300 text-sm p-3 rounded-lg mt-4 flex gap-3">
            <LightBulbIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-bold">This key is managed by your environment.</p>
                <p>For security, the API key is sourced from the <code className="bg-slate-700 rounded px-1.5 py-1 font-mono text-violet-300 text-xs">{envVar}</code> environment variable and is not configurable in the UI.</p>
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-100">Settings &amp; Environment</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700"><XMarkIcon className="w-6 h-6"/></button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <ApiKeyPlaceholder serviceName="Google Gemini" envVar="API_KEY" isConfigured={!!process.env.API_KEY} />
            <ApiKeyPlaceholder serviceName="GitHub" envVar="GITHUB_TOKEN" isConfigured={!!process.env.GITHUB_TOKEN} />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">GitHub Repository</label>
               <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${repoDetails ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className={`text-sm font-mono ${repoDetails ? 'text-green-400' : 'text-red-400'}`}>
                      {process.env.GITHUB_REPO || 'GITHUB_REPO not set'}
                  </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
