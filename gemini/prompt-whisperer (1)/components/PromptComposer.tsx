import React, { useState, useRef, useEffect } from 'react';
import type { PromptSettings, Variable, PromptTemplate } from '../types';
import { ICONS } from '../constants';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface PromptComposerProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  userExample: string;
  setUserExample: (value: string) => void;
  modelExample: string;
  setModelExample: (value: string) => void;
  settings: PromptSettings;
  setSettings: (settings: PromptSettings) => void;
  variables: Variable[];
  setVariables: (variables: Variable[]) => void;
  onRun: () => void;
  isLoading: boolean;
  onSuggestPrompt: () => void;
  onSuggestSystemInstruction: () => void;
  onSuggestExamples: () => void;
  onSuggestVibe: () => void;
  onSuggestVariables: () => void;
  isSuggesting: {
    prompt: boolean;
    system: boolean;
    examples: boolean;
    vibe: boolean;
    variables: boolean;
  };
  templates: PromptTemplate[];
  currentTemplateName: string;
  onTemplateChange: (templateName: string) => void;
  viewMode: 'composer' | 'workflow';
}

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-400 mb-2">
    {children}
  </label>
);

const Section: React.FC<{ title: string; children: React.ReactNode; onSuggest?: () => void; isSuggesting?: boolean; suggestLabel?: string; }> = ({ title, children, onSuggest, isSuggesting, suggestLabel }) => (
    <div className="mb-6">
    <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
      <h3 className="text-md font-semibold text-fuchsia-400">{title}</h3>
      {onSuggest && (
        <Button variant="ghost" size="sm" onClick={onSuggest} disabled={isSuggesting} aria-label={suggestLabel}>
          {isSuggesting
            ? React.cloneElement(ICONS.SPINNER, { className: 'h-4 w-4' })
            : React.cloneElement(ICONS.LIGHTBULB, { className: 'h-4 w-4 text-lime-400' })
          }
           <span className="ml-2 text-xs">Suggest</span>
        </Button>
      )}
    </div>
    {children}
  </div>
);

