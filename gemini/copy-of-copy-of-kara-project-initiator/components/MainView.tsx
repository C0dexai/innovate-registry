
import React, { useState, useEffect, useCallback } from 'react';
import { GithubService } from '../services/githubService';
import { GithubRepo, GithubTree, GithubFile, GithubCommit, ActivityLog, FileTreeNode } from '../types';
import { ResizablePanels } from './ui/ResizablePanels';
import FileExplorer from './FileExplorer';
import WorkspaceView from './WorkspaceView';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface MainViewProps {
  service: GithubService;
  repo: GithubRepo;
}

const buildFileTree = (paths: { path: string, type: 'tree' | 'blob' }[]): FileTreeNode => {
  const root: FileTreeNode = { name: 'root', path: '', type: 'tree', children: {} };
  for (const item of paths) {
    let currentLevel = root;
    const parts = item.path.split('/');
    parts.forEach((part, index) => {
      if (!currentLevel.children) {
        currentLevel.children = {};
      }
      if (!currentLevel.children[part]) {
        currentLevel.children[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          type: index === parts.length - 1 ? item.type : 'tree',
        };
      }
      currentLevel = currentLevel.children[part];
    });
  }
  return root;
};


const MainView: React.FC<MainViewProps> = ({ service, repo }) => {
  const [fileTree, setFileTree] = useState<FileTreeNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string; sha: string; } | null>(null);
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string, type: ActivityLog['type'] = 'info') => {
    setActivityLog(prev => [{ id: Date.now(), message, type, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const fetchTree = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      addLog(`Fetching file tree for ${repo.full_name}...`);
      const treeData = await service.getTree(repo.owner.login, repo.name, repo.default_branch);
      const tree = buildFileTree(treeData.tree);
      setFileTree(tree);
      addLog('File tree loaded successfully.', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to fetch file tree: ${errorMessage}`);
      addLog(`Failed to fetch file tree: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [service, repo]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleFileSelect = useCallback(async (path: string) => {
    try {
      addLog(`Fetching content for ${path}...`);
      const fileData = await service.getContent(repo.owner.login, repo.name, path);
      // a-zA-Z0-9+/=
      const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
      setSelectedFile({ path: fileData.path, content: decodedContent, sha: fileData.sha });
      addLog(`Content for ${path} loaded.`, 'success');
      
      addLog(`Fetching commit history for ${path}...`);
      const commitData = await service.getCommits(repo.owner.login, repo.name, path);
      setCommits(commitData);
      addLog(`Commit history for ${path} loaded.`, 'success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      addLog(`Failed to select file ${path}: ${errorMessage}`, 'error');
    }
  }, [service, repo]);

  const handleCommit = useCallback(async (path: string, content: string, message: string, sha: string) => {
    try {
      addLog(`Committing changes to ${path}...`);
      await service.updateContent(repo.owner.login, repo.name, path, message, content, sha);
      addLog(`Successfully committed changes to ${path}.`, 'success');
      // Refresh file content and tree
      await handleFileSelect(path); 
      await fetchTree();

    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
       addLog(`Failed to commit changes: ${errorMessage}`, 'error');
    }
  }, [service, repo, handleFileSelect, fetchTree]);


  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center">
        <SpinnerIcon className="w-12 h-12 text-brand-primary animate-spin-slow" />
        <p className="mt-4 text-md text-dark-base-content/80">Loading Repository...</p>
      </div>
    );
  }

  if (error) {
     return (
       <div className="flex-grow flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-red-400">Error</h2>
          <p className="mt-2 text-dark-base-content/80">{error}</p>
      </div>
    );
  }

  const leftPanel = (
    <div className="h-full overflow-y-auto p-2">
      <FileExplorer tree={fileTree} onFileSelect={handleFileSelect} />
    </div>
  );
  
  const rightPanel = (
    <div className="h-full p-2">
      <WorkspaceView 
        selectedFile={selectedFile}
        commits={commits}
        activityLog={activityLog}
        onCommit={handleCommit}
      />
    </div>
  );

  return (
    <ResizablePanels leftPanel={leftPanel} rightPanel={rightPanel} />
  );
};

export default MainView;
