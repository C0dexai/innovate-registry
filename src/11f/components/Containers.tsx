

import React, { useState, useContext, useRef, useEffect, useMemo, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { LogLevel, FileType } from '../types';
import type { Container, FileNode, ContainerFile as ContainerFileType } from '../types';
import { BoxIcon, Trash2Icon, UploadCloudIcon, PlusIcon, XIcon, FileIcon, FolderIcon, ChevronDownIcon, TerminalIcon, MessageSquareIcon, SparklesIcon, BotIcon, UserIcon, SendIcon, PlayIcon, SquareIcon, RefreshCwIcon, CopyIcon, ArrowRightIcon, UploadIcon, BugIcon, EyeIcon, DownloadIcon } from './Icons';
import { InstallationRecommendationCard } from './InstallationRecommendationCard';
import { Modal } from './Modal';
import { ContainerPreviewModal } from './ContainerPreviewModal';


const CreateContainerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, onCreate, isLoading }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) setName('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl p-6 w-full max-w-md animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-bright-text">Create New Agent Environment</h3>
                    <button onClick={onClose} className="p-1 text-dim-text hover:text-bright-text rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="container-name" className="block text-sm font-medium text-dim-text mb-1">Environment Name</label>
                            <input
                                id="container-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-primary p-2 rounded-md border border-slate-600 focus:ring-accent focus:border-accent"
                                placeholder="e.g., react-docs-agent"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" disabled={isLoading} className="bg-accent text-black font-semibold py-2 px-5 rounded-lg hover:opacity-80 flex items-center gap-2 disabled:bg-slate-600">
                           {isLoading ? 'Creating...' : <><PlusIcon className="w-4 h-4"/> Create Environment</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ContainerCard: React.FC<{ container: Container, onSelect: () => void, isSelected: boolean, onDeleteRequest: (container: Container) => void }> = ({ container, onSelect, isSelected, onDeleteRequest }) => {
    const { user, uploadZipToContainer } = useContext(AppContext);
    const zipInputRef = useRef<HTMLInputElement>(null);
    
    const canDelete = user?.isAdmin === true || user?.email === container.owner;
    
    let statusText: string = container.status;
    let statusColor = 'text-gray-400';

    if (container.serverState === 'installing') {
        statusText = 'installing';
        statusColor = 'text-neon-yellow animate-pulse';
    } else if (container.serverState === 'running') {
        statusText = 'server running';
        statusColor = 'text-neon-green';
    } else if (container.serverState === 'error') {
        statusText = 'error';
        statusColor = 'text-neon-red';
    } else if (container.status === 'in_progress') {
        statusText = 'processing';
        statusColor = 'text-neon-yellow animate-pulse';
    } else if (container.status === 'completed') {
        statusText = 'ready';
        statusColor = 'text-accent';
    } else if (container.status === 'expired') {
        statusText = 'expired';
        statusColor = 'text-neon-red';
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canDelete) {
            onDeleteRequest(container);
        }
    };
    
    const handleZipUploadClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        zipInputRef.current?.click();
    };

    const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (e.target.files && e.target.files[0]) {
            uploadZipToContainer(container.id, e.target.files[0]);
        }
    };

    return (
        <div 
            className={`bg-secondary p-4 rounded-lg shadow-lg flex flex-col justify-between transition-all cursor-pointer ${isSelected ? 'ring-2 ring-accent' : 'hover:ring-1 hover:ring-accent'}`}
            onClick={onSelect}
        >
            <div>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <BoxIcon className="w-8 h-8 text-accent flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-lg text-bright-text truncate" title={container.name}>{container.name}</h4>
                             <p className="text-xs text-dim-text font-mono" title={container.id}>ID: {container.id.substring(0, 20)}...</p>
                        </div>
                    </div>
                     <div className={`flex items-center gap-1.5 text-sm font-semibold ${statusColor}`}>
                         <span className="capitalize">{statusText}</span>
                    </div>
                </div>
                 <div className="text-xs text-dim-text mt-3 space-y-1">
                     <p>Owner: <span className="font-semibold text-bright-text">{container.owner || 'Unknown'}</span></p>
                    <p>Created: {new Date(container.created_at * 1000).toLocaleString()}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between gap-2">
                <div>
                    <input type="file" accept=".zip" ref={zipInputRef} onChange={handleZipFileChange} className="hidden" onClick={e => e.stopPropagation()} />
                    <button onClick={handleZipUploadClick} className="text-sm bg-accent/20 hover:bg-accent/30 text-accent font-semibold py-1 px-3 rounded-md flex items-center gap-1.5 transition-colors">
                        <UploadIcon className="w-4 h-4" /> Upload ZIP
                    </button>
                </div>
                 {canDelete && <button onClick={handleDeleteClick} className="text-sm bg-neon-red/20 hover:bg-neon-red/30 text-neon-red font-semibold py-1 px-3 rounded-md flex items-center gap-1.5 transition-colors">
                    <Trash2Icon className="w-4 h-4" /> Delete
                </button>}
            </div>
        </div>
    );
};

