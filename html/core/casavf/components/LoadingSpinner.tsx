import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative h-16 w-16">
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-2 border-cyan-500/30"></div>
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-t-2 border-t-cyan-400 animate-spin"></div>
      </div>
      <p className="text-cyan-400 tracking-widest uppercase text-sm">Connecting...</p>
    </div>
  );
};

export default LoadingSpinner;