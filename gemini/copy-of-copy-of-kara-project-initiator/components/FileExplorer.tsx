
import React, { useState } from 'react';
import { FileTreeNode } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { FileIcon } from './icons/FileIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';


interface FileExplorerProps {
  tree: FileTreeNode | null;
  onFileSelect: (path: string) => void;
}

const TreeNode: React.FC<{ node: FileTreeNode; onFileSelect: (path: string) => void; level: number }> = ({ node, onFileSelect, level }) => {
    const [isOpen, setIsOpen] = useState(level === 0);
    const isDir = node.type === 'tree';

    const handleToggle = () => {
        if (isDir) {
            setIsOpen(!isOpen);
        } else {
            onFileSelect(node.path);
        }
    };

    return (
        <div>
            <div
                onClick={handleToggle}
                className="flex items-center p-1.5 rounded-md hover:bg-dark-base-300/50 cursor-pointer text-sm"
                style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
            >
                {isDir ? (
                    <>
                        {isOpen ? <ChevronDownIcon className="w-4 h-4 mr-2 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 mr-2 flex-shrink-0" />}
                        <FolderIcon className="w-5 h-5 mr-2 text-brand-accent flex-shrink-0" />
                    </>
                ) : (
                    <FileIcon className="w-5 h-5 mr-2 text-dark-base-content/70 ml-6 flex-shrink-0" />
                )}
                <span className="truncate">{node.name}</span>
            </div>
            {isDir && isOpen && node.children && (
                <div>
                    {Object.values(node.children)
                        .sort((a, b) => {
                            // Sort folders first, then files, then alphabetically
                            if (a.type === b.type) return a.name.localeCompare(b.name);
                            return a.type === 'tree' ? -1 : 1;
                        })
                        .map(child => (
                            <TreeNode key={child.path} node={child} onFileSelect={onFileSelect} level={level + 1} />
                        ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ tree, onFileSelect }) => {
  if (!tree) {
    return <div className="p-4 text-dark-base-content/70">No files found.</div>;
  }

  return (
    <div className="text-dark-base-content/90">
      <h3 className="text-lg font-semibold p-2 mb-2">File Explorer</h3>
       {tree && <TreeNode node={tree} onFileSelect={onFileSelect} level={0} />}
    </div>
  );
};

export default FileExplorer;
