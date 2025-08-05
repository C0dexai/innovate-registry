

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { FullPromptState } from './types';
import { usePromptGenerator } from './hooks/usePromptGenerator';
import IdentitySection from './components/formSections/IdentitySection';
import PropsSection from './components/formSections/PropsSection';
import { StateSection, InteractionsSection, VisualsSection, RobustnessSection } from './components/formSections/OtherSections';
import ResultPanel from './components/ResultPanel';
import AgentStatus from './components/AgentStatus';
import FooterOrb from './components/FooterOrb';

const initialState: FullPromptState = {
  identity: { name: '', description: '', useCase: '' },
  props: [],
  state: {
    variables: [],
    effects: [],
    optimizations: '',
    customHooks: '',
  },
  interactions: {
    userInteractions: [],
    eventEmitters: [],
    conditionalRendering: [],
  },
  visuals: {
    htmlElements: '',
    styling: 'Use Tailwind CSS for all styling, sourcing colors from the provided CSS variables for a neon-on-dark theme.',
    layout: '',
  },
  robustness: {
    accessibility: '',
    errorHandling: '',
    loadingStates: '',
    edgeCases: '',
    testing: '',
  },
};

const App: React.FC = () => {
  const [promptState, setPromptState] = useState<FullPromptState>(initialState);
  const [componentCode, setComponentCode] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  
  const generatedPrompt = usePromptGenerator(promptState);

  const handleBuild = async () => {
    setIsBuilding(true);
    setComponentCode('');

    try {
        if (!process.env.API_KEY) {
            throw new Error("API key is not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const buildPrompt = `
You are an expert React developer specializing in creating single-file, self-contained components with TypeScript and Tailwind CSS.
Based on the following detailed specification, generate the code for the React component.

**Requirements:**
- The component must be a single file containing all necessary imports (React).
- Use TypeScript for props and state.
- Use Tailwind CSS for styling. For colors, use CSS variables (e.g., \`bg-[var(--color-background)]\`, \`text-[var(--color-primary)]\`) to match the app's neon theme. For buttons with neon backgrounds, use black text for contrast (e.g., 'text-black').
- The component should be a functional component using React Hooks.
- Export the component as a default export.
- **CRITICAL CODE STYLE RULES FOR LIVE PREVIEW:**
    - **ABSOLUTELY NO TEMPLATE LITERALS:** The in-browser transpiler for the live preview does not support template literals (e.g. \`string with \${variable}\`). You **MUST** use simple string concatenation with the \`+\` operator instead.
    - **NO INLINE EXPRESSIONS:** Do not define complex values (like concatenated strings or function calls) directly inside JSX props or object literals.
    - **DECLARE CONSTANTS FIRST:** Always declare dynamic values as separate constants *before* using them in JSX or object literals.

- **Correct Example:**
    const titleText = 'Profile for ' + user.name;
    const containerClasses = 'card ' + (isFeatured ? 'featured' : '');
    const data = { title: titleText };
    return <div className={containerClasses} title={data.title}>...</div>;
    
- **Incorrect Example (Template Literal - FORBIDDEN):**
    const titleText = \`Profile for \${user.name}\`;
    
- **Incorrect Example (Inline Expression - FORBIDDEN):**
    return <div title={'Profile for ' + user.name}>...</div>;

- Do not include any explanations, comments, or introductory text like \`\`\`tsx. Only return the raw code for the component file.

**Component Specification:**
${generatedPrompt}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: buildPrompt,
            config: {
                temperature: 0.1,
            }
        });

        const code = response.text.replace(/^```(tsx|jsx|javascript)?\n|```$/g, '').trim();
        setComponentCode(code);

    } catch (e: any) {
        console.error("Build Error:", e);
        setComponentCode(`// Error generating component: ${e.message}\n// Check the browser console for more details.`);
    } finally {
        setIsBuilding(false);
    }
  };


  return (
    <div className="flex w-full min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      <div className="flex-1 flex flex-col">
        <header className="flex-shrink-0 bg-[var(--color-background)]/80 backdrop-blur-md p-4 sticky top-0 z-20 border-b-2 border-[var(--color-primary)] shadow-[0_8px_32px_0_rgba(45,212,191,0.2)]">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                React <span className="text-[var(--color-primary)]">Component Architect</span>
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                An AI-powered SPA to craft and build React components.
              </p>
            </div>
            <AgentStatus />
          </div>
        </header>

        <div className="flex-grow overflow-y-auto">
            <main className="container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-2 lg:gap-8 relative z-10">
                {/* Form Column */}
                <div className="lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-4">
                  <div id="identity-section">
                    <IdentitySection
                        identity={promptState.identity}
                        setIdentity={(identity) => setPromptState(s => ({ ...s, identity }))}
                    />
                  </div>
                  <div id="props-section">
                    <PropsSection
                        props={promptState.props}
                        setProps={(props) => setPromptState(s => ({ ...s, props }))}
                        identity={promptState.identity}
                    />
                   </div>
                   <div id="state-section">
                    <StateSection
                        state={promptState.state}
                        setState={(state) => setPromptState(s => ({...s, state}))}
                        identity={promptState.identity}
                    />
                  </div>
                  <div id="interactions-section">
                    <InteractionsSection
                        interactions={promptState.interactions}
                        setInteractions={(interactions) => setPromptState(s => ({...s, interactions}))}
                        identity={promptState.identity}
                    />
                  </div>
                  <div id="visuals-section">
                    <VisualsSection
                        visuals={promptState.visuals}
                        setVisuals={(visuals) => setPromptState(s => ({...s, visuals}))}
                        identity={promptState.identity}
                    />
                  </div>
                  <div id="robustness-section">
                    <RobustnessSection
                        robustness={promptState.robustness}
                        setRobustness={(robustness) => setPromptState(s => ({...s, robustness}))}
                        identity={promptState.identity}
                    />
                  </div>
                </div>
                
                {/* Output & Preview Column */}
                <div className="mt-8 lg:mt-0 lg:sticky lg:top-[120px] lg:h-[calc(100vh-160px)]">
                    <ResultPanel 
                        prompt={generatedPrompt}
                        onBuild={handleBuild}
                        isBuilding={isBuilding}
                        componentCode={componentCode}
                        promptState={promptState}
                    />
                </div>
            </main>
        </div>
      </div>
      <FooterOrb />
    </div>
  );
};

export default App;