


import React, { useState, useEffect } from 'react';
import { LoadingSpinnerIcon, WandIcon } from './icons';
import type { FullPromptState } from '../types';

declare global {
  interface Window {
    Babel: any;
  }
}

const generateSpaHtml = (componentCode: string, promptState: FullPromptState): string => {
    const componentName = promptState.identity.name || 'MyComponent';
    const props = promptState.props;
    const eventEmitters = promptState.interactions.eventEmitters;

    // NOTE: This JSX is injected into a template literal string.
    // CSS variables are used here to style the SPA harness.
    const spaJsx = `
        // =========== START: UTILITY FUNCTIONS ===========
        const { useState, useEffect, useCallback, useMemo, Fragment } = React;

        const getInitialValueForProp = (prop) => {
          if (prop.defaultValue) {
              if (prop.type.toLowerCase().includes('boolean')) return prop.defaultValue === 'true';
              if (prop.type.toLowerCase().includes('number')) return Number(prop.defaultValue) || 0;
              if (prop.type.startsWith('{') || prop.type.startsWith('[')) {
                try { return JSON.parse(prop.defaultValue); } catch(e) { return prop.defaultValue; }
              }
              return prop.defaultValue.toString();
          }
          // Sensible defaults for types
          if (prop.type.toLowerCase().includes('boolean')) return false;
          if (prop.type.toLowerCase().includes('number')) return 0;
          if (prop.type.toLowerCase().includes('string')) return '';
          if (prop.type.startsWith('()')) return () => {};
          if (prop.type.startsWith('{')) return {};
          if (prop.type.startsWith('[')) return [];
          return undefined;
        };

        const PropControl = ({ prop, value, onChange }) => {
            const id = 'control-' + prop.name;
            const labelText = prop.name + ' (' + prop.type + ')';
            const label = <label htmlFor={id} title={prop.description} className="block text-sm font-medium text-gray-300 mb-1 cursor-help">{labelText}</label>;

            if (prop.type.toLowerCase().includes('boolean')) {
                return (
                    <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id={id} checked={!!value} onChange={e => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-teal-600 focus:ring-teal-500"/>
                        <label htmlFor={id} title={prop.description} className="text-sm font-medium text-gray-300 cursor-help">{labelText}</label>
                    </div>
                );
            }
            if (prop.type.startsWith('{') || prop.type.startsWith('[')) {
                 return (
                    <div>
                        {label}
                        <textarea
                            id={id}
                            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                            onChange={e => onChange(e.target.value)}
                            rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                );
            }
             return (
                <div>
                    {label}
                    <input
                        type={prop.type.toLowerCase().includes('number') ? 'number' : 'text'}
                        id={id}
                        value={value ?? ''}
                        onChange={e => onChange(prop.type.toLowerCase().includes('number') ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            );
        };
        // =========== END: UTILITY FUNCTIONS ===========

        // =========== START: USER'S COMPONENT CODE ===========
        ${componentCode}
        // =========== END: USER'S COMPONENT CODE ===========


        // =========== START: SPA HARNESS APPLICATION ===========
        const SpaHarness = () => {
          const allProps = ${JSON.stringify(props)};
          const eventEmitters = ${JSON.stringify(eventEmitters)};
          
          const propDefinitions = allProps.filter(p => !eventEmitters.some(e => e.name === p.name));

          const [propState, setPropState] = useState(() => {
            const initialState = {};
            propDefinitions.forEach(p => {
              initialState[p.name] = getInitialValueForProp(p);
            });
            return initialState;
          });

          const [eventLog, setEventLog] = useState([]);

          const handlePropChange = (propName, rawValue) => {
            setPropState(prev => ({...prev, [propName]: rawValue}));
          };
          
          const finalProps = { ...propState };

          // Parse JSON props from textareas
          propDefinitions.forEach(p => {
            if ((p.type.startsWith('{') || p.type.startsWith('[')) && typeof finalProps[p.name] === 'string') {
              try {
                finalProps[p.name] = JSON.parse(finalProps[p.name]);
              } catch(e) {
                // Keep it as a string
              }
            }
          });

          // Create event emitter callbacks that log to the event panel
          eventEmitters.forEach(emitter => {
            finalProps[emitter.name] = (...args) => {
              const logEntry = { 
                name: emitter.name, 
                args: args.map(arg => (arg && typeof arg.persist === 'function') ? 'SyntheticEvent' : arg),
                timestamp: new Date().toLocaleTimeString() 
              };
              setEventLog(prev => [logEntry, ...prev.slice(0, 49)]); // Keep log to 50 entries
            };
          });

          const ComponentToRender = ${componentName};

          return (
            <div className="flex h-screen font-sans">
              {/* Controls Panel */}
              <div className="w-[380px] h-full bg-[#111827] p-4 border-r border-gray-700 overflow-y-auto">
                <h1 className="text-xl font-bold text-teal-400 mb-4">${componentName} Controls</h1>
                <div className="space-y-4">
                  {propDefinitions.length > 0 ? propDefinitions.map(p => (
                    <PropControl key={p.id} prop={p} value={propState[p.name]} onChange={(val) => handlePropChange(p.name, val)} />
                  )) : <p className="text-gray-400">This component has no configurable props.</p>}
                </div>
              </div>

              {/* Preview Panel */}
              <div className="flex-1 h-full flex flex-col bg-[#0d1117]">
                <div className="flex-grow p-8 flex items-center justify-center overflow-auto relative bg-grid">
                    <ComponentToRender {...finalProps} />
                </div>
                <div className="flex-shrink-0 h-1/3 bg-[#111827]/80 backdrop-blur-sm border-t border-gray-700 p-4 overflow-y-auto relative">
                    <h2 className="text-lg font-semibold text-gray-300 mb-2">Event Log</h2>
                    <button onClick={() => setEventLog([])} className="absolute top-4 right-4 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 px-2 py-1 rounded">Clear</button>
                    {eventLog.length > 0 ? (
                        <div className="space-y-2 text-xs font-mono">
                            {eventLog.map((log, i) => (
                                <div key={i} className="p-2 bg-black/30 rounded-md">
                                    <span className="text-yellow-400">{log.timestamp}</span> - <span className="text-teal-400 font-bold">{log.name}</span>
                                    <pre className="text-gray-300 whitespace-pre-wrap break-all mt-1">{JSON.stringify(log.args, null, 2)}</pre>
                                </div>
                            ))}
                        </div>
                    ) : (
                       <p className="text-gray-500 italic">No events emitted yet. Interact with the component to see logs.</p>
                    )}
                </div>
              </div>
            </div>
          );
        };
        
        ReactDOM.createRoot(document.getElementById('root')).render(<SpaHarness />);
    `;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Interactive Preview: ${componentName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { font-family: sans-serif; background-color: #111827; color: #d1d5db; overflow: hidden; }
        .bg-grid { background-image: linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 20px 20px; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1f2937; }
        ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        ${spaJsx}
    </script>
</body>
</html>
    `;
}


interface PreviewSectionProps {
  componentCode: string;
  isBuilding: boolean;
  promptState: FullPromptState;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ componentCode, isBuilding, promptState }) => {
  const [isTranspiled, setIsTranspiled] = useState(false);
  const [transpilationError, setTranspilationError] = useState<string | null>(null);

  useEffect(() => {
    setIsTranspiled(false);
    setTranspilationError(null);

    if (!componentCode || isBuilding) {
      return;
    }
    
    // Use a timeout to allow the UI to update to the "building" state before blocking the main thread
    const transpileTimeout = setTimeout(() => {
      try {
        if (!window.Babel) {
          throw new Error("Babel.js is not loaded and is required for live preview.");
        }
        window.Babel.transform(componentCode, {
          presets: ['react', ['typescript', { isTSX: true, allExtensions: true }]],
          filename: 'Component.tsx',
        });
        setIsTranspiled(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Live Preview Build Error:", error);
        setTranspilationError(message);
        setIsTranspiled(false);
      }
    }, 50);

    return () => clearTimeout(transpileTimeout);
  }, [componentCode, isBuilding]);

  const handleLaunchSpa = () => {
    if (!isTranspiled || !componentCode) return;
    const htmlContent = generateSpaHtml(componentCode, promptState);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderContent = () => {
    if (isBuilding) {
      return (
        <div className="flex-grow flex items-center justify-center text-[var(--color-text-muted)] p-4">
          <LoadingSpinnerIcon className="w-8 h-8 text-[var(--color-primary)] animate-spin mr-3" />
          <span>Building component...</span>
        </div>
      );
    }
    
    if (!componentCode) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center text-[var(--color-text-muted)] text-center p-4">
          <WandIcon className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Ready to Build</h3>
          <p>Click "Build Component" in the prompt panel to generate code.</p>
        </div>
      );
    }

    if (transpilationError) {
      return (
         <div className="flex-grow p-4 overflow-y-auto text-left">
          <h3 className="text-lg font-semibold text-[var(--color-error)] mb-2">Build Failed</h3>
          <p className="text-sm text-red-300/80 mb-4">Could not transpile the component code. Please check the error below. You may need to adjust the prompt or regenerate the component.</p>
          <div className="bg-red-900/20 rounded-md p-4 border border-red-500/30">
             <pre className="text-xs font-mono whitespace-pre-wrap text-red-300/90">{transpilationError}</pre>
          </div>
        </div>
      );
    }

    if (isTranspiled) {
       return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <div className="bg-green-900/30 border border-green-500/50 rounded-full p-4 mb-6 shadow-[0_0_20px_rgba(74,222,128,0.4)]">
             <WandIcon className="w-12 h-12 text-[var(--color-success)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-success)]">Build Successful!</h3>
          <p className="text-[var(--color-text-muted)] mt-2 mb-6 max-w-md">Your component code is valid and ready for an interactive preview in a separate, isolated window.</p>
          <button
            onClick={handleLaunchSpa}
            className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black font-bold rounded-lg shadow-[0_0_20px_rgba(45,212,191,0.5)] transition-all transform hover:scale-105"
          >
            Launch Interactive SPA
          </button>
        </div>
       );
    }

    // Default/interim state while transpiling
    return (
       <div className="flex-grow flex items-center justify-center text-[var(--color-text-muted)] p-4">
          <LoadingSpinnerIcon className="w-8 h-8 text-[var(--color-accent-purple)] animate-spin mr-3" />
          <span>Validating code...</span>
        </div>
    );
  };

  return (
    <div className="glass-card rounded-lg border-[var(--border-color)] h-full flex flex-col">
      <div className="p-4 flex-shrink-0 flex justify-between items-center border-b border-[var(--border-color)]">
        <h2 className="text-xl font-bold text-[var(--color-primary)]">Component Preview</h2>
      </div>
      {renderContent()}
    </div>
  );
};

export default PreviewSection;