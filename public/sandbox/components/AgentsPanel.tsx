import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatWithAgent, refineCodeWithAgent, getAiHint, runCommandInTerminal } from '../services/geminiService';
import * as githubService from '../services/githubService';
import type { FileSystemState, ChatMessage, GithubRepo, GithubBranch, GithubUser, FileChange, TerminalLine } from '../types';
import { SpinnerIcon, PanelLeftIcon, PanelRightIcon, MagicWandIcon, LightbulbIcon, XIcon, DocumentTextIcon, GeminiIcon, MaximizeIcon, MinimizeIcon, ChevronDownIcon, ChevronUpIcon, GithubIcon, CodeIcon, TerminalIcon } from './Icons';
import CollapsibleSection from './CollapsibleSection';
import ChatMessageView from './ChatMessage';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodePreview';
import ComponentLibrary from './ComponentLibrary';
import LayoutTemplates, { LayoutTemplateData } from './LayoutTemplates';
import Terminal from './Terminal';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import dbService from '../services/dbService';
import OrbMenu from './OrbMenu';
import GithubPanel from './GithubPanel';
import InlineEditor from './InlineEditor';

const readmeContent = `# Live Web Dev Sandbox with Gemini AI & GitHub Integration

This is a powerful, browser-based development environment that combines the creative power of the Google Gemini AI with the version control capabilities of GitHub. It allows you to generate, edit, and manage full web projects using natural language, and then commit your work directly to a repository.

## Key Features

-   **AI-Powered Development**: Instruct the Gemini agent to create files, write HTML, style with CSS/TailwindCSS, and add JavaScript functionality.
-   **Full GitHub Integration**: Connect your GitHub account, load repositories, browse branches, and commit & push changes directly from the app.
-   **Simulated WebContainer Terminal**: An AI-powered terminal that understands common shell commands (\`ls\`, \`cd\`, \`cat\`, \`node server.js\`) to orchestrate project changes.
-   **Live Preview & Editing**: See your changes reflected instantly. Drag-and-drop components or click on elements to edit them directly.
-   **\`innovate\` Project Factory**: A built-in project templating system that the AI can use to bootstrap new Node.js, React, or other projects on command.
-   **Complete File Management**: A familiar file explorer with support for creating files/folders, uploading (including ZIP archives), and downloading your entire project.

---

## First Run & Quick Start

Get up and running in minutes.

1.  **Connect to GitHub (Recommended)**:
    *   Go to the "GitHub" panel on the left.
    *   Enter a [GitHub Personal Access Token (PAT)](https://github.com/settings/tokens?type=beta) with \`repo\` scope. **Your token is stored securely in your browser's local storage and is never exposed.**
    *   Click "Connect".

2.  **Load a Project**:
    *   **From GitHub**: Select a repository and a branch from the dropdowns and click "Load Repo".
    *   **Start Fresh**: Use the default project structure that's loaded on first use.
    *   **Upload**: Drag a ZIP file of your project onto the file explorer.

3.  **Interact with the AI Agent**:
    *   Use the "Inference" chat panel at the top. Type a command like:
        > "Create a button with the text 'Click Me' and style it with a blue background using TailwindCSS."
    *   The agent will reply, explain its work, and show you the proposed code changes. Click **"Apply to Editor"** to accept them.

4.  **Edit Manually**:
    *   Click on any file in the "File Explorer" to open it in the "Editor".
    *   Use the "Refine" input above the editor to ask the AI to modify only the active file.

5.  **Commit Your Work**:
    *   Once connected to GitHub, the "Source Control" section will show all your changes.
    *   Write a commit message (e.g., "feat: Add new call-to-action button").
    *   Click **"Commit & Push"**. Your changes are now live on GitHub!

---

## Feature Deep Dive

### The AI Agent (Inference Panel)

The Inference panel is your primary interface to the AI. Be specific and give one instruction at a time for best results.

-   **Create Elements**: \`Create a header with an h1 that says "Welcome".\`
-   **Style Elements**: \`Use TailwindCSS to make the button have a shadow and scale up on hover.\`
-   **Add Functionality**: \`In /script.js, add a click event listener to the button with id "submit-btn".\`
-   **Manage Files**: \`Create a new file named /components/card.js.\`
-   **Use Templates**: \`Using the innovate manifest, create a new Node.js Express project in a directory called /my-api.\`

### The Simulated Terminal (WebContainer)

The "Terminal" tab provides a command-line interface, but it's important to understand how it works:

**It is an AI-powered simulation, not a real WebContainer.**

-   **How it works**: When you type a command like \`node server.js\`, the command is sent to the Gemini agent. The agent reads the contents of \`server.js\`, understands what a Node.js server would do, and returns a *simulated* output. If you use \`mkdir /new-dir\`, the agent will return file system changes that the application then applies to the File Explorer.
-   **What it's for**: It's an incredibly powerful tool for AI-driven orchestration. The agent can use it to simulate \`npm install\` by reading \`package.json\`, or to "run" a script and report the outcome.
-   **Limitations**: It does **not** actually execute code, run a live server, or access the network. It's a high-level simulation for managing project structure and getting feedback on what *would* happen if the code were run in a real environment.

### The \`/innovate\` Project Factory

The \`/innovate\` directory is a built-in template registry. The AI is aware of this directory and its \`manifest.json\` file. This allows you to issue high-level commands for bootstrapping entire projects.

-   **Example**: \`Create a new React app in /my-dashboard.\`
-   **How it works**:
    1.  The AI reads \`/innovate/manifest.json\` to find the "React" template.
    2.  It sees the template source is at \`/innovate/containers/react-vanilla/\`.
    3.  It copies all files from that directory into your new \`/my-dashboard/\` directory.

You can extend this by adding your own templates to the \`/innovate/containers/\` directory and updating the \`manifest.json\`.

---

## How to Administer, Maintain, and Distribute this Application

You asked how to manage and distribute this application as a development instrument. Here's the breakdown:

**This application *is* the development instrument.** It's a fully client-side static web application.

1.  **Sourcing & Maintenance**:
    *   The "source" is the GitHub repository containing these files.
    *   To "maintain" the application, you simply make changes to the code (e.g., updating React components, improving Gemini prompts in \`geminiService.ts\`) and commit them to your repository.

2.  **Administration**:
    *   Administration is done through standard Git and GitHub workflows (branches, pull requests, etc.).
    *   The primary configuration you must administer is the **API Key**. The \`GoogleGenAI\` client is initialized with \`process.env.API_KEY\`. When you deploy the application, you must set this as an environment variable in your hosting provider's settings.

3.  **Distribution (Deployment)**:
    *   Since this is a static application (HTML, CSS, JS), you can distribute it by deploying it to any modern web hosting platform.
    *   **Recommended Platforms**: [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), [GitHub Pages](https://pages.github.com/).
    *   **Deployment Steps (Example with Vercel)**:
        1.  Fork this repository to your own GitHub account.
        2.  Go to [vercel.com](https://vercel.com/) and create a new project, linking it to your forked repository.
        3.  In the Vercel project settings, go to "Environment Variables" and add a variable named \`API_KEY\` with your Google AI Studio API key as the value.
        4.  Deploy. Vercel will build and host your application at a public URL.

Anyone with the URL can now use your version of the Live Dev Sandbox.
`;

