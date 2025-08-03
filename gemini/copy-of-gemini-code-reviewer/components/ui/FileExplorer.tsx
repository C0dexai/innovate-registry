import React, { useMemo, useState } from 'react';
import { GitTreeFile, FileTreeNode } from '../../types.ts';
import { FolderIcon, FileIcon, ChevronRightIcon, DocumentPlusIcon, FolderPlusIcon, TrashIcon, Loader } from './Icons.tsx';

const buildFileTree = (files: GitTreeFile[]): FileTreeNode[] => {
    const root: FileTreeNode = { name: 'root', path: '', type: 'tree', children: [] };
    const nodeMap: { [key: string]: FileTreeNode } = { '': root };

    files.forEach(file => {
        const parts = file.path.split('/');
        let currentPath = '';
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            if (!nodeMap[currentPath]) {
                const newNode: FileTreeNode = {
                    name: part,
                    path: currentPath,
                    type: 'tree',
                    children: [],
                };
                nodeMap[currentPath] = newNode;
                nodeMap[parentPath].children!.push(newNode);
            }
        }
        
        const fileName = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1).join('/');
        const fileNode: FileTreeNode = {
            name: fileName,
            path: file.path,
            type: file.type,
            sha: file.sha,
        };
        nodeMap[file.path] = fileNode;
        nodeMap[parentPath].children!.push(fileNode);
    });
    
    const sortNodes = (nodes: FileTreeNode[]) => {
        nodes.sort((a, b) => {
            if (a.type === 'tree' && b.type !== 'tree') return -1;
            if (a.type !== 'tree' && b.type === 'tree') return 1;
            return a.name.localeCompare(b.name);
        });
        nodes.forEach(node => {
            if (node.children) {
                sortNodes(node.children);
            }
        });
    };

    sortNodes(root.children!);
    return root.children!;
};


interface FileExplorerProps {
  tree: GitTreeFile[];
  onOpenFile: (path: string, sha: string) => void;
  onCreateItem: (isFolder: boolean) => void;
  onDeleteItem: (path: string, sha: string) => void;
  isLoading: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = (props) => {
  const { tree, onOpenFile, onCreateItem, onDeleteItem, isLoading } = props;
  const fileTree = useMemo(() => buildFileTree(tree), [tree]);

  const Node: React.FC<{ node: FileTreeNode; indent: number; }> = ({ node, indent }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isDirectory = node.type === 'tree';

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isDirectory) {
          setIsOpen(!isOpen);
      } else {
          onOpenFile(node.path, node.sha!);
      }
    };

    return (
      <div className="group">
          <div 
              onClick={handleClick} 
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-700/50 rounded text-slate-300 relative"
              style={{ paddingLeft: `${indent * 1}rem` }}
              title={node.path}
          >
            {isDirectory ? (
              <ChevronRightIcon className={`w-3 h-3 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
            ) : (
              <div className="w-3 h-3 flex-shrink-0"></div>
            )}
            {isDirectory ? <FolderIcon className="w-5 h-5 text-sky-400 flex-shrink-0" /> : <FileIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />}
            <span className="text-sm font-medium truncate flex-1">{node.name}</span>
            {!isDirectory && (
              <div className="hidden group-hover:flex items-center gap-1 absolute right-2 bg-slate-700 rounded-md p-1">
                  <button onClick={(e) => { e.stopPropagation(); onDeleteItem(node.path, node.sha!);}} className="p-1 hover:text-red-400" title="Delete"><TrashIcon className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          {isOpen && node.children && (
            <div>
              {node.children.map((child) => (
                <Node key={child.path} node={child} indent={indent + 1} />
              ))}
            </div>
          )}
        </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-200">Explorer</h2>
        <div className="flex items-center gap-2 text-slate-400">
            <button onClick={() => onCreateItem(false)} title="New File" className="hover:text-white"><DocumentPlusIcon className="w-5 h-5"/></button>
            <button onClick={() => onCreateItem(true)} title="New Folder" className="hover:text-white"><FolderPlusIcon className="w-5 h-5"/></button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        {isLoading && !fileTree.length ? <Loader className="mx-auto mt-4"/> : fileTree.map((node) => (
          <Node key={node.path} node={node} indent={1} />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
