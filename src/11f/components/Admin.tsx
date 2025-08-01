
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            active ? 'bg-accent text-white' : 'bg-secondary text-dim-text hover:bg-slate-600'
        } rounded-t-lg`}
    >
        {children}
    </button>
);

const modelData = [
  { name: 'gemini-2.5-flash', requests: 4000, 'cost ($)': 2.4, latency: 120 },
  { name: 'imagen-3.0', requests: 1200, 'cost ($)': 12, latency: 450 },
  { name: 'custom-model-a', requests: 800, 'cost ($)': 4.0, latency: 250 },
];

const vectorData = [
    { name: 'Doc Store', size: 120, vectors: 1500000, queries: 5800 },
    { name: 'Codebase V2', size: 250, vectors: 4200000, queries: 12000 },
    { name: 'UI Components', size: 45, vectors: 800000, queries: 2300 },
]

const ModelManagement: React.FC = () => (
    <div className="p-6">
        <h3 className="text-xl font-bold mb-4 text-bright-text">Model Performance</h3>
        <div className="h-80 bg-secondary rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888888" />
                    <YAxis yAxisId="left" orientation="left" stroke="#888888" />
                    <YAxis yAxisId="right" orientation="right" stroke="#888888" />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}/>
                    <Legend />
                    <Bar yAxisId="left" dataKey="requests" fill="#00f6ff" />
                    <Bar yAxisId="right" dataKey="cost ($)" fill="#ff00ff" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const VectorStoreManagement: React.FC = () => (
    <div className="p-6">
        <h3 className="text-xl font-bold mb-4 text-bright-text">Vector Store Usage</h3>
         <div className="h-80 bg-secondary rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vectorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#888888" />
                    <YAxis type="category" dataKey="name" width={120} stroke="#888888" />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}/>
                    <Legend />
                    <Bar dataKey="vectors" fill="#39ff14" name="Vectors (in thousands)"/>
                    <Bar dataKey="size" fill="#faff00" name="Size (GB)"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const MemoryManagement: React.FC = () => (
    <div className="p-6 text-dim-text">
        <h3 className="text-xl font-bold mb-4 text-bright-text">Memory Management</h3>
        <p>Memory management controls are configured here. (Placeholder)</p>
    </div>
);

const ChatHistory: React.FC = () => (
    <div className="p-6 text-dim-text">
        <h3 className="text-xl font-bold mb-4 text-bright-text">Chat History & Processes</h3>
        <p>A log of all Gemini interactions and processes would be displayed here. (Placeholder)</p>
    </div>
);


const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('models');

    const renderContent = () => {
        switch (activeTab) {
            case 'models': return <ModelManagement />;
            case 'vector': return <VectorStoreManagement />;
            case 'memory': return <MemoryManagement />;
            case 'history': return <ChatHistory />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-primary p-4">
            <div className="flex border-b border-secondary">
                <AdminTabButton active={activeTab === 'models'} onClick={() => setActiveTab('models')}>Model Transformers</AdminTabButton>
                <AdminTabButton active={activeTab === 'vector'} onClick={() => setActiveTab('vector')}>Vector Store</AdminTabButton>
                <AdminTabButton active={activeTab === 'memory'} onClick={() => setActiveTab('memory')}>Memory</AdminTabButton>
                <AdminTabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Chat History</AdminTabButton>
            </div>
            <div className="flex-grow bg-primary rounded-b-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;