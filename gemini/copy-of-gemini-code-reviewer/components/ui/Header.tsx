import React from 'react';
import { SparklesIcon, Cog6ToothIcon, CodeBracketIcon } from './Icons.tsx';
import { RepoDetails } from '../../types.ts';

interface HeaderProps {
    onSettingsClick: () => void;
    repoDetails: RepoDetails | null;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick, repoDetails }) => {
  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20 flex-shrink-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-violet-400" />
          <h1 className="text-2xl font-bold text-slate-100 hidden sm:block">
            Gemini AI IDE
          </h1>
        </div>

        {repoDetails && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm">
            <CodeBracketIcon className="w-5 h-5 text-slate-400" />
            <a href={repoDetails.html_url} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-300 hover:text-violet-400 transition-colors">
              {repoDetails.full_name}
            </a>
          </div>
        )}

        <button 
          onClick={onSettingsClick}
          className="p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors"
          title="Settings"
          aria-label="Open settings panel"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