const innovateReadme = `# /innovate Directory

The \`/innovate\` directory is a central template registry designed for multi-environment app orchestration and rapid project bootstrapping. It serves as a source of ready-made starter templates and container builds, supporting both Dockerized and standalone (vanilla) project types.

## Key Points

-   **Purpose**: To provide a unified, organized set of templates for instant project creation, development, and dynamic deployment—usable by AI agents, human developers, or orchestration scripts.
-   **manifest.json**: A machine-readable index of all templates and their capabilities. This is the entry point for any automation.
-   **containers/**: Contains the source code for all starter templates.

## How to Use (for AI Agents)

1.  **Discover**: Read \`/innovate/manifest.json\` to find available template types.
2.  **Provision**: Copy a template from its path in \`containers/\` to a new directory to start a project.
3.  **Automate**: After provisioning, you can run commands like \`npm install\` or suggest next steps to the user.
`;

const innovateManifest = `{
  "schemaVersion": "1.0",
  "templates": [
    {
      "id": "node-express-vanilla",
      "name": "Node.js + Express (Vanilla)",
      "description": "A minimal, standalone Node.js and Express server.",
      "type": "vanilla",
      "path": "/innovate/containers/node-express-vanilla/",
      "tags": ["node", "express", "backend"]
    },
    {
      "id": "react-vanilla",
      "name": "React SPA (Vanilla)",
      "description": "A basic client-side React single-page application setup without a build step.",
      "type": "vanilla",
      "path": "/innovate/containers/react-vanilla/",
      "tags": ["react", "frontend", "spa"]
    }
  ]
}`;

const initialFileSystem: FileSystemState = {
  // Main documentation
  '/README.md': readmeContent,

  // Base project structure
  '/index.html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Sandbox</title>\n  <link rel="stylesheet" href="/style.css">\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n  <h1 class="text-3xl font-bold text-center mt-8" data-editable-id="e7a78e4a-58f7-4a7c-b5f3-4d7a7d3e6e8e">Welcome to your Live Sandbox!</h1>\n  <p class="text-center" data-editable-id="b7a78e4a-58f7-4a7c-b5f3-4d7a7d3e6e8f">Click and hold to see editable regions, then click one to edit its code.</p>\n  <script src="/script.js"></script>\n</body>\n</html>',
  '/style.css': 'body { \n  font-family: sans-serif;\n  background-color: #111827; /* A default dark theme */\n  color: #E5E7EB; /* Default light text on dark background */\n}',
  '/script.js': '// JavaScript goes here',

  // User instructions
  '/instructions.md': '# Custom Instructions\n\nYou are a helpful and creative web developer. You specialize in modern, clean designs using TailwindCSS.',
  
  // Innovate Directory Structure
  '/innovate/README.md': innovateReadme,
  '/innovate/manifest.json': innovateManifest,
  '/innovate/templates/.placeholder': '', // Represents an empty directory
  
  // Innovate Template: Node.js + Express (Vanilla)
  '/innovate/containers/node-express-vanilla/package.json': JSON.stringify({
    "name": "node-express-vanilla-template",
    "version": "1.0.0",
    "description": "A simple Express server template.",
    "main": "server.js",
    "scripts": { "start": "node server.js" },
    "dependencies": { "express": "^4.19.2" }
  }, null, 2),
  '/innovate/containers/node-express-vanilla/server.js': `const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(port, () => {
  console.log(\`Server listening at http://localhost:\${port}\`);
});`,

  // Innovate Template: React SPA (Vanilla)
  '/innovate/containers/react-vanilla/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Vanilla Template</title>
    <link rel="stylesheet" href="./src/index.css">
    <!-- These scripts are for in-browser JSX transformation (not for production) -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" src="./src/App.jsx"></script>
  </body>
</html>`,
  '/innovate/containers/react-vanilla/src/App.jsx': `function App() {
  return (
    <div className="App">
      <h1>Hello, React!</h1>
      <p>This is a vanilla React template running in the browser.</p>
    </div>
  );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);`,
  '/innovate/containers/react-vanilla/src/index.css': `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  margin: 40px;
  text-align: center;
  background-color: #f0f2f5;
}

