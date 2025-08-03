
import React from 'react';

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start my-3 gap-2">
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-fuchsia-900/50 flex items-center justify-center border-2 border-fuchsia-600/50 neon-glow-fuchsia">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fuchsia-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    </div>
    <div className="flex items-center space-x-1.5 py-3 px-4 bg-slate-800 rounded-lg">
      <div className="h-2 w-2 bg-fuchsia-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-fuchsia-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-fuchsia-500 rounded-full animate-bounce"></div>
    </div>
  </div>
);

export default TypingIndicator;