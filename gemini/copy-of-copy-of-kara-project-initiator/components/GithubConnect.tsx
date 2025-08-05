
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { GithubIcon } from './icons/GithubIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { GithubService } from '../services/githubService';
import { GithubRepo } from '../types';

interface GithubConnectProps {
  onConnect: (token: string) => Promise<void>;
  onRepoSelect: (repo: GithubRepo) => void;
  service: GithubService | null;
  isLoading: boolean;
  error: string | null;
}

const GithubConnect: React.FC<GithubConnectProps> = ({ onConnect, onRepoSelect, service, isLoading, error }) => {
  const [token, setToken] = useState('');
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState('');
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);

  useEffect(() => {
    if (service && repos.length === 0) {
      const fetchRepos = async () => {
        setIsFetchingRepos(true);
        try {
          const userRepos = await service.getRepos();
          setRepos(userRepos);
        } catch (err) {
            // Error is handled in App.tsx
        } finally {
            setIsFetchingRepos(false);
        }
      };
      fetchRepos();
    }
  }, [service, repos.length]);

  const handleConnectClick = () => {
    if (token) {
      onConnect(token);
    }
  };
  
  const handleLoadRepoClick = () => {
    const selected = repos.find(r => r.full_name === selectedRepoFullName);
    if(selected) {
        onRepoSelect(selected);
    }
  }
  
  const repoOptions = repos.map(repo => ({ value: repo.full_name, label: repo.full_name }));

  return (
    <Card className="max-w-md w-full">
      <div className="text-center mb-6">
        <GithubIcon className="w-16 h-16 text-brand-primary mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Connect to GitHub</h2>
        <p className="text-dark-base-content/70 mt-1">Enter your Personal Access Token to begin.</p>
        <a 
          href="https://github.com/settings/tokens" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-brand-accent hover:underline mt-1"
        >
          (Create a token with 'repo' scope)
        </a>
      </div>

      {!service ? (
        <div className="space-y-4">
          <Input 
            label="GitHub Personal Access Token" 
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
          />
          <Button onClick={handleConnectClick} disabled={isLoading || !token} className="w-full">
            {isLoading ? 'Connecting...' : 'Connect'}
            <SparklesIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
            <Select
                label="Select a Repository"
                value={selectedRepoFullName}
                onChange={e => setSelectedRepoFullName(e.target.value)}
                options={isFetchingRepos ? [{ value: '', label: 'Loading repos...'}] : repoOptions}
                disabled={isFetchingRepos}
            />
             <Button onClick={handleLoadRepoClick} disabled={!selectedRepoFullName} className="w-full">
                Load Repository
            </Button>
        </div>
      )}
       {error && <p className="text-red-400/90 bg-red-900/20 p-3 rounded-md text-sm mt-4">{error}</p>}
    </Card>
  );
};

export default GithubConnect;