.App {
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: inline-block;
}`
};


const MarkdownPreview: React.FC<{ markdown: string }> = ({ markdown }) => {
    const [html, setHtml] = useState('');

    useEffect(() => {
        const parseMd = async () => {
            try {
                const parsedHtml = await marked.parse(markdown);
                setHtml(parsedHtml);
            } catch (error) {
                console.error("Error parsing markdown:", error);
                setHtml("<p>Error parsing markdown.</p>");
            }
        }
        parseMd();
    }, [markdown]);

    return (
        <div className="w-full h-full bg-gray-800 p-4 rounded-md overflow-y-auto" aria-live="polite">
            <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: html }}></div>
        </div>
    );
};

// Simple path resolver
const resolvePath = (base: string, relative: string): string => {
    const stack = base.split('/');
    // if base is a file, not a dir, start from its parent
    if (base.slice(-1) !== '/') {
      stack.pop();
    }
    const parts = relative.split('/');
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '.')
            continue;
        if (parts[i] === '..')
            stack.pop();
        else
            stack.push(parts[i]);
    }
    return stack.join('/');
};

const getMimeType = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'html': return 'text/html';
        case 'css': return 'text/css';
        case 'js': return 'application/javascript';
        case 'json': return 'application/json';
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'svg': return 'image/svg+xml';
        case 'md': return 'text/markdown';
        default: return 'application/octet-stream';
    }
};

interface OrchestratorPanelProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

interface EditingElementInfo {
    id: string;
    html: string;
    position: {
        top: number;
        left: number;
    };
}


const OrchestratorPanel: React.FC<OrchestratorPanelProps> = ({ isFocusMode, onToggleFocusMode }) => {
  const [isDBLoading, setIsDBLoading] = useState(true);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [cliInput, setCliInput] = useState<string>('');
  const [fileSystem, setFileSystem] = useState<FileSystemState>({});
  const [previewRoot, setPreviewRoot] = useState<string | null>('/');
  const [srcDoc, setSrcDoc] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string>('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [panelSizes, setPanelSizes] = useState<number[]>([25, 40, 35]);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [lastLeftPanelSize, setLastLeftPanelSize] = useState(panelSizes[0]);
  const dragDividerIndex = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal'>('editor');


  const [refineInstruction, setRefineInstruction] = useState<string>('');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editingElementInfo, setEditingElementInfo] = useState<EditingElementInfo | null>(null);
  
  const [aiHint, setAiHint] = useState<string>('');
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  
  const [chatPanelHeight, setChatPanelHeight] = useState<number>(250);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  const [fileSystemHistory, setFileSystemHistory] = useState<FileSystemState[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date | null>(null);

  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([]);
  const [terminalCwd, setTerminalCwd] = useState('/');
  const [isTerminalLoading, setIsTerminalLoading] = useState(false);

  // GitHub State
  const [githubToken, setGithubToken] = useState<string>('');
  const [isGithubConnected, setIsGithubConnected] = useState<boolean>(false);
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
  const [repoBranches, setRepoBranches] = useState<GithubBranch[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState<string>('');
  const [isLoadingFromGithub, setIsLoadingFromGithub] = useState<boolean>(false);
  const [initialGithubFileSystem, setInitialGithubFileSystem] = useState<FileSystemState | null>(null);
  const [changedFiles, setChangedFiles] = useState<FileChange[]>([]);

  const saveSnapshot = useCallback((fs: FileSystemState) => {
      setFileSystemHistory(prev => {
          const newHistory = prev.slice(0, currentHistoryIndex + 1);
          newHistory.push(fs);
          return newHistory;
      });
      setCurrentHistoryIndex(prev => prev + 1);
  }, [currentHistoryIndex]);

  // Load state from IndexedDB on initial render
  useEffect(() => {
    const loadStateFromDB = async () => {
        await dbService.initDB();
        const savedState = await dbService.loadState();
        if (savedState) {
            setChatHistory(savedState.chatHistory || [{role: 'system', content: 'Session restored.'}]);
            const loadedFs = savedState.fileSystem || initialFileSystem;
            setFileSystem(loadedFs);
            setPanelSizes(savedState.panelSizes || [25, 40, 35]);
            setPreviewRoot(savedState.previewRoot || '/');
            setOpenFiles(savedState.openFiles || ['/README.md', '/index.html']);
            setActiveFile(savedState.activeFile || '/README.md');
            setChatPanelHeight(savedState.chatPanelHeight || 250);
            setGithubToken(savedState.githubToken || '');
            setTerminalHistory(savedState.terminalHistory || []);
            setTerminalCwd(savedState.terminalCwd || '/');
            
            // Initialize history
            setFileSystemHistory([loadedFs]);
            setCurrentHistoryIndex(0);
        } else {
            // First time load, initialize with defaults and save to DB
            setChatHistory([{role: 'system', content: 'Session started. Ask the Gemini agent to build something!'}]);
            setFileSystem(initialFileSystem);
            setFileSystemHistory([initialFileSystem]);
            setCurrentHistoryIndex(0);
            setOpenFiles(['/README.md', '/index.html']);
            setActiveFile('/README.md');
            await dbService.saveState({
                chatHistory: [{role: 'system', content: 'Session started.'}],
                fileSystem: initialFileSystem,
                panelSizes: [25, 40, 35],
                previewRoot: '/',
                openFiles: ['/README.md', '/index.html'],
                activeFile: '/README.md',
                chatPanelHeight: 250,
                githubToken: '',
                terminalHistory: [],
                terminalCwd: '/',
            });
        }
        setIsDBLoading(false);
    };
    loadStateFromDB();
  }, []);


  // Auto-save state to IndexedDB
  useEffect(() => {
    if (isDBLoading) return; // Don't save while initially loading
    const handler = setTimeout(() => {
        const stateToSave = { chatHistory, fileSystem, panelSizes, previewRoot, openFiles, activeFile, chatPanelHeight, githubToken, terminalHistory, terminalCwd };
        dbService.saveState(stateToSave).catch(e => console.error("Failed to save state:", e));
    }, 1500); // Debounce saving
    return () => clearTimeout(handler);
  }, [chatHistory, fileSystem, panelSizes, previewRoot, openFiles, activeFile, chatPanelHeight, githubToken, terminalHistory, terminalCwd, isDBLoading]);
  
    useEffect(() => {
        const generatePreview = async () => {
            if (!previewRoot) {
                setSrcDoc('<html><body>No preview root selected.</body></html>');
                return;
            }

            const indexPath = `${previewRoot}index.html`;
            const indexContent = fileSystem ? fileSystem[indexPath] : undefined;
            
            if (indexContent === undefined) {
                 setSrcDoc(`<html><body>No index.html found in preview root: ${previewRoot}. Select a folder with an index.html file to preview, or create an index.html.</body></html>`);
                return;
            }

            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(indexContent, 'text/html');

                const assetSelectors = 'link[href], script[src], img[src], source[srcset]';
                const elements = Array.from(doc.querySelectorAll(assetSelectors));

                for (const el of elements) {
                    const srcAttr = el.hasAttribute('href') ? 'href' : (el.hasAttribute('src') ? 'src' : 'srcset');
                    const originalPath = el.getAttribute(srcAttr);

                    if (!originalPath || originalPath.startsWith('http') || originalPath.startsWith('data:')) {
                        continue;
                    }
                    
                    const assetPath = originalPath.startsWith('/')
                      ? originalPath
                      : resolvePath(indexPath, originalPath);

                    const assetContent = fileSystem[assetPath];

                    if (assetContent) {
                        const blob = new Blob([assetContent], { type: getMimeType(assetPath) });
                        const blobUrl = URL.createObjectURL(blob);
                        el.setAttribute(srcAttr, blobUrl);
                    } else {
                        console.warn(`Asset not found in file system: ${assetPath}`);
                    }
                }
                
                // Add data-editable-id to elements that should be editable but don't have one
                doc.querySelectorAll('h1, h2, h3, h4, p, button, a').forEach(el => {
                    if (!el.hasAttribute('data-editable-id')) {
                        el.setAttribute('data-editable-id', uuidv4());
                    }
                });

                const finalHtml = new XMLSerializer().serializeToString(doc);
                setSrcDoc(finalHtml);
            } catch (e) {
                console.error("Error generating preview:", e);
                setSrcDoc('<html><body>Error generating preview. Check console for details.</body></html>');
            }
        };

        const timeout = setTimeout(generatePreview, 500);
        return () => clearTimeout(timeout);
    }, [fileSystem, previewRoot]);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, chatPanelHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragDividerIndex.current === null) return;
    
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const index = dragDividerIndex.current;
    
    const totalWidthOfPreviousPanels = panelSizes.slice(0, index).reduce((sum, size) => sum + (size / 100 * containerRect.width), 0);
    let newPane1Width = e.clientX - containerRect.left - totalWidthOfPreviousPanels;
    
    const combinedWidth = (panelSizes[index] + panelSizes[index + 1]) / 100 * containerRect.width;
    let newPane2Width = combinedWidth - newPane1Width;

    const minWidthPx = 50;
    if (newPane1Width < minWidthPx) {
        newPane2Width = combinedWidth - minWidthPx;
        newPane1Width = minWidthPx;
    }
    if (newPane2Width < minWidthPx) {
        newPane1Width = combinedWidth - minWidthPx;
        newPane2Width = minWidthPx;
    }
    
    const newSizes = [...panelSizes];
    newSizes[index] = (newPane1Width / containerRect.width) * 100;
    newSizes[index + 1] = (newPane2Width / containerRect.width) * 100;
    
    setPanelSizes(newSizes);
  }, [panelSizes]);

  const handleMouseUp = useCallback(() => {
    dragDividerIndex.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    dragDividerIndex.current = index;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed(prev => {
        const isCollapsing = !prev;
        if (isCollapsing) {
            setLastLeftPanelSize(panelSizes[0]);
            const freedSpace = panelSizes[0];
            setPanelSizes([0, panelSizes[1] + freedSpace / 2, panelSizes[2] + freedSpace / 2]);
        } else {
            const spaceToReclaim = lastLeftPanelSize;
            setPanelSizes([lastLeftPanelSize, panelSizes[1] - spaceToReclaim / 2, panelSizes[2] - spaceToReclaim / 2]);
        }
        return isCollapsing;
    });
  };
  
  const handleFileSelect = (path: string) => {
    if (!openFiles.includes(path)) {
      setOpenFiles(prev => [...prev, path]);
    }
    setActiveFile(path);
    setActiveTab('editor');
  };
  
  const handleCloseFile = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(p => p !== path);
    setOpenFiles(newOpenFiles);

    if (activeFile === path) {
      if (newOpenFiles.length > 0) {
        setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
      } else {
        setActiveFile(null);
      }
    }
  };


  const handleCodeChange = (newCodeValue: string) => {
    if (!activeFile) return;
    const newFileSystem = { ...fileSystem, [activeFile]: newCodeValue };
    setFileSystem(newFileSystem);
    // Debounced history save could be implemented here
  };

  const handleRefineCode = async () => {
    if (!refineInstruction || isRefining || !activeFile || activeFile.endsWith('/') || activeFile.endsWith('.json')) return;

    setIsRefining(true);
    setError('');
    
    const currentCode = fileSystem[activeFile] || '';
    const lang = activeFile.split('.').pop() || '';
    
    try {
        const refinedCode = await refineCodeWithAgent(currentCode, lang, refineInstruction);
        const newFileSystem = { ...fileSystem, [activeFile]: refinedCode };
        setFileSystem(newFileSystem);
        saveSnapshot(newFileSystem);
        setRefineInstruction(''); // Clear input on success
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during refinement.';
        setError(errorMessage);
        setChatHistory(prev => [...prev, {role: 'system', content: `Error refining code: ${errorMessage}`}]);
    } finally {
        setIsRefining(false);
    }
  };

  const handleApplyCode = (codeUpdates: { path: string, content: string }[]) => {
      let newFileSystem = { ...fileSystem };
      const newOpenFiles = [...openFiles];

      codeUpdates.forEach(({ path, content }) => {
          newFileSystem[path] = content;
          if (!newOpenFiles.includes(path)) {
            newOpenFiles.push(path);
          }
      });
      
      setFileSystem(newFileSystem);
      saveSnapshot(newFileSystem);

      setOpenFiles(newOpenFiles);
      setChatHistory(prev => [...prev, { role: 'system', content: `Code has been applied to ${codeUpdates.map(c => c.path).join(', ')}.` }]);
      
      const firstFile = codeUpdates[0]?.path;
      if (firstFile) {
          const fileToActivate = codeUpdates.find(c => c.path.endsWith('index.html'))?.path || firstFile;
          setActiveFile(fileToActivate);
          setActiveTab('editor');
      }
  };
  
  const submitPrompt = async (promptText: string) => {
    if (!promptText || isLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', content: promptText };
    setChatHistory(prev => [...prev, newUserMessage]);
    setCliInput('');
    setError('');
    setAiHint('');
    setIsLoading(true);
    setLoadingMessage('Gemini agent is thinking...');

    try {
        const geminiResult = await chatWithAgent([...chatHistory, newUserMessage], fileSystem, previewRoot);
        const geminiMessage: ChatMessage = { 
            role: 'model',
            content: geminiResult.text,
            explanation: geminiResult.explanation,
            code: geminiResult.code
        };
        
        setChatHistory(prev => [...prev, geminiMessage]);
        
        if (geminiResult.code && geminiResult.code.length > 0) {
          handleApplyCode(geminiResult.code);
        }

        // Non-blocking call to fetch a hint
        const fetchHint = async () => {
          setIsHintLoading(true);
          try {
              const hint = await getAiHint([...chatHistory, newUserMessage, geminiMessage]);
              setAiHint(hint);
          } catch(hintError) {
              console.error("Failed to fetch AI hint:", hintError);
              setAiHint('');
          } finally {
              setIsHintLoading(false);
          }
        };
        fetchHint();

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Agent failed to respond: ${errorMessage}`);
      setChatHistory(prev => [...prev, {role: 'system', content: `Error: ${errorMessage}`}]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitPrompt(cliInput);
  };
  
  const handleLayoutSelect = (layout: LayoutTemplateData) => {
    const prompt = `Please apply the "${layout.name}" layout to the project.

This is a user-initiated action from a layout template library.

**Instructions:**
1.  Completely replace the content inside the \`<body>\` tag of \`index.html\` with the provided HTML structure.
2.  Create a new file named \`/layout.css\`. Place the provided CSS content into this file.
3.  In the \`<head>\` of \`index.html\`, add a link to this new stylesheet: \`<link rel="stylesheet" href="/layout.css">\`. Ensure this link is present. If other stylesheets exist (like style.css), this new one can be placed before them.

---
**HTML for \`index.html\` body:**
\`\`\`html
${layout.html}
\`\`\`

---
**CSS for \`/layout.css\`:**
\`\`\`css
${layout.css}
\`\`\`

After applying the changes, give a friendly confirmation message and suggest what the user could do next, like adding content to the new layout.
`;
    submitPrompt(prompt);
  };
  
  // No longer used with inline editor flow
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

    const handleUpdateElementCode = (id: string, newHtml: string) => {
        const htmlPath = `${previewRoot || '/'}index.html`;
        const newFs = {...fileSystem};
        const currentHtml = newFs[htmlPath] || '';

        try {
            // Use a temporary div to parse the current HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = currentHtml;

            const elementToReplace = tempContainer.querySelector(`[data-editable-id="${id}"]`);

            if (elementToReplace) {
                // To replace an element, we can't just set outerHTML on the element itself,
                // we need to do it on its parent.
                const parent = elementToReplace.parentNode;
                if (parent) {
                    // Create a fragment to hold the new HTML
                    const newElementFragment = document.createRange().createContextualFragment(newHtml);
                    parent.replaceChild(newElementFragment, elementToReplace);

                    // For some reason, replacing the whole body is more reliable.
                    const newBodyContent = tempContainer.querySelector('body')?.innerHTML || '';
                    
                    const bodyRegex = /<body[^>]*>([\s\S]*)<\/body>/i;
                    const updatedHtml = currentHtml.replace(bodyRegex, `<body class="...">${newBodyContent}</body>`);

                    // A simpler string replacement as a fallback if DOM manipulation fails
                    const finalHtml = currentHtml.replace(elementToReplace.outerHTML, newHtml);

                    newFs[htmlPath] = finalHtml;
                    setFileSystem(newFs);
                    saveSnapshot(newFs);
                } else {
                     throw new Error("Could not find parent of element to replace.");
                }
            } else {
                throw new Error(`Could not find element with id ${id} to update.`);
            }
        } catch (err) {
            console.error("Failed to update element in code:", err);
            setError("Failed to update element. Check console for details.");
        }
    };


  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
        const doc = iframe.contentDocument;
        if (!doc) return;

        // Inject styles for revealing editable regions
        const style = doc.createElement('style');
        style.textContent = `
            body.reveal-editable [data-editable-id] {
                outline: 2px dashed var(--neon-pink);
                cursor: pointer;
                transition: outline 0.2s ease-in-out, background-color 0.2s ease-in-out;
            }
            body.reveal-editable [data-editable-id]:hover {
                outline-width: 3px;
                background-color: rgba(255, 20, 147, 0.1);
            }
        `;
        doc.head.appendChild(style);

        const handleMouseDown = () => doc.body.classList.add('reveal-editable');
        const handleMouseUp = () => doc.body.classList.remove('reveal-editable');
        
        doc.body.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp); // Listen on window to catch mouseup outside iframe

        const handleBodyClick = (e: MouseEvent) => {
            if (!doc.body.classList.contains('reveal-editable')) return;

            const target = e.target as HTMLElement;
            const editableEl = target.closest<HTMLElement>('[data-editable-id]');

            if (editableEl) {
                e.preventDefault();
                e.stopPropagation();
                
                const id = editableEl.dataset.editableId;
                if (!id) return;

                const html = editableEl.outerHTML;
                const iframeRect = iframe.getBoundingClientRect();
                const elementRect = editableEl.getBoundingClientRect();
                
                setEditingElementInfo({
                    id: id,
                    html: html,
                    position: {
                        top: iframeRect.top + elementRect.top,
                        left: iframeRect.left + elementRect.left,
                    }
                });
            }
        };
        // Use capture phase to prevent default actions like link navigation
        doc.body.addEventListener('click', handleBodyClick, true);

        return () => { // Cleanup
            doc.body.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            doc.body.removeEventListener('click', handleBodyClick, true);
        };
    };

    iframe.addEventListener('load', handleIframeLoad);
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [srcDoc]); // Rerun when preview content changes

    const handleNewFile = (path: string) => {
      const newFs = { ...fileSystem, [path]: '' };
      setFileSystem(newFs);
      saveSnapshot(newFs);
      handleFileSelect(path);
    };

    const handleNewFolder = (path: string) => {
      const folderPath = path.endsWith('/') ? path : `${path}/`;
      const newFs = { ...fileSystem, [`${folderPath}.placeholder`]: '' };
      setFileSystem(newFs);
      saveSnapshot(newFs);
    };
    
    const handleRefreshFileSystem = () => {
        // Create a new object reference to force re-render of components using fileSystem
        setFileSystem(fs => ({...fs}));
        setChatHistory(prev => [...prev, { role: 'system', content: 'File explorer refreshed.' }]);
    }

    const handleFileUpload = async (files: FileList) => {
      let newFiles: FileSystemState = {};
      let firstDirPath = '';

      for (const file of files) {
          if (file.name.endsWith('.zip')) {
              const zip = await JSZip.loadAsync(file);
              const rootDirs = new Set(Object.keys(zip.files).map(p => p.split('/')[0]));
              const commonRoot = rootDirs.size === 1 ? [...rootDirs][0] + '/' : '';
              if (commonRoot) firstDirPath = `/${commonRoot}`;
              
              for (const path in zip.files) {
                  const zipEntry = zip.files[path];
                  if (!zipEntry.dir) {
                      const content = await zipEntry.async('string');
                      newFiles[`/${path}`] = content;
                  }
              }
          } else {
              const content = await file.text();
              newFiles[`/${file.name}`] = content;
          }
      }
      const newFs = { ...fileSystem, ...newFiles };
      setFileSystem(newFs);
      saveSnapshot(newFs);
      if(firstDirPath) setPreviewRoot(firstDirPath);
      setChatHistory(prev => [...prev, { role: 'system', content: `Uploaded ${files.length} item(s).`}])
    };
    
    const handleDownloadProject = async () => {
        const zip = new JSZip();
        Object.entries(fileSystem).forEach(([path, content]) => {
            if (path.endsWith('.placeholder')) return;
            const cleanPath = path.startsWith('/') ? path.substring(1) : path;
            zip.file(cleanPath, content);
        });

        try {
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'live-dev-project.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setChatHistory(prev => [...prev, { role: 'system', content: 'Project downloaded successfully.' }]);
        } catch (err) {
            console.error("Failed to generate zip file:", err);
            setChatHistory(prev => [...prev, { role: 'system', content: 'Error: Could not download project.' }]);
        }
    };
    
    const handleChatResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingChat(true);
    };

    const handleChatResizeMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizingChat) return;
        const newHeight = e.clientY - 60; // offset for header
        if (newHeight > 80 && newHeight < window.innerHeight - 200) {
            setChatPanelHeight(newHeight);
        }
    }, [isResizingChat]);

    const handleChatResizeMouseUp = useCallback(() => {
        setIsResizingChat(false);
    }, []);

    useEffect(() => {
        if (isResizingChat) {
            window.addEventListener('mousemove', handleChatResizeMouseMove);
            window.addEventListener('mouseup', handleChatResizeMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleChatResizeMouseMove);
            window.removeEventListener('mouseup', handleChatResizeMouseUp);
        };
    }, [isResizingChat, handleChatResizeMouseMove, handleChatResizeMouseUp]);

    const languageForPreview = (path: string | null) => {
      if (!path) return 'markdown';
      if (path.endsWith('.md')) return 'markdown';
      if (path.endsWith('.html')) return 'html';
      if (path.endsWith('.css')) return 'css';
      if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
      if (path.endsWith('.json')) return 'javascript'; // cm has no json lang, but js works fine
      return 'markdown';
    };

    // --- GitHub Logic ---
    useEffect(() => {
      // Attempt to auto-connect if a token exists in DB on load
      if (githubToken && !isGithubConnected) {
        handleConnectToGithub(githubToken);
      }
    }, [githubToken]);

    useEffect(() => {
      // Calculate changed files whenever the file system or initial state changes
      if (!isGithubConnected || !initialGithubFileSystem) {
        setChangedFiles([]);
        return;
      }

      const changes: FileChange[] = [];
      const allPaths = new Set([...Object.keys(initialGithubFileSystem), ...Object.keys(fileSystem)]);

      allPaths.forEach(path => {
        if (path.endsWith('/.placeholder')) return;
        
        const inInitial = path in initialGithubFileSystem;
        const inCurrent = path in fileSystem;

        if (inInitial && !inCurrent) {
            changes.push({ path, status: 'deleted' });
        } else if (!inInitial && inCurrent) {
            changes.push({ path, status: 'added' });
        } else if (inInitial && inCurrent && initialGithubFileSystem[path] !== fileSystem[path]) {
            changes.push({ path, status: 'modified' });
        }
      });
      setChangedFiles(changes);
    }, [fileSystem, initialGithubFileSystem, isGithubConnected]);

    const handleConnectToGithub = async (token: string) => {
      setIsLoadingFromGithub(true);
      setError('');
      try {
        const user = await githubService.connectToGithub(token);
        setGithubUser(user);
        setIsGithubConnected(true);
        const repos = await githubService.listRepos();
        setGithubRepos(repos);
        setChatHistory(prev => [...prev, {role: 'system', content: `Successfully connected to GitHub as ${user.login}.`}]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown GitHub connection error.');
        setGithubToken('');
      } finally {
        setIsLoadingFromGithub(false);
      }
    };
    
    const handleDisconnectFromGithub = () => {
        githubService.disconnectFromGithub();
        setIsGithubConnected(false);
        setGithubUser(null);
        setGithubRepos([]);
        setSelectedRepoFullName('');
        setRepoBranches([]);
        setSelectedBranchName('');
        setInitialGithubFileSystem(null);
        setChangedFiles([]);
        setChatHistory(prev => [...prev, {role: 'system', content: 'Disconnected from GitHub.'}]);
    };

    const handleRepoSelected = async (repoFullName: string) => {
        setSelectedRepoFullName(repoFullName);
        setSelectedBranchName('');
        setRepoBranches([]);
        if (!repoFullName) return;
        
        setIsLoadingFromGithub(true);
        try {
            const [owner, repo] = repoFullName.split('/');
            const branches = await githubService.listBranches(owner, repo);
            setRepoBranches(branches);
            if (branches.length > 0) {
              const defaultBranch = branches.find(b => b.name === 'main' || b.name === 'master') || branches[0];
              setSelectedBranchName(defaultBranch.name);
            }
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch branches.');
        } finally {
            setIsLoadingFromGithub(false);
        }
    };

    const handleLoadRepo = async () => {
        if (!selectedRepoFullName || !selectedBranchName) return;
        setIsLoadingFromGithub(true);
        setError('');
        try {
            const [owner, repo] = selectedRepoFullName.split('/');
            const branch = repoBranches.find(b => b.name === selectedBranchName);
            if (!branch) throw new Error("Selected branch not found.");

            const contents = await githubService.getRepoContents(owner, repo, branch.commit.sha);
            setFileSystem(contents);
            setInitialGithubFileSystem(contents);
            setFileSystemHistory([contents]);
            setCurrentHistoryIndex(0);
            
            const firstFile = Object.keys(contents).find(p => p.endsWith('index.html')) || Object.keys(contents)[0] || null;
            setOpenFiles(firstFile ? [firstFile] : []);
            setActiveFile(firstFile);
            setPreviewRoot('/');

            setChatHistory(prev => [...prev, {role: 'system', content: `Loaded repo ${selectedRepoFullName} on branch ${selectedBranchName}.`}]);
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Failed to load repository contents.');
        } finally {
            setIsLoadingFromGithub(false);
        }
    };

    const handleCommit = async (commitMessage: string) => {
        if (!selectedRepoFullName || !selectedBranchName || changedFiles.length === 0 || !initialGithubFileSystem) return;
        setIsLoadingFromGithub(true);
        setError('');
        try {
            const [owner, repo] = selectedRepoFullName.split('/');
            const commitUrl = await githubService.commitAndPush({
                owner,
                repo,
                branch: selectedBranchName,
                message: commitMessage,
                changes: changedFiles,
                currentFileSystem: fileSystem,
                initialFileSystem: initialGithubFileSystem
            });
            // After successful commit, the current state is the new "initial" state
            setInitialGithubFileSystem(fileSystem);
            setChangedFiles([]);
            setChatHistory(prev => [...prev, {role: 'system', content: `Successfully committed to ${selectedBranchName}. View commit: ${commitUrl}`}]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to commit changes.');
        } finally {
            setIsLoadingFromGithub(false);
        }
    }

    const handleTerminalCommand = async (command: string) => {
        setIsTerminalLoading(true);
        const newHistoryLine: TerminalLine = {
            id: uuidv4(),
            command,
            cwd: terminalCwd,
        };
        setTerminalHistory(prev => [...prev, newHistoryLine]);
        
        try {
            const result = await runCommandInTerminal(command, terminalCwd, fileSystem);
            
            // Update the last history line with the result
            setTerminalHistory(prev => prev.map(line => 
                line.id === newHistoryLine.id 
                    ? { ...line, stdout: result.stdout, stderr: result.stderr }
                    : line
            ));

            // Apply file system changes
            if (result.fileSystemChanges.length > 0) {
                const newFs = { ...fileSystem };
                result.fileSystemChanges.forEach(change => {
                    if (change.action === 'create' || change.action === 'update') {
                        newFs[change.path] = change.content || '';
                    } else if (change.action === 'delete') {
                        delete newFs[change.path];
                    }
                });
                setFileSystem(newFs);
                saveSnapshot(newFs);
            }
            
            // Update CWD
            setTerminalCwd(result.newCurrentDirectory);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
             setTerminalHistory(prev => prev.map(line => 
                line.id === newHistoryLine.id 
                    ? { ...line, stderr: errorMessage }
                    : line
            ));
        } finally {
            setIsTerminalLoading(false);
        }
    };
    
    if (isDBLoading) {
      return (
        <div className="flex flex-col h-full w-full items-center justify-center bg-[var(--dark-bg)] text-[var(--text-color)] gap-4">
          <GeminiIcon className="w-16 h-16 text-[var(--neon-purple)] animate-pulse" />
          <h2 className="text-2xl font-bold tracking-widest">Loading Your Sandbox...</h2>
        </div>
      )
    }
    
    let chatPanelDynamicHeight: number | string = chatPanelHeight;
    if (isChatMaximized) chatPanelDynamicHeight = '100%';
    if (isChatMinimized) chatPanelDynamicHeight = 50;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
        {editingElementInfo && (
            <InlineEditor
                elementHtml={editingElementInfo.html}
                position={editingElementInfo.position}
                onSave={(newCode) => {
                    handleUpdateElementCode(editingElementInfo.id, newCode);
                    setEditingElementInfo(null);
                }}
                onCancel={() => setEditingElementInfo(null)}
            />
        )}
        <OrbMenu
          onToggleFocusMode={onToggleFocusMode}
          onSave={async () => { 
              await dbService.saveState({ chatHistory, fileSystem, panelSizes, previewRoot, openFiles, activeFile, chatPanelHeight, githubToken, terminalHistory, terminalCwd });
              setLastSavedTimestamp(new Date());
              setChatHistory(prev => [...prev, {role: 'system', content: `Project state saved.`}]);
           }}
          lastSavedTimestamp={lastSavedTimestamp}
        />
        
        {/* Top Section: Chat Panel */}
        {!isFocusMode && (
          <div style={{ height: chatPanelDynamicHeight }} className="flex-shrink-0 flex flex-col bg-black/40 backdrop-blur-sm border-b-2 border-[var(--neon-purple)] overflow-hidden transition-height duration-300">
              {/* Chat Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-[var(--card-border)] bg-black/30">
                  <h2 className="text-lg font-bold text-[var(--neon-pink)] ml-2" style={{textShadow: '0 0 4px var(--neon-pink)'}}>Inference</h2>
                  <div className="flex items-center gap-2">
                      <button onClick={isChatMinimized ? () => setIsChatMinimized(false) : () => setIsChatMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-md text-[var(--neon-blue)]" title={isChatMinimized ? "Expand Chat" : "Collapse Chat"}>
                          {isChatMinimized ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                      </button>
                       <button onClick={isChatMaximized ? () => setIsChatMaximized(false) : () => setIsChatMaximized(true)} className="p-1.5 hover:bg-white/10 rounded-md text-[var(--neon-blue)]" title={isChatMaximized ? "Restore" : "Maximize Chat"}>
                          {isChatMaximized ? <MinimizeIcon className="h-5 w-5" /> : <MaximizeIcon className="h-5 w-5" />}
                      </button>
                  </div>
              </div>
               {!isChatMinimized && <>
                  <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto" aria-live="polite">
                      {chatHistory.map((msg, index) => <ChatMessageView key={index} message={msg} onApplyCode={handleApplyCode} />)}
                      {isLoading && (
                          <div className="flex justify-center my-4" role="status" aria-label={loadingMessage}>
                              <div className="flex items-center gap-2 text-[var(--neon-pink)]">
                                  <SpinnerIcon className="h-5 w-5 animate-spin" /><span>{loadingMessage}</span>
                              </div>
                          </div>
                      )}
                      {error && <p className="text-[var(--neon-pink)] text-sm mt-2" role="alert">{error}</p>}
                  </div>
                  <div className="flex-shrink-0 p-4 border-t border-[var(--card-border)] bg-black/30">
                      {(aiHint || isHintLoading) && (
                          <div className="mb-4 p-3 bg-black/30 border border-[var(--neon-green)] rounded-lg flex items-start gap-3">
                              <LightbulbIcon className="h-5 w-5 mt-1 text-[var(--neon-green)] flex-shrink-0" />
                              <div className="flex-grow">
                                  <p className="text-xs font-bold text-[var(--neon-green)] mb-1">AI Hint</p>
                                  {isHintLoading ? (
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <SpinnerIcon className="h-4 w-4 animate-spin" />
                                        <span>Generating next step...</span>
                                      </div>
                                  ) : (
                                      aiHint && <>
                                          <p className="text-sm text-gray-200">{aiHint}</p>
                                          <button
                                              onClick={() => {
                                                  setCliInput(aiHint);
                                                  setAiHint('');
                                              }}
                                              className="mt-2 text-sm bg-[var(--neon-green)] hover:brightness-125 text-black font-semibold py-1 px-3 rounded-md transition-all"
                                          >
                                              Use Hint
                                          </button>
                                      </>
                                  )}
                              </div>
                          </div>
                      )}
                      <form onSubmit={handleSubmit}>
                          <div className="relative">
                              <input type="text" value={cliInput} onChange={(e) => setCliInput(e.target.value)} placeholder="Send a message to the agent..." className="w-full p-3 pl-10 bg-black/30 border border-[var(--card-border)] rounded-full focus:ring-2 focus:ring-[var(--neon-purple)] focus:border-[var(--neon-purple)] focus:outline-none transition font-mono text-sm" disabled={isLoading} aria-label="Chat input" />
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neon-purple)] font-bold" aria-hidden="true">&gt;</span>
                              <button type="submit" disabled={isLoading || !cliInput} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--neon-pink)] hover:brightness-125 disabled:bg-[var(--neon-pink)]/50 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded-full transition-all">Send</button>
                          </div>
                      </form>
                  </div>
              </>}
          </div>
        )}

        {/* Horizontal Resizer */}
        {!isFocusMode && (
          <div 
            onMouseDown={handleChatResizeMouseDown}
            className={`flex-shrink-0 w-full h-2 bg-black/30 hover:bg-[var(--neon-blue)] cursor-row-resize transition-colors group ${isChatMaximized || isChatMinimized ? 'hidden':''}`}
            title="Resize chat panel"
          >
            <div className="h-full w-16 mx-auto bg-[var(--neon-purple)]/50 group-hover:bg-[var(--neon-blue)] rounded-full opacity-50 group-hover:opacity-100 transition-all"></div>
          </div>
        )}

        {/* Main 3-Column Content */}
        <div ref={containerRef} className={`flex-grow flex w-full overflow-hidden relative ${isChatMaximized || isChatMinimized ? 'hidden' : ''}`}>
            {/* Left Panel */}
            {!isLeftPanelCollapsed && (
                <div style={{ flexBasis: `${panelSizes[0]}%` }} className="flex flex-col gap-4 p-4 overflow-y-auto min-w-[200px] bg-black/20 backdrop-blur-sm border-r border-[var(--card-border)]">
                    <CollapsibleSection title="GitHub">
                      <GithubPanel
                        isConnected={isGithubConnected}
                        user={githubUser}
                        repos={githubRepos}
                        branches={repoBranches}
                        selectedRepo={selectedRepoFullName}
                        selectedBranch={selectedBranchName}
                        changedFiles={changedFiles}
                        isLoading={isLoadingFromGithub}
                        error={error}
                        onConnect={handleConnectToGithub}
                        onDisconnect={handleDisconnectFromGithub}
                        onRepoSelected={handleRepoSelected}
                        onBranchSelected={setSelectedBranchName}
                        onLoadRepo={handleLoadRepo}
                        onCommit={handleCommit}
                        initialToken={githubToken}
                        onTokenChange={setGithubToken}
                      />
                    </CollapsibleSection>
                    <CollapsibleSection title="File Explorer">
                        <FileExplorer 
                          fileSystem={fileSystem} 
                          activeFile={activeFile}
                          previewRoot={previewRoot}
                          onFileSelect={handleFileSelect}
                          onNewFile={handleNewFile}
                          onNewFolder={handleNewFolder}
                          onFileUpload={handleFileUpload}
                          onSetPreviewRoot={setPreviewRoot}
                          onDownloadProject={handleDownloadProject}
                          onRefresh={handleRefreshFileSystem}
                        />
                    </CollapsibleSection>
                    <CollapsibleSection title="Components">
                        <ComponentLibrary onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} />
                    </CollapsibleSection>
                    <CollapsibleSection title="Layout Templates">
                        <LayoutTemplates onLayoutSelect={handleLayoutSelect} />
                    </CollapsibleSection>
                </div>
            )}

            {/* Collapse Toggle */}
            <div onClick={toggleLeftPanel} className="flex-shrink-0 bg-black/20 hover:bg-[var(--neon-purple)] cursor-pointer flex items-center justify-center w-5 transition-all duration-300 group">
                {isLeftPanelCollapsed ? <PanelRightIcon className="h-5 w-5 text-[var(--neon-purple)] group-hover:text-black transition-colors"/> : <PanelLeftIcon className="h-5 w-5 text-[var(--neon-purple)] group-hover:text-black transition-colors"/>}
            </div>

            <div onMouseDown={(e) => handleMouseDown(0, e)} className="resize-handle" />

            {/* Center Panel: Tabbed Editor */}
            <div style={{ flexBasis: `${panelSizes[1]}%` }} className="flex flex-col bg-[var(--card-bg)] backdrop-blur-sm rounded-lg border border-[var(--card-border)] overflow-hidden min-w-[300px]">
                {/* Tab Bar */}
                <div className="flex-shrink-0 flex border-b border-[var(--card-border)] bg-black/30 overflow-x-auto">
                    {/* Editor Tab */}
                    <button onClick={() => setActiveTab('editor')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-r border-[var(--card-border)] whitespace-nowrap ${activeTab === 'editor' ? 'bg-[var(--neon-purple)] text-black' : 'text-gray-300 hover:bg-black/40'}`}>
                        <CodeIcon className="h-4 w-4" />
                        <span>Editor</span>
                    </button>
                    {/* Terminal Tab */}
                    <button onClick={() => setActiveTab('terminal')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-r border-[var(--card-border)] whitespace-nowrap ${activeTab === 'terminal' ? 'bg-[var(--neon-purple)] text-black' : 'text-gray-300 hover:bg-black/40'}`}>
                        <TerminalIcon className="h-4 w-4" />
                        <span>Terminal</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-hidden">
                    {activeTab === 'editor' && (
                        <div className="flex flex-col h-full bg-transparent">
                             {/* File Tabs */}
                            <div className="flex-shrink-0 flex border-b border-[var(--card-border)] bg-black/20 overflow-x-auto">
                                {openFiles.map(path => (
                                    <button 
                                      key={path} 
                                      onClick={() => handleFileSelect(path)} 
                                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-r border-[var(--card-border)] whitespace-nowrap ${activeFile === path ? 'bg-black/30' : 'text-gray-400 hover:bg-black/40'}`}
                                      title={path}
                                    >
                                      <DocumentTextIcon className="h-4 w-4 flex-shrink-0" />
                                      <span className="truncate max-w-[150px]">{path.split('/').pop()}</span>
                                      <span onClick={(e) => handleCloseFile(path, e)} className="p-1 rounded-full hover:bg-black/20">
                                        <XIcon className="h-3 w-3" />
                                      </span>
                                    </button>
                                ))}
                            </div>
                          {activeFile && fileSystem && !activeFile.endsWith('/') && fileSystem[activeFile] !== undefined ? (
                              <>
                                <div className="flex-shrink-0 p-2 border-b border-[var(--card-border)] bg-black/20">
                                  <div className="flex items-center gap-2">
                                      <input 
                                          type="text"
                                          value={refineInstruction}
                                          onChange={(e) => setRefineInstruction(e.target.value)}
                                          placeholder={`Refine ${activeFile.split('/').pop()}... (e.g., 'add a confirmation step')`}
                                          className="w-full p-2 bg-black/30 border border-[var(--card-border)] rounded-md focus:ring-2 focus:ring-[var(--neon-purple)] focus:border-[var(--neon-purple)] focus:outline-none transition font-mono text-sm"
                                          disabled={isRefining || !activeFile || activeFile.endsWith('.md') || activeFile.endsWith('.json')}
                                          aria-label="Code refinement instruction"
                                      />
                                      <button
                                          onClick={handleRefineCode}
                                          disabled={isRefining || !refineInstruction || !activeFile || activeFile.endsWith('.md') || activeFile.endsWith('.json')}
                                          className="flex items-center gap-2 bg-[var(--neon-purple)] hover:brightness-125 disabled:bg-[var(--neon-purple)]/50 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded-md transition-all whitespace-nowrap"
                                          aria-label="Refine code with AI"
                                      >
                                        {isRefining ? <SpinnerIcon className="h-5 w-5 animate-spin"/> : <MagicWandIcon className="h-5 w-5"/>}
                                        <span>Refine</span>
                                      </button>
                                  </div>
                                </div>
                                <div className="flex-grow overflow-auto">
                                    <CodeEditor 
                                        value={fileSystem[activeFile] || ''}
                                        language={languageForPreview(activeFile)} 
                                        onChange={handleCodeChange}
                                        onSave={(newContent) => saveSnapshot({...fileSystem, [activeFile]: newContent})}
                                    />
                                </div>
                              </>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>{!activeFile ? 'No file selected. Open a file from the explorer.' : 'File content not available.'}</p>
                            </div>
                          )}
                        </div>
                    )}
                    {activeTab === 'terminal' && (
                        <Terminal 
                           history={terminalHistory}
                           cwd={terminalCwd}
                           onSubmitCommand={handleTerminalCommand}
                           isLoading={isTerminalLoading}
                        />
                    )}
                </div>
            </div>

            <div onMouseDown={(e) => handleMouseDown(1, e)} className="resize-handle" />

            {/* Right Panel */}
            <div style={{ flexBasis: `${panelSizes[2]}%` }} className="flex flex-col h-full min-w-[300px]">
                <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-lg border border-[var(--card-border)] h-full relative overflow-hidden">
                    {activeFile && fileSystem && activeFile.endsWith('.md') && activeTab === 'editor' ? (
                         <MarkdownPreview markdown={fileSystem[activeFile] || ''} />
                    ) : (
                        <>
                         <iframe ref={iframeRef} srcDoc={srcDoc} title="Live code preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" className="w-full h-full bg-gray-800 rounded-md" />
                         <div
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={`absolute inset-0 transition-all duration-300 rounded-lg ${isDragging ? 'border-4 border-dashed border-[var(--neon-pink)] bg-black/40 backdrop-blur-sm flex items-center justify-center text-xl font-bold' : 'pointer-events-none'}`}
                          >
                             {isDragging && <span>Drop to Add Component</span>}
                         </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default OrchestratorPanel;