const FileManagerTab: React.FC<{container: Container}> = ({container}) => {
    const { files: projectFilesRoot, uploadFileToContainer, listContainerFiles, addLog, downloadContainerFileToLocal } = useContext(AppContext);
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    
    const projectHomeDir = useMemo(() => projectFilesRoot.children?.find(c => c.name === 'home'), [projectFilesRoot]);

    const toggleSelection = (node: FileNode) => {
        const newSelection = new Set(selectedNodeIds);
        const toggleChildren = (n: FileNode, select: boolean) => {
            if (select) newSelection.add(n.id);
            else newSelection.delete(n.id);
            if(n.children) n.children.forEach(c => toggleChildren(c, select));
        }
        const isSelected = newSelection.has(node.id);
        toggleChildren(node, !isSelected);
        setSelectedNodeIds(newSelection);
    };
    
    const handleFileUpload = async () => {
        if (!container) return;
        
        const allFilesToUpload: FileNode[] = [];
        const selectedNodesToProcess: FileNode[] = [];

        const findSelectedNodes = (node: FileNode) => {
            if (selectedNodeIds.has(node.id)) {
                selectedNodesToProcess.push(node);
                return true;
            }
            if (node.children) node.children.forEach(findSelectedNodes);
            return false;
        };
        if(projectHomeDir) projectHomeDir.children?.forEach(findSelectedNodes);

        const collectFiles = (node: FileNode) => {
            if (node.type === FileType.File) allFilesToUpload.push(node);
            if (node.children) node.children.forEach(collectFiles);
        };
        selectedNodesToProcess.forEach(collectFiles);

        addLog({ agent: 'System', event: 'Upload', detail: `Uploading ${allFilesToUpload.length} files to ${container.name}...`, level: LogLevel.Info });
        
        for (const file of allFilesToUpload) {
            try {
                await uploadFileToContainer(container.id, file);
            } catch (e) {
                addLog({ agent: 'System', event: 'Upload Error', detail: `Failed to upload ${file.name}.`, level: LogLevel.Error });
            }
        }
        
        setSelectedNodeIds(new Set());
        addLog({ agent: 'System', event: 'Upload Complete', detail: `Finished uploading.`, level: LogLevel.Success });
    };

    const LocalFileSystemTree: React.FC<{ node: FileNode; level?: number }> = ({ node, level = 0 }) => {
        const [isOpen, setIsOpen] = useState(level < 2);
        const isDirectory = node.type === FileType.Directory;
        const handleToggle = () => setIsOpen(!isOpen);
        const handleSelect = (e: React.MouseEvent) => { 
            e.stopPropagation();
            toggleSelection(node);
        };
        const Icon = isDirectory ? FolderIcon : FileIcon;
        const isSelected = selectedNodeIds.has(node.id);
    
        return (
            <div style={{ paddingLeft: `${level * 12}px` }}>
                <div className="flex items-center p-1 rounded-md cursor-pointer hover:bg-secondary" onClick={isDirectory ? handleToggle : handleSelect}>
                    <input type="checkbox" checked={isSelected} onChange={() => {}} onClick={handleSelect} className="mr-2 h-4 w-4 rounded bg-slate-700 border-slate-500 focus:ring-accent shrink-0" />
                    {isDirectory && <ChevronDownIcon className={`w-4 h-4 mr-1 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />}
                    <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="truncate text-sm">{node.name}</span>
                </div>
                {isDirectory && isOpen && node.children && (
                    <div>{node.children.map(child => <LocalFileSystemTree key={child.id} node={child} level={level + 1} />)}</div>
                )}
            </div>
        );
    };

    useEffect(() => {
        if (!container.files) {
            listContainerFiles(container.id);
        }
    }, [container.id, container.files, listContainerFiles]);

    return (
        <div className="h-full flex flex-col p-2 bg-primary/50">
            <div className="flex-grow flex gap-2 overflow-hidden">
                <div className="w-1/2 flex flex-col border border-secondary rounded-md p-2">
                    <h3 className="text-sm font-semibold uppercase text-dim-text p-2 flex-shrink-0">/home (Local Project)</h3>
                    <div className="flex-grow overflow-y-auto pr-1">
                        {projectHomeDir && projectHomeDir.children && projectHomeDir.children.map(node => <LocalFileSystemTree key={node.id} node={node} />)}
                    </div>
                </div>
                <div className="w-1/2 flex flex-col border border-secondary rounded-md p-2">
                    <h3 className="text-sm font-semibold uppercase text-dim-text p-2 flex-shrink-0">Environment Files</h3>
                    <div className="flex-grow overflow-y-auto pr-1">
                       {container.isLoadingFiles ? <p className="text-xs text-dim-text animate-pulse p-4">Loading files...</p> : 
                        !container.files || container.files.length === 0 ? <p className="text-xs text-dim-text text-center py-4">No files found.</p> :
                        container.files.map((file: ContainerFileType) => (
                           <div key={file.id} className="group flex items-center gap-2 text-xs p-1.5 hover:bg-secondary rounded" title={file.name}>
                               <FileIcon className="w-3 h-3 text-dim-text flex-shrink-0"/>
                               <span className="truncate flex-grow">{file.name}</span>
                               <span className="text-dim-text flex-shrink-0 mr-2">{file.bytes} B</span>
                               <button onClick={() => downloadContainerFileToLocal(container.id, file.id)} className="p-1 rounded bg-slate-700 text-dim-text opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-white" title="Download to Local Workspace">
                                   <DownloadIcon className="w-3 h-3"/>
                               </button>
                           </div>
                        ))}
                    </div>
                </div>
            </div>
            {selectedNodeIds.size > 0 && (
                 <div className="flex-shrink-0 p-2 border-t border-slate-700 flex items-center justify-center">
                    <button 
                        onClick={handleFileUpload}
                        className="text-sm bg-accent/80 hover:bg-accent text-black font-semibold py-1.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
                        Upload to Environment <ArrowRightIcon className="w-4 h-4"/>
                    </button>
                 </div>
            )}
        </div>
    );
};

const ControlCenter: React.FC<{container: Container; onPreviewRequest: () => void;}> = ({container, onPreviewRequest}) => {
    const { agentCliHistory, handleAgentCommand, runScriptInContainer, stopScriptInContainer, installRecipeToContainer, updateContainerEnvVars, debugContainerWithAI } = useContext(AppContext);
    
    const [activeTab, setActiveTab] = useState<'agent' | 'files' | 'runtime'>('agent');
    const [envVars, setEnvVars] = useState(container.envVars || {});

    useEffect(() => {
        setEnvVars(container.envVars || {});
    }, [container.id, container.envVars]);
    
    const agentHistory = agentCliHistory[container.id] || [];

    const handleEnvVarChange = (key: string, value: string) => {
        setEnvVars(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveEnvVars = () => {
        updateContainerEnvVars(container.id, envVars);
    };

    const handleAddEnvVar = () => {
        const newKey = `NEW_VAR_${Object.keys(envVars).length + 1}`;
        setEnvVars(prev => ({ ...prev, [newKey]: '' }));
    };
    
    const handleDeleteEnvVar = (keyToDelete: string) => {
        const newVars = { ...envVars };
        delete newVars[keyToDelete];
        setEnvVars(newVars);
    };

    const ControlTabButton = ({ tab, label, icon }: { tab: string, label: string, icon: React.ReactNode }) => (
        <button 
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === tab ? 'text-accent border-accent' : 'text-dim-text border-transparent hover:bg-secondary'}`}
        >
            {icon} {label}
        </button>
    );
    
    const AgentCLI = () => {
        const [input, setInput] = useState('');
        const scrollRef = useRef<HTMLDivElement>(null);
        
        useEffect(() => {
            scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
        }, [agentHistory]);

        const onCommand = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && input.trim()) {
                handleAgentCommand(container.id, input);
                setInput('');
            }
        };

        const handleSuggestionClick = (suggestion: string) => {
            handleAgentCommand(container.id, suggestion);
        };
        
        const renderAgentMessage = (msg) => {
            if (msg.type === 'user') return <p><span className="text-neon-green">user@foundry</span><span className="text-accent">:~#</span> {msg.text}</p>;
            if (msg.type === 'ai_response') {
                const isThinking = msg.text.includes('is thinking...') || msg.text.includes('is analyzing...');
                return (
                    <div className={`text-bright-text whitespace-pre-wrap group relative bg-primary/20 p-2 rounded-md ${isThinking ? 'text-dim-text animate-pulse' : ''}`}>
                        <code>{msg.text}</code>
                        {!isThinking && msg.text && (
                            <button onClick={() => navigator.clipboard.writeText(msg.text)} className="absolute top-1 right-1 p-1 rounded-md bg-secondary text-dim-text opacity-0 group-hover:opacity-100 transition-opacity" title="Copy">
                                <CopyIcon className="w-3 h-3" />
                            </button>
                        )}
                         {msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700 flex flex-wrap gap-1">
                                {msg.suggestions.map((s, i) => (
                                    <button key={`sugg-${i}`} onClick={() => handleSuggestionClick(s)} className="text-xs bg-accent/10 hover:bg-accent/20 text-accent py-0.5 px-2 rounded-full">{s}</button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
            if (msg.type === 'installation_recommendation') return <InstallationRecommendationCard containerId={container.id} message={msg} />;
            return null;
        };

        return (
             <div className="h-full bg-black text-white font-mono text-sm flex flex-col p-2">
                 <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-2">
                     {agentHistory.map(line => <div key={line.id}>{renderAgentMessage(line)}</div>)}
                 </div>
                 <div className="flex-shrink-0 pt-2 border-t border-gray-700 flex items-center gap-2">
                    <span className="text-neon-green">user@foundry:~$</span>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onCommand} placeholder="Ask the agent about the files..." className="flex-grow bg-transparent focus:outline-none"/>
                 </div>
            </div>
        )
    };
    
    const RuntimeTab = () => {
        return (
            <div className="p-4 space-y-4 overflow-y-auto">
                {/* Env Vars */}
                <div className="bg-secondary p-3 rounded-lg">
                    <h5 className="font-semibold text-bright-text mb-2">Environment Variables</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {Object.entries(envVars).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                                <input type="text" value={key} readOnly className="flex-1 bg-primary p-1.5 rounded-md text-sm text-dim-text" />
                                <input type="text" value={value} onChange={e => handleEnvVarChange(key, e.target.value)} className="flex-1 bg-primary p-1.5 rounded-md text-sm" />
                                <button onClick={() => handleDeleteEnvVar(key)} className="p-1 text-neon-red hover:opacity-80"><Trash2Icon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={handleAddEnvVar} className="text-xs bg-slate-600 hover:bg-slate-500 text-bright-text py-1 px-2 rounded">Add Variable</button>
                        <button onClick={handleSaveEnvVars} className="text-xs bg-accent hover:opacity-80 text-black font-semibold py-1 px-2 rounded">Save Variables</button>
                    </div>
                </div>

                {/* Scripts */}
                <div className="bg-secondary p-3 rounded-lg">
                    <h5 className="font-semibold text-bright-text mb-2">NPM Scripts</h5>
                    <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => installRecipeToContainer(container.id, 'express')} className="col-span-2 flex items-center justify-center gap-2 p-2 text-sm bg-highlight/70 hover:bg-highlight/90 text-white rounded transition-colors">
                            <SparklesIcon className="w-4 h-4"/> Innovate: Install Express
                        </button>
                        {!container.npmScripts || Object.keys(container.npmScripts).length === 0 ? (
                            <p className="text-xs text-dim-text col-span-2 text-center py-2">No scripts detected. Upload a package.json.</p>
                        ) : (
                            Object.entries(container.npmScripts).map(([name, command]) => (
                                <button key={name} onClick={() => runScriptInContainer(container.id, name)} disabled={container.serverState === 'running'} className="flex items-center justify-center gap-2 p-2 text-sm bg-neon-green/80 hover:bg-neon-green text-black font-semibold rounded disabled:bg-slate-600 disabled:text-dim-text">
                                    <PlayIcon className="w-4 h-4" /> {name}
                                </button>
                            ))
                        )}
                         <button onClick={() => stopScriptInContainer(container.id)} disabled={container.serverState !== 'running'} className="col-span-2 flex items-center justify-center gap-2 p-2 text-sm bg-neon-red/80 hover:bg-neon-red text-white font-semibold rounded disabled:bg-slate-600 disabled:text-dim-text">
                            <SquareIcon className="w-4 h-4" /> Stop
                        </button>
                    </div>
                </div>

                {/* Status & Logs */}
                <div>
                    <div className="flex items-center justify-between">
                         <h5 className="font-semibold text-bright-text">Server Status & Logs</h5>
                         <div className="flex gap-2">
                            <button onClick={() => onPreviewRequest()} disabled={container.serverState !== 'running'} className="text-xs flex items-center gap-1.5 bg-accent/70 hover:bg-accent text-black font-semibold py-1 px-2 rounded disabled:bg-slate-600 disabled:text-dim-text">
                                <EyeIcon className="w-3 h-3"/> Live Preview
                            </button>
                            <button onClick={() => debugContainerWithAI(container.id)} disabled={container.serverState !== 'error'} className="text-xs flex items-center gap-1.5 bg-neon-yellow/80 hover:bg-neon-yellow text-black font-semibold py-1 px-2 rounded disabled:bg-slate-600 disabled:text-dim-text">
                                <BugIcon className="w-3 h-3"/> Debug with AI
                            </button>
                         </div>
                    </div>
                    <div className="mt-2 h-48 bg-black text-white font-mono text-xs p-2 overflow-y-auto rounded-lg">
                        {(container.serverLogs || []).map((log, i) => <p key={i} className="whitespace-pre-wrap">{log}</p>)}
                        {container.serverState === 'installing' && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neon-yellow animate-pulse"></div><span>Installing...</span></div>}
                        {container.serverState === 'running' && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div><span>Running</span></div>}
                        {container.serverState === 'error' && <div className="flex items-center gap-2 text-neon-red"><div className="w-2 h-2 rounded-full bg-neon-red"></div><span>Error State</span></div>}
                        {container.serverState === 'stopped' && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div><span>Stopped</span></div>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-primary/50">
            <div className="flex-shrink-0 border-b border-slate-700 flex">
                <ControlTabButton tab="agent" label="Agent CLI" icon={<BotIcon className="w-4 h-4"/>} />
                <ControlTabButton tab="files" label="Files" icon={<FileIcon className="w-4 h-4"/>} />
                <ControlTabButton tab="runtime" label="Runtime" icon={<TerminalIcon className="w-4 h-4"/>} />
            </div>
            <div className="flex-grow overflow-y-auto">
                 {activeTab === 'agent' && <AgentCLI />}
                 {activeTab === 'files' && <FileManagerTab container={container} />}
                 {activeTab === 'runtime' && <RuntimeTab />}
            </div>
        </div>
    );
};

const ContainersDashboard: React.FC = () => {
    const { containers, createOpenAIContainer, deleteOpenAIContainer, selectContainer, selectedContainerId, apiKeys, refreshContainers, generateContainerPreview } = useContext(AppContext);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [containerToDelete, setContainerToDelete] = useState<Container | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    
    const dashboardRef = useRef<HTMLDivElement>(null);

    const selectedContainer = useMemo(() => containers.find(c => c.id === selectedContainerId), [containers, selectedContainerId]);

    const handleCreateContainer = async (name: string) => {
        setIsCreating(true);
        await createOpenAIContainer(name);
        setIsCreating(false);
        setIsCreateModalOpen(false);
    };

    const handleDeleteRequest = (container: Container) => {
        setContainerToDelete(container);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (containerToDelete) {
            deleteOpenAIContainer(containerToDelete.id);
        }
        setIsDeleteModalOpen(false);
        setContainerToDelete(null);
    };

    const handlePreviewRequest = async () => {
        if (selectedContainerId) {
            await generateContainerPreview(selectedContainerId);
            setIsPreviewModalOpen(true);
        }
    };

    return (
        <div className="flex flex-col h-full bg-primary overflow-hidden">
             <CreateContainerModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreate={handleCreateContainer} 
                isLoading={isCreating}
            />
            {selectedContainer && (
                 <ContainerPreviewModal
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    htmlContent={selectedContainer.predictedHtml || '<p>No preview available.</p>'}
                    url={`http://localhost:3000/ (predicted)`}
                />
            )}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Environment Deletion"
            >
                {containerToDelete && (
                    <div>
                        <p className="text-dim-text">Are you sure you want to permanently delete the environment <strong className="text-bright-text">{containerToDelete.name}</strong>?</p>
                        <p className="text-sm text-neon-yellow mt-2">This action will purge the container and its associated AI Assistant. This cannot be undone.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="bg-slate-600 hover:bg-slate-500 text-bright-text py-2 px-4 rounded-lg">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="bg-neon-red hover:opacity-80 text-white py-2 px-4 rounded-lg flex items-center gap-2">
                                <Trash2Icon className="w-4 h-4" /> Purge Environment
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

             <div className="flex-shrink-0 flex justify-between items-start p-4 border-b border-secondary">
                <div>
                    <h2 className="text-2xl font-bold mb-1 text-bright-text">AI Family Foundry</h2>
                    <p className="text-sm text-dim-text">Manage file-aware AI agents and their environments.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={refreshContainers} className="p-1.5 text-dim-text hover:text-bright-text rounded-md hover:bg-secondary"><RefreshCwIcon className="w-5 h-5"/></button>
                    <button onClick={() => setIsCreateModalOpen(true)} disabled={!apiKeys.openai} className="bg-accent text-black font-semibold py-2 px-4 rounded-lg hover:opacity-80 flex items-center gap-2 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                        <PlusIcon className="w-5 h-5"/> New Environment
                    </button>
                 </div>
            </div>
            
            <div ref={dashboardRef} className="flex flex-grow overflow-hidden">
                 <div className="flex-1 overflow-auto p-4 md:p-6 border-r border-secondary">
                    {!apiKeys.openai ? (
                         <div className="text-center py-8 border-2 border-dashed border-highlight/30 rounded-lg bg-highlight/10 text-highlight h-full flex flex-col justify-center">
                            <p className="font-semibold">OpenAI API Key Not Set</p>
                            <p className="text-sm">Please set your key in the 'Integrations' tab to manage agents.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {containers.map(container => (
                                <ContainerCard key={container.id} container={container} onSelect={() => selectContainer(container.id)} isSelected={selectedContainerId === container.id} onDeleteRequest={handleDeleteRequest} />
                            ))}
                        </div>
                    )}
                 </div>
                 
                 <div className="flex-1 overflow-auto">
                    {selectedContainer ? (
                        <ControlCenter container={selectedContainer} onPreviewRequest={handlePreviewRequest}/>
                    ) : (
                        <div className="h-full flex items-center justify-center text-center text-dim-text p-4">
                            Select an environment to view its controls.
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ContainersDashboard;