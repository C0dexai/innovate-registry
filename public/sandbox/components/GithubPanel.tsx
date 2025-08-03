import React, { useState } from 'react';
import { GithubIcon, SpinnerIcon } from './Icons';
import type { GithubUser, GithubRepo, GithubBranch, FileChange } from '../types';

interface GithubPanelProps {
    isConnected: boolean;
    user: GithubUser | null;
    repos: GithubRepo[];
    branches: GithubBranch[];
    selectedRepo: string;
    selectedBranch: string;
    changedFiles: FileChange[];
    isLoading: boolean;
    error: string;
    onConnect: (token: string) => void;
    onDisconnect: () => void;
    onRepoSelected: (repoFullName: string) => void;
    onBranchSelected: (branchName: string) => void;
    onLoadRepo: () => void;
    onCommit: (message: string) => void;
    initialToken: string;
    onTokenChange: (token: string) => void;
}

const inputStyles = "w-full p-2 bg-black/30 border border-[var(--card-border)] rounded-md focus:ring-2 focus:ring-[var(--neon-purple)] focus:border-[var(--neon-purple)] focus:outline-none transition font-mono text-sm disabled:opacity-50";
const buttonStyles = "w-full flex items-center justify-center gap-2 bg-[var(--neon-purple)] hover:brightness-125 disabled:bg-[var(--neon-purple)]/50 disabled:cursor-not-allowed text-black font-bold py-2 px-3 rounded-md transition-all whitespace-nowrap";


const GithubPanel: React.FC<GithubPanelProps> = ({
    isConnected, user, repos, branches, selectedRepo, selectedBranch, changedFiles,
    isLoading, error, onConnect, onDisconnect, onRepoSelected, onBranchSelected,
    onLoadRepo, onCommit, initialToken, onTokenChange
}) => {
    const [commitMessage, setCommitMessage] = useState('');

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        onConnect(initialToken);
    };

    const handleCommit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commitMessage.trim()) return;
        onCommit(commitMessage);
        setCommitMessage('');
    }

    const renderFileStatus = (status: FileChange['status']) => {
        switch (status) {
            case 'added': return <span className="text-green-400 font-bold" title="Added">A</span>;
            case 'modified': return <span className="text-yellow-400 font-bold" title="Modified">M</span>;
            case 'deleted': return <span className="text-red-500 font-bold" title="Deleted">D</span>;
            default: return null;
        }
    };

    if (!isConnected) {
        return (
            <form onSubmit={handleConnect} className="space-y-3">
                <p className="text-xs text-gray-400">
                    Connect to GitHub to load repos and commit changes. Your token is stored locally.
                </p>
                <div>
                    <label htmlFor="github-token" className="text-sm font-semibold mb-1 block">Personal Access Token</label>
                    <input
                        id="github-token"
                        type="password"
                        value={initialToken}
                        onChange={(e) => onTokenChange(e.target.value)}
                        className={inputStyles}
                        placeholder="ghp_..."
                        disabled={isLoading}
                    />
                </div>
                <button type="submit" disabled={isLoading || !initialToken} className={buttonStyles}>
                    {isLoading ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : <GithubIcon className="h-5 w-5" />}
                    <span>{isLoading ? 'Connecting...' : 'Connect'}</span>
                </button>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
        );
    }

    return (
        <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <img src={user?.avatar_url} alt={user?.login} className="h-8 w-8 rounded-full" />
                    <a href={user?.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{user?.login}</a>
                </div>
                <button onClick={onDisconnect} className="text-xs text-gray-400 hover:text-[var(--neon-pink)]">Disconnect</button>
            </div>
            
            {/* Repo & Branch Selection */}
            <div className="space-y-3">
                <div>
                    <label htmlFor="repo-select" className="text-sm font-semibold mb-1 block">Repository</label>
                    <select id="repo-select" value={selectedRepo} onChange={e => onRepoSelected(e.target.value)} className={inputStyles} disabled={isLoading}>
                        <option value="">-- Select a Repository --</option>
                        {repos.map(r => <option key={r.full_name} value={r.full_name}>{r.full_name}</option>)}
                    </select>
                </div>
                {selectedRepo && (
                    <div>
                        <label htmlFor="branch-select" className="text-sm font-semibold mb-1 block">Branch</label>
                        <select id="branch-select" value={selectedBranch} onChange={e => onBranchSelected(e.target.value)} className={inputStyles} disabled={isLoading || branches.length === 0}>
                            <option value="">-- Select a Branch --</option>
                            {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                )}
                <button onClick={onLoadRepo} disabled={isLoading || !selectedRepo || !selectedBranch} className={buttonStyles}>
                    {isLoading ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : null}
                    <span>{isLoading ? 'Loading...' : 'Load Repo'}</span>
                </button>
            </div>

            {/* Source Control (Commit) */}
            {changedFiles.length > 0 && (
                <form onSubmit={handleCommit} className="space-y-3 pt-4 border-t border-[var(--card-border)]">
                    <h3 className="font-semibold">Source Control</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                        {changedFiles.map(file => (
                            <div key={file.path} className="flex items-center justify-between text-sm font-mono bg-black/20 p-2 rounded-md">
                                <span className="truncate" title={file.path}>{file.path}</span>
                                {renderFileStatus(file.status)}
                            </div>
                        ))}
                    </div>
                    <div>
                         <label htmlFor="commit-message" className="text-sm font-semibold mb-1 block">Commit Message</label>
                        <textarea
                            id="commit-message"
                            value={commitMessage}
                            onChange={e => setCommitMessage(e.target.value)}
                            className={`${inputStyles} h-20`}
                            placeholder="Enter commit message..."
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading || !commitMessage.trim()} className={buttonStyles}>
                         {isLoading ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : null}
                        <span>{isLoading ? 'Committing...' : `Commit & Push`}</span>
                    </button>
                </form>
            )}

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default GithubPanel;
