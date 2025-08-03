import React, { useMemo, useRef, useState } from 'react';
import { HtmlIcon, CssIcon, JsIcon, DocumentTextIcon, FolderIcon, IconProps, NewFileIcon, NewFolderIcon, FileUploadIcon, PlayIcon, DownloadIcon, RefreshIcon } from './Icons';
import type { FileSystemState } from '../types';

interface FileExplorerProps {
  fileSystem: FileSystemState;
  activeFile: string | null;
  previewRoot: string | null;
  onFileSelect: (path: string) => void;
  onNewFile: (path: string) => void;
  onNewFolder: (path: string) => void;
  onFileUpload: (files: FileList) => void;
  onSetPreviewRoot: (path: string) => void;
  onDownloadProject: () => void;
  onRefresh: () => void;
}

const getFileIcon = (path: string): React.ReactElement<IconProps> => {
    if (path.endsWith('.html')) return <HtmlIcon className="h-5 w-5 text-[var(--neon-pink)]" />;
    if (path.endsWith('.css')) return <CssIcon className="h-5 w-5 text-[var(--neon-blue)]" />;
    if (path.endsWith('.js') || path.endsWith('.jsx')) return <JsIcon className="h-5 w-5 text-[var(--neon-green)]" />;
    if (path.endsWith('.md')) {
      if (path.includes('components')) return <DocumentTextIcon className="h-5 w-5 text-[var(--neon-purple)]" />
      return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
    }
    return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
};


interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

const buildFileTree = (fileSystem: FileSystemState): FileTreeNode[] => {
    // Defensive check in case a null/undefined value is ever passed, despite TypeScript types.
    if (!fileSystem) {
        return [];
    }
    
    const fileTree: { [key: string]: any } = {};
    
    Object.keys(fileSystem).sort().forEach(path => {
      if (path.endsWith('/.placeholder')) return;

      let currentLevel = fileTree;
      const parts = path.split('/').slice(1);

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const currentPath = `/${parts.slice(0, index + 1).join('/')}`;

        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            path: isFile ? currentPath : `${currentPath}/`,
            type: isFile ? 'file' : 'folder',
            // Only add children property for folders
            ...(isFile ? {} : { children: {} })
          };
        } else if (!isFile) {
            // This node might have been implicitly created as a file before
            // (e.g., from a path like "/docs") but now we know it's a folder.
            currentLevel[part].type = 'folder';
            if (!currentLevel[part].children) {
                currentLevel[part].children = {};
            }
        }
        
        // Only traverse deeper into the tree if it's a directory path
        if (!isFile) {
           currentLevel = currentLevel[part].children;
        }
      });
    });

    const convertTreeToArray = (tree: {[key:string]: any}): FileTreeNode[] => {
      if (!tree) return [];
      return Object.values(tree).map((node: any) => ({
        ...node,
        children: node.children ? convertTreeToArray(node.children) : undefined
      })).sort((a,b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'folder' ? -1 : 1;
      });
    }

    return convertTreeToArray(fileTree);
};

