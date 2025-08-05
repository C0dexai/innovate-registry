import React, { useState } from 'react';
import { GitHubNode } from '../types';
import { PanelLeftCloseIcon, CodeIcon, FolderIcon, FolderOpenIcon, FileIcon } from './icons';

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'md':
        case 'js':
        case 'ts':
        case 'tsx':
        case 'jsx':
        case 'json':
        case 'html':
        case 'css':
        case 'scss':
        case 'py':
        case 'rb':
        case 'java':
            return <CodeIcon className="w-4 h-4 mr-2.5 text-text-main/70 flex-shrink-0" />;
        default:
            return <FileIcon className="w-4 h-4 mr-2.5 text-text-main/70 flex-shrink-0" />;
    }
};

const Node: React.FC<{ node: GitHubNode; onFileSelect: (path: string) => void; activeFile: string | null; level: number }> = ({ node, onFileSelect, activeFile, level }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (node.type === 'tree') {
        return (
            <div>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center px-4 py-2 cursor-pointer text-sm truncate transition-colors duration-200 hover:bg-neon-input/50"
                    style={{ paddingLeft: `${level * 16 + 16}px` }}
                >
                    {isOpen ? <FolderOpenIcon className="w-4 h-4 mr-2.5 text-neon-yellow flex-shrink-0" /> : <FolderIcon className="w-4 h-4 mr-2.5 text-neon-yellow flex-shrink-0" />}
                    <span className="truncate">{node.name}</span>
                </div>
                {isOpen && node.children && (
                    <div>
                        {node.children.map(child => (
                            <Node key={child.path} node={child} onFileSelect={onFileSelect} activeFile={activeFile} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            onClick={() => onFileSelect(node.path)}
            title={node.path}
            className={`flex items-center px-4 py-2 cursor-pointer text-sm truncate transition-colors duration-200 border-l-4 ${
                activeFile === node.path
                ? 'bg-primary/10 border-primary text-primary-hover font-semibold'
                : 'border-transparent hover:bg-neon-input/50 hover:border-primary/50'
            }`}
            style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
            {getFileIcon(node.name)}
            <span className="truncate">{node.name}</span>
        </div>
    );
};


const FileExplorer: React.FC<{
  files: GitHubNode[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}> = ({ files, activeFile, onFileSelect, onToggleCollapse, isCollapsed }) => {
  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="bg-neon-panel backdrop-blur-sm border border-neon-border rounded-lg overflow-hidden flex flex-col h-full min-w-0 shadow-lg shadow-neon-purple/10">
      <div className="flex justify-between items-center p-4 border-b border-neon-border flex-shrink-0">
        <h2 className="text-lg font-bold text-primary truncate" style={{ textShadow: '0 0 5px #00f6ff' }}>
          File Explorer
        </h2>
        <button onClick={onToggleCollapse} title="Collapse Panel" className="text-text-main hover:text-primary transition-colors flex-shrink-0 ml-2">
            <PanelLeftCloseIcon />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {files.map(node => (
            <Node key={node.path} node={node} onFileSelect={onFileSelect} activeFile={activeFile} level={0} />
        ))}
      </div>
    </aside>
  );
};

export default FileExplorer;