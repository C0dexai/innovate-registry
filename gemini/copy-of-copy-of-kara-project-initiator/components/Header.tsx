import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-base-200/80 backdrop-blur-xl shadow-lg border-b border-brand-primary/50 flex-shrink-0 h-16" style={{boxShadow: '0 0 25px rgba(0, 191, 255, 0.4)'}}>
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-brand-primary" />
          <h1 className="text-2xl font-bold text-dark-base-content hidden sm:block">
            KARA Project Initiator
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;