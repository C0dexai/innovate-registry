
import React, { useState } from 'react';
import { CrosshairIcon, FolderIcon, OrchestratorIcon } from './FileIcons';
import { AGENTS } from '../agents';
import type { ViewType } from '../types';

interface OrbMenuProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const UsersIcon = ({ className }: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const BlueprintIcon = ({ className }: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18h14V3M5 3h14M5 3H3m2 0h14m2 0H5m14 0v18m0-18h2M5 9h14M5 15h14M9 9h6v6H9z" />
    </svg>
);

const OrbIcon = ({ className, isOpen }: { className?: string, isOpen: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {isOpen ? (
             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        ) : (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-12.66l-.707.707M4.04 19.96l-.707.707M21 12h-1M4 12H3m16.96-7.96l-.707-.707M7.07 16.93l-.707-.707" />
                <circle cx="12" cy="12" r="4" />
            </>
        )}
    </svg>
);


const OrbMenu: React.FC<OrbMenuProps> = ({ activeView, setActiveView }) => {
    const [isOpen, setIsOpen] = useState(false);

    const isAgentView = AGENTS.some(a => a.name === activeView);

    const menuItems = [
        { key: AGENTS[0].name, label: 'Agents', icon: <UsersIcon className="h-6 w-6" />, active: isAgentView },
        { key: 'orchestrator', label: 'Orchestrator', icon: <OrchestratorIcon className="h-6 w-6" />, active: activeView === 'orchestrator' },
        { key: 'workflow', label: 'Blueprint', icon: <BlueprintIcon className="h-6 w-6" />, active: activeView === 'workflow' },
        { key: 'explorer', label: 'Explorer', icon: <FolderIcon className="h-6 w-6" />, active: activeView === 'explorer' },
        { key: 'operator', label: 'Operator', icon: <CrosshairIcon className="h-6 w-6" />, active: activeView === 'operator' },
    ];
    
    const handleSelect = (view: ViewType) => {
        setActiveView(view);
        setIsOpen(false);
    }
    
    const orbRadius = 120; // in pixels
    const totalItems = menuItems.length;
    const angleIncrement = 360 / (totalItems + 1); // Adjust spacing

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div className="relative flex items-center justify-center w-20 h-20">
                 {/* Menu Items */}
                {menuItems.map((item, index) => {
                    const angle = -90 - (angleIncrement * (index - (totalItems-1)/2));
                    const x = orbRadius * Math.cos(angle * Math.PI / 180);
                    const y = orbRadius * Math.sin(angle * Math.PI / 180);
                    
                    return (
                        <div
                            key={item.key}
                            className={`absolute transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
                            style={{ 
                                transform: `translate(${x}px, ${y}px)`,
                                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                            }}
                        >
                            <button
                                onClick={() => handleSelect(item.key)}
                                className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 border-2 transform hover:scale-110 ${
                                    item.active 
                                    ? 'bg-fuchsia-700 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/50' 
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-cyan-500 hover:text-white'
                                }`}
                                title={item.label}
                            >
                                {item.icon}
                            </button>
                        </div>
                    );
                })}

                {/* Main Orb Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-20 h-20 bg-slate-900 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-700/30 hover:border-fuchsia-500 hover:text-fuchsia-400 transition-all duration-300 transform hover:scale-110 focus:outline-none"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isOpen}
                >
                    <OrbIcon className="w-10 h-10 transition-transform duration-300" isOpen={isOpen} />
                </button>
            </div>
        </div>
    );
};

export default OrbMenu;