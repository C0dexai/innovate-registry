import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { HomeIcon } from './icons/HomeIcon';
import { PlayIcon } from './icons/PlayIcon';
import { EyeIcon } from './icons/EyeIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface FloatingOrbProps {
    currentView: string;
    setView: (view: any) => void;
    canSimulate: boolean;
    canPreview: boolean;
    canCode: boolean;
}

const FloatingOrb: React.FC<FloatingOrbProps> = ({ setView, canSimulate, canPreview, canCode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { view: 'config', label: 'Config', icon: <HomeIcon className="w-6 h-6"/>, enabled: true },
        { view: 'simulation', label: 'Simulate', icon: <PlayIcon className="w-6 h-6"/>, enabled: canSimulate },
        { view: 'livePreview', label: 'Preview', icon: <EyeIcon className="w-6 h-6"/>, enabled: canPreview },
        { view: 'codePreview', label: 'Code', icon: <CodeBracketIcon className="w-6 h-6"/>, enabled: canCode },
    ];
    
    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Submenu Items */}
            <div className={`transition-all duration-300 ease-in-out flex flex-col items-center gap-4 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {menuItems.map((item, index) => (
                    <button
                        key={item.view}
                        onClick={() => { setView(item.view); setIsOpen(false); }}
                        disabled={!item.enabled}
                        title={item.label}
                        className="group flex items-center gap-3 w-40 justify-start pl-4"
                        style={{ transitionDelay: `${isOpen ? index * 50 : 0}ms`}}
                    >
                         <div className="relative z-10 p-3 bg-dark-base-200/80 backdrop-blur-md rounded-full border border-dark-base-300/50 text-dark-base-content/80 group-hover:border-brand-accent group-hover:text-brand-accent group-hover:shadow-glow-green group-disabled:opacity-50 group-disabled:cursor-not-allowed group-disabled:hover:shadow-none transition-all duration-300">
                           {item.icon}
                        </div>
                        <span className="text-sm font-bold text-dark-base-content group-hover:text-brand-accent transition-colors duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main Orb Button */}
            <button 
                onClick={toggleMenu}
                className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-black mt-4 shadow-lg animate-pulse-glow focus:outline-none focus:ring-4 focus:ring-brand-primary/50"
                aria-label="Toggle Quick Navigation"
            >
                {isOpen ? <XMarkIcon className="w-10 h-10" /> : <SparklesIcon className="w-10 h-10" />}
            </button>
        </div>
    );
};

export default FloatingOrb;
