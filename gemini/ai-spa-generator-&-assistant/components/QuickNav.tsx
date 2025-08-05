import React, { useState, useRef, useEffect } from 'react';
import { LayoutGridIcon, PanelLeftOpenIcon, PanelRightOpenIcon, HistoryIcon, KeyboardIcon, XIcon } from './icons';

interface QuickNavProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onFocusPrompt: () => void;
  onShowActivityLog: () => void;
}

const QuickNav: React.FC<QuickNavProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const menuActions = [
    { label: 'Toggle File Explorer', icon: <PanelLeftOpenIcon />, action: props.onToggleLeftPanel, color: 'text-neon-yellow' },
    { label: 'Toggle AI Panel', icon: <PanelRightOpenIcon />, action: props.onToggleRightPanel, color: 'text-neon-pink' },
    { label: 'Focus Prompt', icon: <KeyboardIcon />, action: props.onFocusPrompt, color: 'text-neon-green' },
    { label: 'Show Activity Log', icon: <HistoryIcon />, action: props.onShowActivityLog, color: 'text-neon-purple' },
  ];

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef} className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-neon-panel/90 backdrop-blur-md border border-neon-purple/50 rounded-lg shadow-lg shadow-neon-purple/20 overflow-hidden">
          <ul className="p-2 space-y-1">
            {menuActions.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleActionClick(item.action)}
                  className="w-full flex items-center p-2 text-left text-sm text-text-main rounded-md transition-colors duration-200 hover:bg-primary/10"
                >
                  {React.cloneElement(item.icon, { className: `w-5 h-5 mr-3 ${item.color}`})}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Actions"
        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-dark transition-all duration-300 animate-pulse-glow hover:animate-none"
      >
        {isOpen ? <XIcon className="w-8 h-8"/> : <LayoutGridIcon className="w-8 h-8"/>}
      </button>
    </div>
  );
};

export default QuickNav;
