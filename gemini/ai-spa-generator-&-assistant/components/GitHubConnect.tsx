
import React, { useState } from 'react';
import { SpinnerIcon } from './icons';

interface GitHubConnectProps {
  onConnect: (token: string, repo: string) => Promise<void>;
}

const GitHubConnect: React.FC<GitHubConnectProps> = ({ onConnect }) => {
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !repo.trim()) {
      setError('Please provide both a token and a repository.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onConnect(token, repo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-neon-dark text-text-main">
      <div className="w-full max-w-md p-8 bg-neon-panel border border-neon-purple/30 rounded-lg shadow-2xl shadow-neon-purple/10">
        <h1 className="text-3xl font-bold text-primary text-center mb-2" style={{ textShadow: '0 0 10px #00f6ff' }}>
          Connect to GitHub
        </h1>
        <p className="text-center text-text-main/70 mb-8">
          Enter your Personal Access Token and repository to begin.
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-bold text-neon-purple mb-2">
              GitHub Personal Access Token (classic)
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full p-3 bg-neon-input border border-neon-border rounded-md text-text-input placeholder-text-main/50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
             <p className="text-xs text-text-main/60 mt-2">
                Requires a token with <code className="bg-neon-input p-1 rounded-sm">repo</code> scope. Your token is only stored in memory for this session.
            </p>
          </div>
          <div>
            <label htmlFor="repo" className="block text-sm font-bold text-neon-purple mb-2">
              Repository
            </label>
            <input
              id="repo"
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="owner/repo-name"
              className="w-full p-3 bg-neon-input border border-neon-border rounded-md text-text-input placeholder-text-main/50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center p-3 bg-primary text-dark rounded-md font-bold text-lg transition-all duration-200 hover:shadow-glow-blue disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? <SpinnerIcon /> : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GitHubConnect;
