import React, { useState, useRef, useEffect } from 'react';
import { FileNode } from '../types';
import { FolderIcon, FileIcon, ChevronRightIcon, AddIcon } from './FileIcons';

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  onAddNode: (parentId: string, name: string, type: 'file' | 'folder') => void;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, level, onAddNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleToggleExpand = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    }
  };

  const handleCreationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && isCreating) {
      onAddNode(node.id, newName.trim(), isCreating);
      setNewName('');
      setIsCreating(null);
    }
  };

  const handleCancelCreation = () => {
    setNewName('');
    setIsCreating(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelCreation();
    }
  };

  const startCreation = (type: 'file' | 'folder') => {
    setIsExpanded(true);
    setIsCreating(type);
  }

  const indentStyle = { paddingLeft: `${level * 1.5}rem` };

  return (
    <div>
      <div 
        className="flex items-center group py-1.5 px-2 rounded-md hover:bg-slate-700/50 transition-colors"
        style={indentStyle}
      >
        <div onClick={handleToggleExpand} className="flex-grow flex items-center cursor-pointer min-w-0">
          {node.type === 'folder' && (
            <ChevronRightIcon className={`mr-1 text-slate-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
          )}
           {node.type === 'folder' 
            ? <FolderIcon className="mr-2 text-red-400 flex-shrink-0" /> 
            : <FileIcon className="mr-2 text-slate-400 flex-shrink-0" />
           }
          <span className="text-neutral-200 font-light truncate" title={node.name}>{node.name}</span>
        </div>

        {node.type === 'folder' && (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
            <button onClick={() => startCreation('file')} className="text-slate-400 hover:text-white" aria-label={`New file in ${node.name}`}>
              <AddIcon />
            </button>
            <button onClick={() => startCreation('folder')} className="text-slate-400 hover:text-white" aria-label={`New folder in ${node.name}`}>
              <FolderIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeNode key={child.id} node={child} level={level + 1} onAddNode={onAddNode} />
          ))}
          {isCreating && (
            <div style={{ paddingLeft: `${(level + 1) * 1.5}rem` }} className="py-1.5 px-2">
              <form onSubmit={handleCreationSubmit} className="flex items-center">
                {isCreating === 'folder' 
                    ? <FolderIcon className="mr-2 text-red-400 flex-shrink-0" /> 
                    : <FileIcon className="mr-2 text-slate-400 flex-shrink-0" />
                }
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleCancelCreation}
                  onKeyDown={handleKeyDown}
                  placeholder={`New ${isCreating} name...`}
                  className="bg-slate-900 border border-slate-600 text-sm rounded-md py-1 px-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-600 w-full"
                  aria-label={`Enter name for new ${isCreating}`}
                />
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