const FileNode: React.FC<{ 
  node: FileTreeNode; 
  depth: number;
  activeFile: string | null;
  previewRoot: string | null;
  onFileSelect: (path: string) => void; 
  onSetPreviewRoot: (path: string) => void;
}> = ({ node, depth, activeFile, previewRoot, onFileSelect, onSetPreviewRoot }) => {
  const [isOpen, setIsOpen] = useState(depth < 2);

  const isFolder = node.type === 'folder';
  const isSelected = activeFile === node.path;
  const isPreviewRoot = previewRoot === node.path;

  return (
    <div>
        <div className={`flex items-center gap-1 group rounded-md transition-colors ${
              isSelected ? 'bg-[var(--neon-purple)]/20' : 'hover:bg-white/5'
            }`}>
            <button
                onClick={() => isFolder ? setIsOpen(!isOpen) : onFileSelect(node.path)}
                aria-pressed={isSelected}
                style={{ paddingLeft: `${depth * 1 + 0.5}rem` }}
                className={`flex-grow flex items-center gap-3 p-2 text-left text-sm  
                ${ isSelected ? 'text-white font-semibold' : 'text-gray-300' }`}
            >
                {isFolder && (
                    <svg className={`flex-shrink-0 w-4 h-4 transform transition-transform text-[var(--neon-purple)]/70 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                )}
                <div className={`flex-shrink-0 h-5 w-5 ${isFolder ? 'ml-0' : 'ml-4'}`}>
                    {isFolder ? <FolderIcon className="text-[var(--neon-pink)]" /> : getFileIcon(node.path)}
                </div>
                <span className="truncate">{node.name}</span>
                {isPreviewRoot && <span title="This is the preview root" className="ml-auto flex-shrink-0"><PlayIcon className="h-4 w-4 text-[var(--neon-green)]" /></span>}
            </button>
            {isFolder && (
                <button 
                  onClick={() => onSetPreviewRoot(node.path)} 
                  className="p-1.5 text-gray-400 hover:text-[var(--neon-green)] hover:bg-black/20 rounded mr-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                  title="Set as Preview Root"
                >
                    <PlayIcon className="h-4 w-4" />
                </button>
            )}
      </div>

      {isFolder && isOpen && node.children && (
        <div className="flex flex-col">
            {node.children.map(child => (
              <FileNode 
                key={child.path} 
                node={child} 
                depth={depth + 1}
                activeFile={activeFile}
                previewRoot={previewRoot}
                onFileSelect={onFileSelect} 
                onSetPreviewRoot={onSetPreviewRoot}
              />
            ))}
        </div>
      )}
    </div>
  );
};


const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystem, activeFile, previewRoot, onFileSelect, onNewFile, onNewFolder, onFileUpload, onSetPreviewRoot, onDownloadProject, onRefresh }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const fileTree = useMemo(() => buildFileTree(fileSystem), [fileSystem]);

  const handleNewFile = () => {
    const path = prompt("Enter new file path (e.g., /components/Button.js):");
    if (path) {
      onNewFile(path.startsWith('/') ? path : `/${path}`);
    }
  };

  const handleNewFolder = () => {
    const path = prompt("Enter new folder path (e.g., /assets):");
    if (path) {
      onNewFolder(path.startsWith('/') ? path : `/${path}`);
    }
  };

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileUpload(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-1 p-1 border-b border-[var(--card-border)] mb-2">
         <button onClick={handleNewFile} className="p-1.5 text-gray-400 hover:text-[var(--neon-blue)] hover:bg-black/30 rounded" title="New File"><NewFileIcon className="h-5 w-5" /></button>
         <button onClick={handleNewFolder} className="p-1.5 text-gray-400 hover:text-[var(--neon-blue)] hover:bg-black/30 rounded" title="New Folder"><NewFolderIcon className="h-5 w-5" /></button>
         <button onClick={handleUploadClick} className="p-1.5 text-gray-400 hover:text-[var(--neon-blue)] hover:bg-black/30 rounded" title="Upload Files or ZIP"><FileUploadIcon className="h-5 w-5" /></button>
         <button onClick={onDownloadProject} className="p-1.5 text-gray-400 hover:text-[var(--neon-blue)] hover:bg-black/30 rounded" title="Download Project"><DownloadIcon className="h-5 w-5" /></button>
         <button onClick={onRefresh} className="p-1.5 text-gray-400 hover:text-[var(--neon-blue)] hover:bg-black/30 rounded" title="Refresh Explorer"><RefreshIcon className="h-5 w-5" /></button>
         <input type="file" ref={uploadInputRef} onChange={handleFileChange} className="hidden" multiple accept=".html,.css,.js,.jsx,.md,.json,.zip" />
      </div>
      <div className="flex flex-col gap-1">
        {fileTree.map(node => (
          <FileNode 
            key={node.path} 
            node={node} 
            depth={0} 
            activeFile={activeFile}
            previewRoot={previewRoot}
            onFileSelect={onFileSelect}
            onSetPreviewRoot={onSetPreviewRoot}
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;