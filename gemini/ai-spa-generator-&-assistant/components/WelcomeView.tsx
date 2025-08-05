
import React from 'react';
import { CodeIcon, ServerIcon, DocumentTextIcon, TerminalIcon } from './icons';

interface WelcomeViewProps {
  onExamplePromptClick: (prompt: string) => void;
}

const exampleCategories = [
    {
        title: 'UI & Frontend',
        icon: <CodeIcon className="w-6 h-6 mr-3 text-neon-pink" />,
        examples: [
            "Generate a reusable 'Card' component in React and TypeScript, styled with Tailwind CSS.",
            "Analyze the open spec file from a UI/UX perspective and suggest improvements.",
            "Generate the JSX and logic for a 'Date Range Picker' component in React.",
        ],
    },
    {
        title: 'Refactor & Modernize',
        icon: <ServerIcon className="w-6 h-6 mr-3 text-neon-green" />,
        examples: [
            "Analyze the open legacy code and provide a migration plan to a modern TypeScript class.",
            "Execute a migration plan and provide the complete, refactored TypeScript code.",
            "Identify performance bottlenecks in the current file and suggest optimizations.",
        ],
    },
    {
        title: 'Test & Document',
        icon: <DocumentTextIcon className="w-6 h-6 mr-3 text-neon-purple" />,
        examples: [
            "Generate Jest unit tests for the selected utility function, including edge cases.",
            "Generate comprehensive JSDoc comments for the selected class.",
            "Write a Python script that uses `requests` to test an API endpoint.",
        ],
    },
    {
        title: 'General & DevOps',
        icon: <TerminalIcon className="w-6 h-6 mr-3 text-neon-blue" />,
        examples: [
            "Generate a `vite.config.ts` file for a React + TypeScript project with path aliases.",
            "Create a `Dockerfile` to containerize a production Vite React app using a multi-stage build.",
            "Explain this code block like I'm a junior developer."
        ],
    },
];

const WelcomeView: React.FC<WelcomeViewProps> = ({ onExamplePromptClick }) => {
    return (
        <div className="w-full h-full p-6 text-text-main overflow-y-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white" style={{textShadow: '0 0 8px rgba(255,255,255,0.7)'}}>AI Assistant & Code Generator</h2>
                <p className="text-base text-text-main/80 mt-1">
                    Choose an example from the categories below or type your own prompt to get started.
                </p>
            </div>
            <div className="space-y-6">
                {exampleCategories.map((category) => (
                    <div key={category.title} className="bg-neon-panel/50 border border-neon-border rounded-lg p-4">
                        <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                            {category.icon}
                            {category.title}
                        </h3>
                        <div className="space-y-2">
                            {category.examples.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => onExamplePromptClick(prompt)}
                                    className="w-full text-left p-2.5 bg-neon-input/50 border border-transparent rounded-md text-sm text-text-main/90 transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 hover:text-white"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WelcomeView;
