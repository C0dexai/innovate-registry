import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { PromptSettings, Variable, Iteration, VirtualFile, PromptTemplate, PreviewState } from './types';
import Header from './components/Header';
import { PromptComposer } from './components/PromptComposer';
import { InferenceStream } from './components/InferenceStream';
import { Console } from './components/Console';
import { streamGenerateContent, generateSuggestion } from './services/geminiService';
import * as db from './services/db';
import { templates } from './data/templates';
import { WorkflowRunner } from './components/WorkflowRunner';
import { Type } from '@google/genai';
import { OrbMenu } from './components/OrbMenu';

type ViewMode = 'composer' | 'workflow';

const App: React.FC = () => {
  // Core State from Template
  const [currentTemplateName, setCurrentTemplateName] = useState<string>(templates[0].name);
  const [prompt, setPrompt] = useState<string>(templates[0].prompt);
  const [userExample, setUserExample] = useState<string>(templates[0].userExample);
  const [modelExample, setModelExample] = useState<string>(templates[0].modelExample);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [settings, setSettings] = useState<PromptSettings>({
    systemInstruction: templates[0].system,
    temperature: 0.7,
    conciseness: 'default',
    formality: 'casual',
  });
  
  // Iteration & Loading State
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState({ prompt: false, system: false, examples: false, vibe: false, variables: false });

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('composer');
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const mainRef = useRef<HTMLElement>(null);
  const [isConsoleVisible, setIsConsoleVisible] = useState<boolean>(false);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  
  // Console & File System State
  const [logs, setLogs] = useState<string[]>(['Welcome to Prompt Whisperer! Type `help` for a list of commands.']);
  const [consoleInput, setConsoleInput] = useState('');
  const [files, setFiles] = useState<VirtualFile[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, message]);
  }, []);
  
  // DB Initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.initDB();
        addLog('Database initialized.');
        const [loadedIterations, loadedFiles] = await Promise.all([
          db.getAllIterations(),
          db.getAllFiles()
        ]);
        setIterations(loadedIterations);
        setFiles(loadedFiles);
        addLog(`Loaded ${loadedIterations.length} iterations and ${loadedFiles.length} files from storage.`);
      } catch (error) {
        addLog('Error initializing database.');
        console.error(error);
      }
    };
    initializeApp();
  }, [addLog]);

  const handleTemplateChange = useCallback((templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setPrompt(template.prompt);
      setUserExample(template.userExample);
      setModelExample(template.modelExample);
      setSettings(s => ({ ...s, systemInstruction: template.system }));
      setCurrentTemplateName(template.name);
      addLog(`Template loaded: ${template.name}`);
      if (template.isWorkflow) {
        setViewMode('workflow');
      } else {
        setViewMode('composer');
      }
    }
  }, [addLog]);

  const handleRunPrompt = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setCurrentResponse('');
    addLog(`[${new Date().toLocaleTimeString()}] Initiating AI stream...`);

    const onChunk = (chunk: string) => {
      if (chunk === '__CLEAR_AND_RETRY__') {
        setCurrentResponse('');
        return;
      }
      setCurrentResponse(prev => prev + chunk);
    };

    const onComplete = (fullResponse: string) => {
      streamPromise.then(async ({fullPrompt}) => {
        const newIteration: Iteration = {
          id: crypto.randomUUID(),
          prompt,
          userExample,
          modelExample,
          fullPrompt,
          response: fullResponse,
          settings: JSON.parse(JSON.stringify(settings)),
          variables: JSON.parse(JSON.stringify(variables)),
          timestamp: new Date().toISOString(),
          bookmarked: false,
        };
        try {
          await db.addIteration(newIteration);
          setIterations(prev => [...prev, newIteration]);
          addLog(`[${new Date().toLocaleTimeString()}] Stream complete. Iteration saved.`);
        } catch (error) {
          addLog(`[${new Date().toLocaleTimeString()}] Error saving iteration: ${error}`);
        } finally {
          setIsLoading(false);
        }
      });
    };

    const onError = (error: string) => {
      addLog(`[${new Date().toLocaleTimeString()}] Error: ${error}`);
      setCurrentResponse(`Error: ${error}`);
      setIsLoading(false);
    };

    const streamPromise = streamGenerateContent(
      prompt,
      userExample,
      modelExample,
      variables,
      settings,
      onChunk,
      onComplete,
      onError
    );

  }, [prompt, userExample, modelExample, variables, settings, isLoading, addLog]);
  
  const handleSendToPreview = useCallback((iteration: Iteration) => {
    const response = iteration.response;
    const codeMatch = response.match(/```(?:typescript|javascript|jsx|tsx)\n([\s\S]*?)\n```/);
    const cssMatch = response.match(/```css\n([\s\S]*?)\n```/);

    const code = codeMatch ? codeMatch[1].trim() : '';
    const css = cssMatch ? cssMatch[1].trim() : '';

    if (!code) {
        addLog("[Live Preview] Error: Could not find a code block (e.g., ```tsx) in the response to preview.");
        return;
    }

    setPreviewState({
        code,
        css,
        props: '{\n  "children": "Hello World"\n}', // Sensible default
    });
    addLog(`[Live Preview] Component sent to Live Preview tab.`);
  }, [addLog]);

  const handleSuggest = async (type: 'prompt' | 'system') => {
    setIsSuggesting(prev => ({ ...prev, [type]: true }));
    const metaPrompt = type === 'prompt'
      ? `Based on the system instruction "${settings.systemInstruction}", generate a creative and interesting one-paragraph prompt for a generative AI. The current project is related to: ${currentTemplateName}.`
      : `Generate a concise but powerful system instruction for an AI persona related to: ${currentTemplateName}. The instruction should be a single paragraph.`;
    
    addLog(`[${new Date().toLocaleTimeString()}] Requesting ${type} suggestion...`);
    const suggestion = await generateSuggestion(metaPrompt);

    if (suggestion.startsWith('Error:')) {
      addLog(`[${new Date().toLocaleTimeString()}] ${suggestion}`);
    } else {
        if (type === 'prompt') {
            setPrompt(suggestion);
        } else {
            setSettings(s => ({ ...s, systemInstruction: suggestion }));
        }
        addLog(`[${new Date().toLocaleTimeString()}] AI suggestion received and applied.`);
    }
    setIsSuggesting(prev => ({ ...prev, [type]: false }));
  };
  
  const handleSuggestExamples = async () => {
    setIsSuggesting(prev => ({...prev, examples: true}));
    addLog(`[${new Date().toLocaleTimeString()}] Requesting few-shot example suggestion...`);

    const metaPrompt = `Based on the system instruction "${settings.systemInstruction}" and the user prompt "${prompt}", generate a concise and effective few-shot example. This example should guide the AI on how to respond. Provide a simple 'userExample' and a corresponding ideal 'modelExample'.
    Respond with ONLY a valid JSON object matching the specified schema. Do not include any other text or markdown.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            userExample: { type: Type.STRING, description: "A sample input from a user." },
            modelExample: { type: Type.STRING, description: "The ideal AI response to the user's sample input." }
        },
        required: ['userExample', 'modelExample']
    };

    try {
      const suggestion = await generateSuggestion(metaPrompt, { responseMimeType: "application/json", responseSchema: schema });
      const parsed = JSON.parse(suggestion);
      if (parsed.userExample && parsed.modelExample) {
        setUserExample(parsed.userExample);
        setModelExample(parsed.modelExample);
        addLog(`[${new Date().toLocaleTimeString()}] AI suggestion for examples received and applied.`);
      } else {
        throw new Error("Invalid JSON structure received.");
      }
    } catch(e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to parse suggestion.';
      addLog(`[${new Date().toLocaleTimeString()}] Error processing suggestion: ${errorMsg}`);
    } finally {
      setIsSuggesting(prev => ({...prev, examples: false}));
    }
  };
  
  const handleSuggestVibe = async () => {
    setIsSuggesting(prev => ({...prev, vibe: true}));
    addLog(`[${new Date().toLocaleTimeString()}] Requesting vibe & tone suggestion...`);

    const metaPrompt = `Based on the system instruction "${settings.systemInstruction}" and the user prompt "${prompt}", suggest optimal settings for 'temperature', 'formality', and 'conciseness'.
    - 'temperature' is a float between 0.0 (deterministic) and 1.0 (creative).
    - 'formality' is one of 'default', 'casual', 'formal'.
    - 'conciseness' is one of 'default', 'brief', 'detailed'.
    Respond with ONLY a valid JSON object matching the specified schema. Do not include any other text or markdown.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            temperature: { type: Type.NUMBER, description: "A value between 0.0 and 1.0 for creativity." },
            formality: { type: Type.STRING, enum: ['default', 'casual', 'formal'], description: "The tone of the response." },
            conciseness: { type: Type.STRING, enum: ['default', 'brief', 'detailed'], description: "The level of detail in the response." }
        },
        required: ['temperature', 'formality', 'conciseness']
    };

    try {
      const suggestion = await generateSuggestion(metaPrompt, { responseMimeType: "application/json", responseSchema: schema });
      const parsed = JSON.parse(suggestion);
      setSettings(s => ({
        ...s,
        temperature: parseFloat(parsed.temperature) || s.temperature,
        formality: ['default', 'casual', 'formal'].includes(parsed.formality) ? parsed.formality : s.formality,
        conciseness: ['default', 'brief', 'detailed'].includes(parsed.conciseness) ? parsed.conciseness : s.conciseness
      }));
      addLog(`[${new Date().toLocaleTimeString()}] AI suggestion for vibe received and applied.`);
    } catch(e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to parse suggestion.';
      addLog(`[${new Date().toLocaleTimeString()}] Error processing suggestion: ${errorMsg}`);
    } finally {
      setIsSuggesting(prev => ({...prev, vibe: false}));
    }
  };

  const handleSuggestVariables = async () => {
    setIsSuggesting(prev => ({...prev, variables: true}));
    addLog(`[${new Date().toLocaleTimeString()}] Requesting contextual variables suggestion...`);

    const metaPrompt = `Analyze the following user prompt and identify placeholders for dynamic content. These placeholders are typically enclosed in double curly braces, like {{placeholder}}.
    Based on the prompt, suggest 2-3 relevant key-value pairs that could be used as variables.
    Respond with ONLY a valid JSON array of objects, where each object has a 'key' (the name of the variable without braces) and a 'value' (a realistic example value). Do not include any other text or markdown.

    User Prompt: "${prompt}"`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                key: { type: Type.STRING, description: "The variable name (without curly braces)." },
                value: { type: Type.STRING, description: "An example value for the variable." }
            },
            required: ['key', 'value']
        }
    };
    
    try {
      const suggestion = await generateSuggestion(metaPrompt, { responseMimeType: "application/json", responseSchema: schema });
      const parsed = JSON.parse(suggestion);
      if (Array.isArray(parsed)) {
        const newVariables = parsed.map(v => ({...v, id: crypto.randomUUID()}));
        setVariables(newVariables);
        addLog(`[${new Date().toLocaleTimeString()}] AI suggestion for variables received and applied.`);
      } else {
        throw new Error("Invalid JSON structure received. Expected an array.");
      }
    } catch(e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to parse suggestion.';
      addLog(`[${new Date().toLocaleTimeString()}] Error processing suggestion: ${errorMsg}`);
    } finally {
      setIsSuggesting(prev => ({...prev, variables: false}));
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!mainRef.current) return;
    
    const startX = e.clientX;
    const startWidth = (mainRef.current.querySelector('.prompt-composer-pane') as HTMLElement).offsetWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const newWidth = startWidth + dx;
        const totalWidth = mainRef.current!.offsetWidth;
        const newPercentage = (newWidth / totalWidth) * 100;
        
        if (newPercentage > 20 && newPercentage < 80) {
            setLeftPaneWidth(newPercentage);
        }
    };

    const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleConsoleCommand = useCallback(async () => {
    const command = consoleInput.trim();
    if (!command) return;

    addLog(`> ${command}`);
    setConsoleInput('');

    const [cmd, ...args] = command.split(/\s+/);

    try {
        switch (cmd.toLowerCase()) {
        case 'help':
            addLog("Available commands:\n  help          - Show this help message\n  clear         - Clear the console\n  ls            - List saved prompt files\n  save <name>   - Save the current prompt setup\n  load <name>   - Load a prompt setup\n  rm <name>     - Remove a prompt setup\n  cat <name>    - Display the contents of a saved prompt");
            break;
        case 'clear':
            setLogs([]);
            break;
        case 'ls': {
            const allFiles = await db.getAllFiles();
            setFiles(allFiles); // Sync state
            if (allFiles.length === 0) {
            addLog("No files saved.");
            } else {
            addLog("Saved files:\n" + allFiles.map(f => `  - ${f.name}`).join('\n'));
            }
            break;
        }
        case 'save': {
            const name = args[0];
            if (!name) {
                addLog("Usage: save <filename>");
                return;
            }
            const newFile: VirtualFile = {
                name,
                content: { prompt, userExample, modelExample, variables: JSON.parse(JSON.stringify(variables)), settings: JSON.parse(JSON.stringify(settings)) }
            };
            await db.saveFile(newFile);
            setFiles(await db.getAllFiles()); // Refresh file list
            addLog(`File "${name}" saved.`);
            break;
        }
        case 'load': {
            const name = args[0];
            const file = await db.getFile(name);
            if (file) {
                setPrompt(file.content.prompt);
                setUserExample(file.content.userExample);
                setModelExample(file.content.modelExample);
                setSettings(file.content.settings);
                setVariables(file.content.variables);
                setCurrentTemplateName(file.name);
                addLog(`File "${name}" loaded.`);
                setViewMode('composer');
            } else {
                addLog(`File not found: ${name}`);
            }
            break;
        }
        case 'rm': {
            const name = args[0];
            await db.deleteFile(name);
            setFiles(await db.getAllFiles()); // Refresh file list
            addLog(`File "${name}" removed.`);
            break;
        }
        case 'cat': {
            const name = args[0];
            const file = await db.getFile(name);
            if (file) {
                const content = `---- BEGIN ${name} ----\n[PROMPT]\n${file.content.prompt}\n\n[USER EXAMPLE]\n${file.content.userExample}\n\n[MODEL EXAMPLE]\n${file.content.modelExample}\n\n[SETTINGS]\n${JSON.stringify(file.content.settings, null, 2)}\n\n[VARIABLES]\n${JSON.stringify(file.content.variables, null, 2)}\n---- END ${name} ----`;
                addLog(content);
            } else {
                addLog(`File not found: ${name}`);
            }
            break;
        }
        default:
            addLog(`Command not found: ${cmd}. Type 'help' for a list of commands.`);
        }
    } catch (err) {
        const error = err as Error;
        addLog(`Error executing command: ${error.message}`);
        console.error(error);
    }
  }, [consoleInput, addLog, prompt, userExample, modelExample, variables, settings]);

  const handleToggleBookmark = useCallback(async (id: string) => {
    const iteration = iterations.find(it => it.id === id);
    if(iteration) {
      const updatedIteration = { ...iteration, bookmarked: !iteration.bookmarked };
      try {
        await db.updateIteration(updatedIteration);
        setIterations(prev => prev.map(it => it.id === id ? updatedIteration : it));
        addLog(`[${new Date().toLocaleTimeString()}] Iteration ${id} ${updatedIteration.bookmarked ? 'bookmarked' : 'unbookmarked'}.`);
      } catch (error) {
         addLog(`[${new Date().toLocaleTimeString()}] Error updating bookmark: ${error}`);
      }
    }
  }, [iterations, addLog]);

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <Header />
      <main ref={mainRef} className="flex-grow flex overflow-hidden">
        {viewMode === 'workflow' ? (
           <WorkflowRunner
              initialPrompt={prompt}
              initialSettings={settings}
              addLog={addLog}
           />
        ) : (
          <>
            <div className="prompt-composer-pane overflow-y-auto" style={{ width: `${leftPaneWidth}%` }}>
              <PromptComposer
                prompt={prompt}
                setPrompt={setPrompt}
                userExample={userExample}
                setUserExample={setUserExample}
                modelExample={modelExample}
                setModelExample={setModelExample}
                settings={settings}
                setSettings={setSettings}
                variables={variables}
                setVariables={setVariables}
                onRun={handleRunPrompt}
                isLoading={isLoading}
                onSuggestPrompt={() => handleSuggest('prompt')}
                onSuggestSystemInstruction={() => handleSuggest('system')}
                onSuggestExamples={handleSuggestExamples}
                onSuggestVibe={handleSuggestVibe}
                onSuggestVariables={handleSuggestVariables}
                isSuggesting={isSuggesting}
                templates={templates}
                currentTemplateName={currentTemplateName}
                onTemplateChange={handleTemplateChange}
                viewMode={viewMode}
              />
            </div>
            <div 
                className="w-2 cursor-col-resize bg-gray-900 hover:bg-fuchsia-500/20 transition-colors duration-300 flex-shrink-0 group z-10"
                onMouseDown={handleMouseDown}
                aria-label="Resize panels"
                role="separator"
            >
              <div className="h-full w-[2px] bg-gray-700 group-hover:bg-fuchsia-500 group-hover:shadow-[0_0_8px_#d946ef] transition-all duration-300 mx-auto"></div>
            </div>
            <div className="overflow-y-auto flex-1">
              <InferenceStream
                currentResponse={currentResponse}
                iterations={iterations}
                isLoading={isLoading}
                onToggleBookmark={handleToggleBookmark}
                onSendToPreview={handleSendToPreview}
                previewState={previewState}
                onClosePreview={() => setPreviewState(null)}
                onPreviewStateChange={setPreviewState}
              />
            </div>
          </>
        )}
      </main>
      
      <Console 
        logs={logs} 
        isVisible={isConsoleVisible}
        input={consoleInput}
        onInputChange={setConsoleInput}
        onCommandSubmit={handleConsoleCommand}
        onClose={() => setIsConsoleVisible(false)}
      />

      <OrbMenu
        isConsoleVisible={isConsoleVisible}
        onToggleConsole={() => setIsConsoleVisible(prev => !prev)}
      />
    </div>
  );
};

export default App;