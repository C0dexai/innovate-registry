
import React, { useState } from 'react';
import { Agent } from '../types';
import { Pagination } from './ui/Pagination';

interface AgentGridProps {
    agents: Agent[];
}

const AGENTS_PER_PAGE = 4;

const AgentGrid: React.FC<AgentGridProps> = ({ agents }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(agents.length / AGENTS_PER_PAGE);

    const startIndex = (currentPage - 1) * AGENTS_PER_PAGE;
    const selectedAgents = agents.slice(startIndex, startIndex + AGENTS_PER_PAGE);

    return (
        <div className="mt-4">
            <p className="text-sm text-dark-base-content/80 mb-4">This project uses a pre-defined AI team. Their instructions are fixed for this template, but provide context to the AI during generation.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[120px]">
                {selectedAgents.map(agent => (
                    <div key={agent.name} className="p-4 flex flex-col justify-center items-start bg-dark-base-100/30 rounded-lg border border-dark-base-300">
                        <span className="font-semibold text-dark-base-content">{agent.name}</span>
                        <span className="text-sm text-dark-base-content/70 mt-1">{agent.role}</span>
                    </div>
                ))}
            </div>
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

export default AgentGrid;
