import React, { useState, useRef, useCallback } from 'react';
import { FileNode } from '../types';
import FileTreeNode from './FileTreeNode';
import { UploadIcon } from './FileIcons';

const initialFileSystem: FileNode = {
  id: 'root',
  name: 'CassaVegas_Drive',
  type: 'folder',
  children: [
    { id: '1', name: 'heist_plans', type: 'folder', children: [
      { id: '2', name: 'plan_A.txt', type: 'file', content: 'Step 1: Get the crew. Step 2: ...' }
    ]},
    { id: '3', name: 'crew_manifest.txt', type: 'file', content: 'Andoy, Stan, David, ...' },
  ],
};

// Helper function to recursively find and update a node
const updateNodeInTree = (node: FileNode, targetId: string, updateFn: (node: FileNode) => FileNode): FileNode => {
    if (node.id === targetId) {
        return updateFn(node);
    }
    if (node.children) {
        return {
            ...node,
            children: node.children.map(child => updateNodeInTree(child, targetId, updateFn)),
        };
    }
    return node;
};

const FileExplorerView: React.FC = () => {
    const [root, setRoot] = useState<FileNode>(initialFileSystem);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddNode = useCallback((parentId: string, name:string, type: 'file' | 'folder') => {
        if (!name) return;

        const newNode: FileNode = {
            id: crypto.randomUUID(),
            name,
            type,
            ...(type === 'folder' && { children: [] }),
            ...(type === 'file' && { content: '' }),
        };

        setRoot(currentRoot => {
            return updateNodeInTree(currentRoot, parentId, (parentNode) => {
                if(parentNode.type !== 'folder') return parentNode;
                // Avoid duplicate names
                if(parentNode.children?.some(child => child.name === name)) {
                    alert(`A ${type} with the name "${name}" already exists in this folder.`);
                    return parentNode;
                }
                return {
                    ...parentNode,
                    children: [...(parentNode.children || []), newNode],
                };
            });
        });
    }, []);
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        // Upload files to the root directory
        const parentIdForUpload = 'root';

        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                 setRoot(currentRoot => {
                    return updateNodeInTree(currentRoot, parentIdForUpload, (parentNode) => {
                        if (parentNode.type !== 'folder') return parentNode;
                         if (parentNode.children?.some(child => child.name === file.name)) {
                            // Silently ignore or alert user
                            console.warn(`File "${file.name}" already exists. Skipping.`);
                            return parentNode;
                        }
                        const newNode: FileNode = {
                            id: crypto.randomUUID(),
                            name: file.name,
                            type: 'file',
                            content: content,
                        };
                        return {
                            ...parentNode,
                            children: [...(parentNode.children || []), newNode]
                        }
                    });
                });
            };
            reader.readAsText(file);
        }

        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">File Explorer</h2>
                <div className="flex items-center space-x-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                        multiple 
                        aria-hidden="true"
                    />
                    <button 
                        onClick={handleUploadClick}
                        className="flex items-center gap-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                       <UploadIcon /> Upload Files
                    </button>
                </div>
            </div>
            
            <div className="font-mono">
                <FileTreeNode node={root} level={0} onAddNode={handleAddNode} />
            </div>
        </div>
    );
};

export default FileExplorerView;
