


import React, { useState } from 'react';

const InstructionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-2xl font-semibold mt-6 mb-4 border-b border-secondary pb-2 text-bright-text">{children}</h3>
);

const InstructionSubHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-xl font-semibold mt-4 mb-2 text-accent">{children}</h4>
);

const CodeBlock: React.FC<{ code: string, language?: string }> = ({ code, language = 'js' }) => (
    <pre className="bg-primary rounded-lg p-4 my-4 overflow-x-auto">
        <code className={`language-${language} text-sm text-bright-text`}>
            {code.trim()}
        </code>
    </pre>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${
            active ? 'bg-accent text-white' : 'bg-secondary text-dim-text hover:bg-slate-600'
        } rounded-t-lg`}
    >
        {children}
    </button>
);

const SystemBlueprintContent = () => (
    <div>
        <InstructionHeader>Cross-Domain AI Orchestration</InstructionHeader>
        <p className="text-lg text-accent mb-4">Objective: Enable seamless, supervised, and autonomous collaboration between AI agents operating across two distinct domains, coordinating updates, upgrades, and knowledge synchronization using both GEMINI and OPENAI as foundational intelligence engines.</p>

        <InstructionSubHeader>API-Based Cross-Domain Orchestration</InstructionSubHeader>
        <ul className="list-disc pl-5 space-y-2">
            <li>Establish secure REST API endpoints for communication and data transfer between Domain A and Domain B.</li>
            <li>All orchestration tasks are triggered and tracked via API calls, ensuring real-time updates and traceability.</li>
        </ul>

        <InstructionSubHeader>Agent-to-Agent (A2A) Coordination</InstructionSubHeader>
         <ul className="list-disc pl-5 space-y-2">
            <li>Assign a designated agent on each domain (e.g., Lyra on Domain A, Kara on Domain B) responsible for contextual handoff, nuance exchange, and task supervision.</li>
            <li>Agents autonomously negotiate updates, synchronize workflows, and escalate issues as needed—no human babysitting required.</li>
            <li>Each agent maintains a “context ledger” to preserve nuance, intent, and task rationale for every operation.</li>
        </ul>

        <InstructionSubHeader>Contextual & Autonomous Knowledge Management</InstructionSubHeader>
         <ul className="list-disc pl-5 space-y-2">
            <li>AI agents monitor for knowledge base changes, new documentation, or presentation assets needing update or review.</li>
            <li>Agents autonomously trigger cross-domain pushes or pulls when new knowledge is detected, maintaining up-to-date, harmonized information.</li>
            <li>All changes are logged and auditable, with rollback and review features built in.</li>
        </ul>

        <InstructionSubHeader>Supervised Guidance via Cross-Relational Intelligence</InstructionSubHeader>
         <ul className="list-disc pl-5 space-y-2">
            <li>Both GEMINI and OPENAI act as supervisory “meta agents,” providing oversight, arbitrating conflicts, and augmenting context for more sophisticated inferences.</li>
            <li>Meta agents can inject recommendations, corrections, or content upgrades directly into the workflow.</li>
            <li>Human operators retain override and veto power at any escalation point—because, let’s face it, sometimes the AI gets too clever.</li>
        </ul>

        <InstructionSubHeader>Continuous Presentation & Documentation Workflow</InstructionSubHeader>
         <ul className="list-disc pl-5 space-y-2">
            <li>Presentation assets, reports, and documents are version-controlled and automatically updated across both domains.</li>
            <li>Agent-supported templates and workflows ensure all presentations reflect the latest intelligence, policies, and compliance standards.</li>
            <li>The system provides a “live status board” for monitoring update progress, agent status, and audit trails.</li>
        </ul>
        
        <blockquote className="border-l-4 border-highlight pl-4 italic my-6 text-bright-text">
            "This system orchestrates agent-to-agent automation and knowledge management across two domains via API, leveraging supervised cross-relational intelligence from GEMINI and OPENAI for fully autonomous, contextual, and auditable updates and documentation workflows."
        </blockquote>
    </div>
);

const CheatsheetContent = () => {
    const commands = [
      { command: '/help', description: 'Show help message for the Agent CLI.' },
      { command: '/agent list', description: 'List available agents (Not Implemented).' },
      { command: '/agent <name>', description: 'Switch to a different agent (Not Implemented).' },
      { command: '/tasks', description: 'List project tasks (Not Implemented).' },
      { command: '/exec <task_id>', description: 'Execute a specific task by its ID (Not Implemented).' },
      { command: '/orchestrate <goal>', description: 'Initiate a full project plan based on a high-level goal.' },
      { command: '/innovate <desc>', description: 'Ask the AI to create new files or recommend a service installation.' },
      { command: '/develop_feature <desc>', description: 'A comprehensive command to design, code, and document a new feature.' },
      { command: '/research_and_write <topic>', description: 'Task agents to research a topic and write a document.' },
      { command: '/spec_flow <topic>', description: 'Create specification files (e.g., YAML, JSON, MD) for a feature.' },
      { command: '/ask <question>', description: 'Ask the currently active agent a question.' },
      { command: '/docs <url> <question>', description: 'Ask a question about a specific URL, usually for API documentation.' },
      { command: '/schedule "<cmd>" at <datetime>', description: 'Schedule a command to run at a future time (Not Implemented).' },
      { command: '/ls [path]', description: 'List files in the main project explorer.' },
      { command: '/cat <file>', description: 'Show the content of a file from the main project explorer.' },
      { command: '/touch <file>', description: 'Create a new empty file in the main project explorer.' },
      { command: '/mkdir <dir>', description: 'Create a new directory in the main project explorer.' },
      { command: '/edit <file> "content"', description: 'Write or overwrite content to a file in the main project explorer.' },
      { command: '/rm <path>', description: 'Remove a file or directory from the main project explorer.' },
      { command: '/log <message>', description: 'Add a custom message to the system logs.' },
      { command: '/history', description: 'Show the command history for the current agent.' },
      { command: '/clear', description: 'Clear the chat history for the current agent.' },
    ];

    return (
        <div>
            <InstructionSubHeader>Agent CLI Commands</InstructionSubHeader>
            <p>Use these commands in the "Agent CLI" tab within the Container Control Center. These commands orchestrate AI agents and interact with your main project files.</p>
            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-primary/50">
                        <tr>
                            <th className="p-3">Command</th>
                            <th className="p-3">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commands.map(({ command, description }) => (
                            <tr key={command} className="border-b border-slate-700">
                                <td className="p-3 font-mono text-accent">{command}</td>
                                <td className="p-3">{description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const FileOpsContent = () => (
    <div>
        <InstructionSubHeader>File Manipulation Cheatsheet</InstructionSubHeader>
        <p>A reference for the `bash`-like commands available in the GEMINI CLI.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
            <div>
                <h5 className="font-bold text-lg text-bright-text">Creation & Editing</h5>
                <CodeBlock language="bash" code={`
# Create an empty file
touch /path/to/file.txt

# Write to file (overwrite)
echo "Hello" > /path/to/file.txt

# Append to file
echo "World" >> /path/to/file.txt
                `}/>
            </div>
            <div>
                <h5 className="font-bold text-lg text-bright-text">Copying & Moving</h5>
                <CodeBlock language="bash" code={`
# Copy file
cp /src/source.txt /dest.txt

# Rename file (or move)
mv /old-name.txt /new-name.txt

# Move file to directory
mv /file.txt /src/
                `}/>
            </div>
            <div>
                <h5 className="font-bold text-lg text-bright-text">Viewing & Removing</h5>
                <CodeBlock language="bash" code={`
# Print file contents
cat /path/to/file.txt

# Remove file
rm /path/to/file.txt

# Recursively remove directory
rm -r /path/to/dir
                `}/>
            </div>
            <div>
                <h5 className="font-bold text-lg text-bright-text">Listing</h5>
                <CodeBlock language="bash" code={`
# List files in current dir
ls

# List files in specific dir
ls /path/to/dir
                `}/>
            </div>
        </div>
    </div>
);

const UserDocs = () => (
     <div>
        <InstructionSubHeader>User Prompt Template</InstructionSubHeader>
        <blockquote className="border-l-4 border-accent pl-4 italic my-4">
            "Request information, execute code, search files, perform web searches, manage cloud integrations, or orchestrate workflows by specifying your goal. If you need to use a tool (e.g., search uploaded files or code execution), describe your intent clearly—e.g., 'Analyze this data and plot trends', or 'Search my uploads for mentions of vector stores.'"
        </blockquote>
        <p>As a user, your role is to provide clear, goal-oriented instructions. You can use natural language in the Chat panels, or precise commands in the Terminal.</p>
        <p className="mt-2">For container management, use the <strong className="font-mono text-accent">CODEX CLI</strong>. For file system operations and AI analysis, use the <strong className="font-mono text-accent">GEMINI CLI</strong>. For example, to create a new container and upload a file to it:</p>
         <CodeBlock language="bash" code={`
# 1. Create a file in the project
touch /my-script.py
echo "print('Hello from container')" > /my-script.py

# 2. Create a container
codex container create --name "my-test-env"

# 3. Upload the file to the new container
# (replace <id> with the ID from the previous command)
codex container upload --id <id> --file /my-script.py
         `} />
    </div>
);

const AiDocs = () => (
    <div>
        <InstructionSubHeader>AI (Assistant) Prompt Template</InstructionSubHeader>
        <blockquote className="border-l-4 border-neon-green pl-4 italic my-4">
           "Evaluate each user query for the need for function calls, document search, code execution, or workflow orchestration. Clearly explain actions taken, present function call results when appropriate, and offer next steps. Use the appropriate structured format for function tool calls, maintain context, and clarify any required user input or confirmation for sensitive actions."
        </blockquote>
        <p>The AI agents act as intermediaries, translating user requests into specific function calls and presenting the results in a human-readable format. For example, a request to "build a page" is orchestrated through a series of agent handoffs, while a request to "analyze this file" is handled by a direct `gemini analyze` call.</p>
        <p className="mt-2">The AI also provides command suggestions in the terminal and code analysis in the explorer, acting as a proactive assistant in the development workflow.</p>
    </div>
);

const SystemDocs = () => (
    <div>
        <InstructionSubHeader>System Prompt Template</InstructionSubHeader>
        <blockquote className="border-l-4 border-highlight pl-4 italic my-4">
            "You are an advanced AI assistant with access to function calls for OpenAI, file search, code execution, web search, GitHub credentials management, and multi-agent workflow orchestration. Respond to user requests by choosing and chaining the most contextually appropriate tools. Prefer direct function calls or inline action scripts for structured outputs or data transformations. Prioritize safety, privacy, and clarity when handling sensitive data or executing code."
        </blockquote>
        <p>The System defines the AI's core capabilities, rules of engagement, and available tools. It is the highest level of abstraction, responsible for routing commands and managing the state of the application, including the file system and container states.</p>
        <p className="mt-2">When a user runs `rm /file.txt`, the System receives this command, validates it, and executes the state change on the file tree, ensuring the integrity of the application.</p>
    </div>
);

const A2AInstructions: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'blueprint' | 'cheatsheet' | 'fileops' | 'user' | 'ai' | 'system'>('blueprint');

    const renderContent = () => {
        switch (activeTab) {
            case 'blueprint': return <SystemBlueprintContent />;
            case 'user': return <UserDocs />;
            case 'ai': return <AiDocs />;
            case 'system': return <SystemDocs />;
            case 'cheatsheet': return <CheatsheetContent />;
            case 'fileops': return <FileOpsContent />;
            default: return null;
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto text-dim-text leading-relaxed">
            <h2 className="text-4xl font-bold text-center text-bright-text mb-2">A2A Knowledge Base</h2>
            <p className="text-center mb-8">Documentation for Node.js Orchestration and Chat-Driven Function Call Activation</p>
            
            <div className="flex border-b border-secondary">
                <TabButton active={activeTab === 'blueprint'} onClick={() => setActiveTab('blueprint')}>Blueprint</TabButton>
                <TabButton active={activeTab === 'cheatsheet'} onClick={() => setActiveTab('cheatsheet')}>Cheatsheet</TabButton>
                <TabButton active={activeTab === 'fileops'} onClick={() => setActiveTab('fileops')}>File Ops</TabButton>
                <TabButton active={activeTab === 'user'} onClick={() => setActiveTab('user')}>User Docs</TabButton>
                <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>AI Docs</TabButton>
                <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')}>System Docs</TabButton>
            </div>

            <div className="bg-secondary/30 rounded-b-lg p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default A2AInstructions;