import React, { useState } from 'react';
import { ICONS } from '../constants';

interface OrbMenuProps {
  isConsoleVisible: boolean;
  onToggleConsole: () => void;
  // Could add more actions here later
}

export const OrbMenu: React.FC<OrbMenuProps> = ({ isConsoleVisible, onToggleConsole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      label: isConsoleVisible ? 'Close Console' : 'Open Console',
      icon: ICONS.TERMINAL,
      action: onToggleConsole,
    },
    // Add more items here if needed
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Menu items */}
      {isMenuOpen && (
        <div className="flex flex-col items-center gap-3 mb-4 p-3 bg-gray-950/80 backdrop-blur-md border border-fuchsia-500/50 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.5)]">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 w-40 px-4 py-2 text-sm font-semibold text-fuchsia-300 bg-black/40 rounded-lg hover:bg-fuchsia-500/30 hover:text-white transition-all"
            >
              {React.cloneElement(item.icon, { className: 'h-5 w-5' })}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Orb Button */}
      {!isConsoleVisible && (
        <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="h-16 w-16 rounded-full bg-gray-900 border-2 border-fuchsia-400 flex items-center justify-center
                    shadow-[0_0_15px_rgba(217,70,239,0.6),_inset_0_0_10px_rgba(217,70,239,0.5)]
                    hover:shadow-[0_0_25px_rgba(217,70,239,0.9),_inset_0_0_15px_rgba(217,70,239,0.7)]
                    hover:border-fuchsia-300
                    transition-all duration-300 animate-pulse-slow"
            aria-label="Open quick actions menu"
        >
            <div className={`h-8 w-8 text-fuchsia-300 transition-transform duration-500 ${isMenuOpen ? 'rotate-90' : ''}`}>
            {isMenuOpen ? React.cloneElement(ICONS.CLOSE, {className: 'h-6 w-6'}) : React.cloneElement(ICONS.WORKFLOW, {className: 'h-7 w-7'})}
            </div>
        </button>
      )}
    </div>
  );
};
