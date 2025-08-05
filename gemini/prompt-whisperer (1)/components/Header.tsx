import React from 'react';
import { ICONS } from '../constants';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="flex items-center justify-between p-3 border-b border-fuchsia-500/50 bg-gray-950/70 backdrop-blur-lg shadow-[0_5px_15px_-5px_rgba(217,70,239,0.3)] sticky top-0 z-20 flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-fuchsia-300 tracking-widest">Prompt Whisperer</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {React.cloneElement(ICONS.GIT, { className: 'h-5 w-5' })}
          <span>main</span>
        </div>
      </div>
    </header>
  );
};

export default Header;