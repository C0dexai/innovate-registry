
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import type { OpenAIFile } from '../types';
import { UploadCloudIcon, RefreshCwIcon, Trash2Icon, EyeIcon, DownloadIcon, XIcon, PlusIcon } from './Icons';
import { Modal } from './Modal';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const UploadFileModal: React.FC<{ isOpen: boolean, onClose: () => void, onUpload: (file: File, purpose: string) => void, isLoading: boolean }> = ({ isOpen, onClose, onUpload, isLoading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [purpose, setPurpose] = useState('assistants');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (file) {
            onUpload(file, purpose);
        }
    };
    
    useEffect(() => {
      if(isOpen) {
        setFile(null);
        setPurpose('assistants');
      }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload New Cloud File">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-dim-text mb-2">File</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md cursor-pointer hover:border-accent">
                        <div className="space-y-1 text-center">
                            <UploadCloudIcon className="mx-auto h-12 w-12 text-dim-text" />
                            <div className="flex text-sm text-dim-text">
                                <span className="relative bg-secondary rounded-md font-medium text-accent hover:text-sky-400 focus-within:outline-none">
                                    <span>{file ? 'Change file' : 'Upload a file'}</span>
                                    <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </span>
                            </div>
                            <p className="text-xs text-dim-text">{file ? file.name : 'Any file up to 512 MB'}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-dim-text">Purpose</label>
                    <select
                        id="purpose"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-primary border-slate-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md"
                    >
                        <option value="assistants">Assistants</option>
                        <option value="fine-tune">Fine-tune</option>
                        <option value="vision">Vision</option>
                        <option value="batch">Batch</option>
                        <option value="user_data">User Data</option>
                    </select>
                </div>
                <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={!file || isLoading} className="bg-accent text-white py-2 px-4 rounded-lg hover:bg-sky-400 flex items-center gap-2 disabled:bg-slate-600">
                        {isLoading ? 'Uploading...' : <><PlusIcon className="w-4 h-4"/> Upload and Create</>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export const OpenAIFilesPanel: React.FC = () => {
    const { openAIFiles, fetchOpenAIFiles, uploadOpenAIFile, deleteOpenAIFile, getOpenAIFileContent, downloadOpenAIFile, apiKeys } = useContext(AppContext);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [purposeFilter, setPurposeFilter] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewContent, setViewContent] = useState('');
    const [viewTitle, setViewTitle] = useState('');

    const NON_DOWNLOADABLE_PURPOSES = ['assistants', 'user_data', 'vision'];

    const handleFetchFiles = async () => {
        if (apiKeys.openai) {
            setIsLoading(true);
            await fetchOpenAIFiles(purposeFilter || undefined);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleFetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKeys.openai, purposeFilter]);

    const handleUpload = async (file: File, purpose: string) => {
        setIsUploading(true);
        await uploadOpenAIFile(file, purpose);
        setIsUploading(false);
        setIsUploadModalOpen(false);
    };

    const handleDelete = async (fileId: string, fileName: string) => {
        if(window.confirm(`Are you sure you want to delete "${fileName}"? This cannot be undone.`)) {
            await deleteOpenAIFile(fileId);
        }
    };

    const handleView = async (file: OpenAIFile) => {
        setViewTitle(`Content of ${file.filename}`);
        setViewContent("Loading...");
        setIsViewModalOpen(true);
        const content = await getOpenAIFileContent(file.id);
        setViewContent(content || 'Failed to load content.');
    };

    const sortedFiles = [...openAIFiles].sort((a, b) => b.created_at - a.created_at);

    return (
        <div className="h-full flex flex-col p-2">
             <UploadFileModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} isLoading={isUploading}/>
             <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={viewTitle}>
                <pre className="bg-primary p-4 rounded-lg text-sm text-bright-text max-h-[60vh] overflow-auto">
                    <code>{viewContent}</code>
                </pre>
             </Modal>

            <div className="flex-shrink-0 flex items-center justify-between p-2">
                 <h3 className="text-sm font-semibold uppercase text-dim-text">Cloud Files (OpenAI)</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handleFetchFiles} className="p-1 text-dim-text hover:text-bright-text" title="Refresh Files">
                        <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
                    </button>
                    <button onClick={() => setIsUploadModalOpen(true)} className="p-1 text-dim-text hover:text-bright-text" title="Upload New File">
                        <UploadCloudIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>
             <div className="flex-shrink-0 p-2">
                <select 
                    value={purposeFilter} 
                    onChange={e => setPurposeFilter(e.target.value)}
                    className="w-full text-xs bg-secondary p-1.5 rounded-md border border-slate-600 focus:ring-accent focus:border-accent text-bright-text"
                >
                    <option value="">All Purposes</option>
                    <option value="assistants">Assistants</option>
                    <option value="fine-tune">Fine-tune</option>
                    <option value="vision">Vision</option>
                    <option value="batch">Batch</option>
                    <option value="user_data">User Data</option>
                </select>
            </div>
            <div className="flex-grow overflow-y-auto pr-1 space-y-1">
                {!apiKeys.openai ? (
                    <p className="text-center text-xs text-dim-text p-4">OpenAI API key not set.</p>
                ) : isLoading && openAIFiles.length === 0 ? (
                    <p className="text-center text-xs text-dim-text p-4 animate-pulse">Loading files...</p>
                ) : sortedFiles.length === 0 ? (
                     <p className="text-center text-xs text-dim-text p-4">No files found for the selected purpose.</p>
                ) : (
                    sortedFiles.map(file => {
                        const isDownloadable = !NON_DOWNLOADABLE_PURPOSES.includes(file.purpose);
                        return (
                            <div key={file.id} className="bg-secondary/50 p-2 rounded-md hover:bg-secondary transition-colors">
                               <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-bright-text truncate" title={file.filename}>{file.filename}</p>
                                    <div className="flex items-center gap-2">
                                         <button
                                            onClick={() => downloadOpenAIFile(file)}
                                            disabled={!isDownloadable}
                                            className="p-1 text-dim-text hover:text-bright-text disabled:text-slate-600 disabled:cursor-not-allowed"
                                            title={isDownloadable ? "Download" : "Files with this purpose cannot be downloaded"}
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                         <button
                                            onClick={() => handleView(file)}
                                            disabled={!isDownloadable}
                                            className="p-1 text-dim-text hover:text-bright-text disabled:text-slate-600 disabled:cursor-not-allowed"
                                            title={isDownloadable ? "View Content" : "Files with this purpose cannot be viewed"}
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(file.id, file.filename)} className="p-1 text-red-500 hover:text-red-400" title="Delete">
                                            <Trash2Icon className="w-4 h-4"/>
                                        </button>
                                    </div>
                               </div>
                                <div className="text-xs text-dim-text flex items-center justify-between mt-1">
                                    <span>{formatBytes(file.bytes)}</span>
                                    <span className="font-mono bg-primary px-1.5 py-0.5 rounded">{file.purpose}</span>
                                    <span>{new Date(file.created_at * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    )
}