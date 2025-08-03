import React, { useState } from 'react';
import { GeminiIcon } from './components/Icons';
import OrchestratorPanel from './components/AgentsPanel';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';

type View = 'app' | 'terms' | 'privacy';

interface AppProps {
 // No props needed for now
}

const App: React.FC<AppProps> = () => {
  const [currentView, setCurrentView] = useState<View>('app');
  const [isFocusMode, setIsFocusMode] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'terms':
        return <TermsOfService onClose={() => setCurrentView('app')} />;
      case 'privacy':
        return <PrivacyPolicy onClose={() => setCurrentView('app')} />;
      case 'app':
      default:
        return <OrchestratorPanel isFocusMode={isFocusMode} onToggleFocusMode={() => setIsFocusMode(p => !p)} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-[var(--text-color)] font-sans">
      {!isFocusMode && (
        <header className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm border-b border-[var(--neon-purple)]">
          <div className="flex items-center gap-3">
            <GeminiIcon className="h-8 w-8 text-[var(--neon-purple)]" />
            <h1 className="text-2xl font-bold tracking-wider" style={{textShadow: '0 0 5px var(--neon-purple)'}}>Live Web Dev Sandbox</h1>
          </div>
          {/* Settings have been removed as API keys are now handled by environment variables. */}
        </header>
      )}
      
      <main className="flex-grow flex flex-col overflow-hidden">
        {renderContent()}
      </main>
      
      {!isFocusMode && (
         <footer className="bg-black/30 backdrop-blur-sm border-t border-[var(--neon-purple)] p-3 text-center text-xs text-gray-400">
            <p className="mb-2">
              This is a live application powered by the Gemini API. Prompts are sent to Google for processing.
            </p>
            <div>
              <button onClick={() => setCurrentView('terms')} className="hover:underline text-[var(--neon-blue)] hover:text-[var(--neon-pink)] mx-2 transition-colors">Terms of Service</button>
              |
              <button onClick={() => setCurrentView('privacy')} className="hover:underline text-[var(--neon-blue)] hover:text-[var(--neon-pink)] mx-2 transition-colors">Privacy Policy</button>
            </div>
        </footer>
      )}
    </div>
  );
};

export default App;