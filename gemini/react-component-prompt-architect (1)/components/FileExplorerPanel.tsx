
import React from 'react';
import { InputField } from './shared/InputField';
import { FolderIcon, FileIcon, LoadingSpinnerIcon } from './icons';

// Mock data for the file tree
const fileTree = {
  'src': {
    'components': {
      'Button.tsx': null,
      'Card.tsx': null,
      'Modal.tsx': null,
    },
    'hooks': {
      'useAuth.ts': null,
      'useLocalStorage.ts': null,
    },
    'App.tsx': null,
    'index.css': null,
  },
  'public': {
    'index.html': null,
    'favicon.ico': null,
  },
  '.gitignore': null,
  'package.json': null,
  'README.md': null,
};

const TreeNode: React.FC<{ name: string; node: any; level: number }> = ({ name, node, level }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isDirectory = node !== null && typeof node === 'object';

  const indentStyle = { paddingLeft: `${level * 1.25}rem` };

  return (
    <div>
      <div
        className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--color-background)] cursor-pointer transition-colors"
        style={indentStyle}
        onClick={() => isDirectory && setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && isDirectory && setIsOpen(!isOpen)}
      >
        {isDirectory ? (
          <FolderIcon className="w-5 h-5 text-[var(--color-accent-blue)] flex-shrink-0" />
        ) : (
          <FileIcon className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0" />
        )}
        <span className="text-sm truncate">{name}</span>
      </div>
      {isDirectory && isOpen && (
        <div>
          {Object.entries(node).map(([childName, childNode]) => (
            <TreeNode key={childName} name={childName} node={childNode} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorerPanel: React.FC = () => {
    // In a real app, this state would be used to fetch from GitHub
    const [owner, setOwner] = React.useState('facebook');
    const [repo, setRepo] = React.useState('react');
    const [token, setToken] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [connected, setConnected] = React.useState(true); // Default to connected to show tree

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setConnected(true);
        }, 1500);
    };

    return (
        <aside className="w-[300px] bg-[var(--color-background-offset)] p-4 flex flex-col border-r border-[var(--border-color)] h-screen sticky top-0">
            <h2 className="text-lg font-bold text-white mb-4">GitHub Repository</h2>
            <form onSubmit={handleConnect}>
                <div className="space-y-3">
                    <InputField label="Owner" id="gh-owner" value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g., facebook" />
                    <InputField label="Repository" id="gh-repo" value={repo} onChange={e => setRepo(e.target.value)} placeholder="e.g., react" />
                    <InputField label="GitHub Token" id="gh-token" type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Requires 'repo' scope" />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black font-bold rounded-md shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] focus:ring-[var(--color-primary-hover)] disabled:opacity-50"
                >
                    {loading ? <LoadingSpinnerIcon className="w-5 h-5 animate-spin" /> : null}
                    {loading ? 'Connecting...' : 'Connect to Repository'}
                </button>
            </form>
            <div className="border-t border-[var(--border-color)] my-4"></div>
            <h3 className="text-md font-semibold text-white mb-2">File Explorer</h3>
            <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                 {connected ? Object.entries(fileTree).map(([name, node]) => (
                    <TreeNode key={name} name={name} node={node} level={0} />
                 )) : <p className="text-sm text-[var(--color-text-muted)]">Connect to a repository to browse files.</p>}
            </div>
        </aside>
    );
};

export default FileExplorerPanel;