export const PromptComposer: React.FC<PromptComposerProps> = ({
  prompt,
  setPrompt,
  userExample,
  setUserExample,
  modelExample,
  setModelExample,
  settings,
  setSettings,
  variables,
  setVariables,
  onRun,
  isLoading,
  onSuggestPrompt,
  onSuggestSystemInstruction,
  onSuggestExamples,
  onSuggestVibe,
  onSuggestVariables,
  isSuggesting,
  templates,
  currentTemplateName,
  onTemplateChange,
  viewMode,
}) => {
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const templateSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateSelectorRef.current && !templateSelectorRef.current.contains(event.target as Node)) {
        setIsTemplateSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const groupedTemplates = templates.reduce((acc, template) => {
    (acc[template.category] = acc[template.category] || []).push(template);
    return acc;
  }, {} as Record<string, PromptTemplate[]>);

  const handleVariableChange = (id: string, key: 'key' | 'value', value: string) => {
    setVariables(variables.map(v => v.id === id ? { ...v, [key]: value } : v));
  };

  const addVariable = () => {
    setVariables([...variables, { id: crypto.randomUUID(), key: '', value: '' }]);
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <Card className="flex-grow flex flex-col bg-gray-950/70">
        <div className="p-4 flex-grow flex flex-col overflow-y-auto">
          <Section title="Load a Template">
            <div className="relative" ref={templateSelectorRef}>
                <button
                    onClick={() => setIsTemplateSelectorOpen(prev => !prev)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-900/70 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm"
                    aria-haspopup="listbox"
                    aria-expanded={isTemplateSelectorOpen}
                >
                    <span className="flex items-center gap-2">
                        {templates.find(t => t.name === currentTemplateName)?.isWorkflow && React.cloneElement(ICONS.WORKFLOW, { className: 'h-4 w-4 text-fuchsia-400 flex-shrink-0' })}
                        <span className="truncate text-gray-200">{currentTemplateName}</span>
                    </span>
                    {React.cloneElement(ICONS.CHEVRON_DOWN, { className: `h-5 w-5 text-gray-400 transition-transform duration-200 ${isTemplateSelectorOpen ? 'rotate-180' : ''}` })}
                </button>

                {isTemplateSelectorOpen && (
                    <div className="absolute z-10 top-full mt-2 w-full bg-gray-950/90 backdrop-blur-md border border-fuchsia-500/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <ul role="listbox" className="p-1">
                            {Object.keys(groupedTemplates).map((category) => (
                                <li key={category} className="mb-1 last:mb-0">
                                    <h3 className="px-2 py-1.5 text-xs font-bold uppercase text-gray-500 sticky top-0 bg-gray-950/90 backdrop-blur-md">{category}</h3>
                                    <ul>
                                        {groupedTemplates[category].map(template => (
                                            <li key={template.name}>
                                                <button
                                                    onClick={() => {
                                                        onTemplateChange(template.name);
                                                        setIsTemplateSelectorOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors duration-150 ${currentTemplateName === template.name ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-gray-300 hover:bg-fuchsia-500/10'}`}
                                                    role="option"
                                                    aria-selected={currentTemplateName === template.name}
                                                >
                                                    {template.isWorkflow && React.cloneElement(ICONS.WORKFLOW, { className: 'h-4 w-4 text-gray-500 flex-shrink-0' })}
                                                    <span className="truncate">{template.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          </Section>

          <Section title="AI Persona / System Vibe" onSuggest={onSuggestSystemInstruction} isSuggesting={isSuggesting.system} suggestLabel="Suggest a system instruction">
            <textarea
              id="system-instruction"
              value={settings.systemInstruction}
              onChange={(e) => setSettings({ ...settings, systemInstruction: e.target.value })}
              placeholder="e.g., You are a senior software architect..."
              className="w-full p-2 bg-gray-900/70 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm h-24"
              aria-label="System Instruction"
            />
          </Section>
          
          <Section 
            title="Inference Logic / Few-Shot Example"
            onSuggest={onSuggestExamples}
            isSuggesting={isSuggesting.examples}
            suggestLabel="Suggest few-shot examples"
          >
             <div className="space-y-4">
                <div>
                  <Label htmlFor="user-example">Example User Input</Label>
                  <textarea
                    id="user-example"
                    value={userExample}
                    onChange={(e) => setUserExample(e.target.value)}
                    placeholder="Provide a sample input to guide the AI."
                    className="w-full h-24 p-2 bg-gray-900/70 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono text-sm"
                    aria-label="Example User Input"
                  />
                </div>
                <div>
                  <Label htmlFor="model-example">Example AI Output</Label>
                   <textarea
                    id="model-example"
                    value={modelExample}
                    onChange={(e) => setModelExample(e.target.value)}
                    placeholder="Provide the ideal output for the sample input."
                    className="w-full h-24 p-2 bg-gray-900/70 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono text-sm"
                    aria-label="Example AI Output"
                  />
                </div>
              </div>
          </Section>

          <Section title="Idea Pad / User Prompt" onSuggest={onSuggestPrompt} isSuggesting={isSuggesting.prompt} suggestLabel="Suggest a prompt">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write your prompt here... Use {{variable}} for dynamic content."
              className="w-full h-48 p-2 bg-gray-900/70 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono text-sm"
              aria-label="Main Prompt"
            />
          </Section>
          
          <Section 
            title="User Vibe / Tone Control"
            onSuggest={onSuggestVibe}
            isSuggesting={isSuggesting.vibe}
            suggestLabel="Suggest vibe and tone settings"
          >
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="temperature">Creativity (Temperature): {settings.temperature.toFixed(1)}</Label>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>
                 <div>
                    <Label>Formality</Label>
                    <div className="flex items-center gap-2">
                      {(['default', 'casual', 'formal'] as const).map(f => (
                        <Button
                          key={f}
                          onClick={() => setSettings({ ...settings, formality: f })}
                          variant={settings.formality === f ? 'primary' : 'secondary'}
                          size="sm"
                          className="flex-1 capitalize"
                        >
                          {f}
                        </Button>
                      ))}
                    </div>
                </div>
                <div>
                  <Label>Conciseness</Label>
                  <div className="flex items-center gap-2">
                    {(['default', 'brief', 'detailed'] as const).map(c => (
                      <Button
                        key={c}
                        onClick={() => setSettings({ ...settings, conciseness: c })}
                        variant={settings.conciseness === c ? 'primary' : 'secondary'}
                        size="sm"
                        className="flex-1 capitalize"
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
          </Section>

          <Section 
            title="Contextual Variables"
            onSuggest={onSuggestVariables}
            isSuggesting={isSuggesting.variables}
            suggestLabel="Suggest contextual variables"
          >
            <div className="space-y-2">
              {variables.map((variable) => (
                <div key={variable.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="key"
                    value={variable.key}
                    onChange={(e) => handleVariableChange(variable.id, 'key', e.target.value)}
                    className="flex-1 p-2 bg-gray-900/70 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 font-mono text-sm"
                  />
                  <input
                    type="text"
                    placeholder="value"
                    value={variable.value}
                    onChange={(e) => handleVariableChange(variable.id, 'value', e.target.value)}
                    className="flex-1 p-2 bg-gray-900/70 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 font-mono text-sm"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeVariable(variable.id)} aria-label="Remove variable">
                     {React.cloneElement(ICONS.TRASH, {className: 'h-4 w-4'})}
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={addVariable} className="mt-3" leftIcon={React.cloneElement(ICONS.ADD, {className: 'h-4 w-4'})}>
              Add Variable
            </Button>
          </Section>
        </div>
        <div className="p-4 border-t border-fuchsia-500/20 mt-auto flex-shrink-0">
          <Button onClick={onRun} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? React.cloneElement(ICONS.SPINNER, {className: 'mr-2 h-5 w-5'}) : null}
            {isLoading ? 'Whispering to AI...' : 'Run Prompt'}
          </Button>
        </div>
      </Card>
    </div>
  );
};