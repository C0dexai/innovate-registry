





import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { FileType } from '../types';
import type { FileNode, CodeAnalysis, BuildStepMessage, InstallationRecommendationMessage } from '../types';

// This file now uses the live @google/genai SDK.

const spaFileStructure: Omit<FileNode, 'id'>[] = [
    {
        name: 'index.html', type: FileType.File, path: '/index.html',
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },
    {
        name: 'vite.config.ts', type: FileType.File, path: '/vite.config.ts',
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`
    },
    {
        name: 'tsconfig.json', type: FileType.File, path: '/tsconfig.json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`
    },
    {
        name: 'tsconfig.node.json', type: FileType.File, path: '/tsconfig.node.json',
        content: `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`
    },
    {
        name: 'tailwind.config.js', type: FileType.File, path: '/tailwind.config.js',
        content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
    },
    {
        name: 'postcss.config.js', type: FileType.File, path: '/postcss.config.js',
        content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    },
    {
        name: 'main.tsx', type: FileType.File, path: '/src/main.tsx',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
    },
    {
        name: 'App.tsx', type: FileType.File, path: '/src/App.tsx',
        content: `function App() {
  return (
    <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Vite + React + Tailwind</h1>
      <p className="mt-4">Edit <code className="bg-slate-900 p-1 rounded">src/App.tsx</code> and save to test HMR</p>
    </div>
  )
}

export default App`
    },
    {
        name: 'index.css', type: FileType.File, path: '/src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
    }
];

const handleApiResponse = (response: GenerateContentResponse): string => {
    try {
        return response.text;
    } catch (e) {
        console.error("Error extracting text from response:", e, response);
        return "Error: Could not parse response from Gemini.";
    }
};

const generateSimpleHtmlPage = (prompt: string): { text: string, files: FileNode[] } => {
    const nameMatch = prompt.match(/named "([^"]+)"|named '([^']+)'|create html (\S+)/);
    let pageName = nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : 'gemini-page';
    pageName = pageName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

    const folderName = `${pageName}-folder`;
    const filePath = `/${folderName}/${pageName}.html`;

    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName}</title>
    <style>
        :root {
            --bg-color: #1a1a1a;
            --text-color: #f0f0f0;
            --primary-color: #00aaff;
            --card-bg: #2a2a2a;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            padding: 2rem 3rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #333;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: var(--primary-color);
            font-size: 2.5rem;
        }
        p {
            font-size: 1.2rem;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to ${pageName}</h1>
        <p>This is a modern, dark-themed HTML page generated by Gemini.</p>
    </div>
</body>
</html>`;

    const file: FileNode = {
        id: `file-${filePath.replace(/\//g, '_')}-${Date.now()}`,
        name: `${pageName}.html`,
        type: FileType.File,
        path: filePath,
        content: content,
    };

    return {
        text: `I've created the simple HTML page "${pageName}.html" inside a folder named "${folderName}".`,
        files: [file]
    };
};

export const geminiService = {
  emulateServerSideScript: async (code: string, language: string, apiKey: string): Promise<string> => {
    if (!apiKey) return 'Error: Gemini API Key not set.';
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are a server emulator. Given the following ${language} script, provide the raw text or HTML output that it would generate. 
Do not provide any explanation or code fences. Only the direct output.
If the script outputs JSON, provide only the raw JSON.

Script:
\`\`\`${language}
${code}
\`\`\`
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0, // Be deterministic
            }
        });
        return handleApiResponse(response).trim();
    } catch (error) {
        console.error("Failed to emulate server script:", error);
        return `Error emulating script: ${(error as Error).message}`;
    }
  },

  generateContent: async (prompt: string, apiKey: string, attachment?: { data: string; mimeType: string }): Promise<{ text: string; files?: FileNode[] }> => {
    if (!apiKey) return { text: "Error: Gemini API key is not set. Please set it in the Integrations tab." };

    const ai = new GoogleGenAI({ apiKey });
    const lowerCasePrompt = prompt.toLowerCase();
    
    // Special handling for SPA creation is now done in orchestrationService
    // Let's add a handler for a simple page
    if (lowerCasePrompt.includes("create a simple html page") || lowerCasePrompt.startsWith("gemini create html")) {
        return generateSimpleHtmlPage(prompt);
    }
    
    if (lowerCasePrompt.includes("yes, proceed with spa creation")) {
        const files: FileNode[] = spaFileStructure.map(f => ({ ...f, id: `file-${f.name}-${Date.now()}` }));
        return {
            text: "Great! I've generated the files for your new React SPA. You can see the file structure in the Explorer. I've opened `src/App.tsx` for you to start with.",
            files: files,
        };
    }

    try {
        const parts = [{ text: prompt }];

        if (attachment) {
            // Gemini is multimodal, so we can send images directly.
            // For other file types, we'll include their content as text for context.
            if (attachment.mimeType.startsWith('image/')) {
                 const imagePart = {
                    inlineData: {
                        mimeType: attachment.mimeType,
                        data: attachment.data,
                    },
                };
                // Add image part before the text prompt
                parts.unshift(imagePart as any);
            } else {
                // For non-image files, append their content to the prompt.
                 parts.push({ text: `\n\n--- Attached File Content ---\n${atob(attachment.data)}\n--- End Attached File ---` });
            }
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: "user", parts: parts }],
        });

        return { text: handleApiResponse(response) };

    } catch (error) {
        console.error("Gemini API call failed:", error);
        return { text: `Error calling Gemini API: ${(error as Error).message}` };
    }
  },
  
  generateNextBuildStep: async (initialPrompt: string, currentFiles: FileNode, apiKey: string): Promise<BuildStepMessage | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    const simplifyFileTree = (node: FileNode, depth = 0): string => {
        const indent = '  '.repeat(depth);
        let output = `${indent}${node.name}${node.type === FileType.Directory ? '/' : ''}\n`;
        if (node.children) {
            node.children.forEach(child => {
                output += simplifyFileTree(child, depth + 1);
            });
        }
        return output;
    };
    
    const fileContext = simplifyFileTree(currentFiles);

    const prompt = `
You are an expert web developer building a Single Page Application (SPA) step-by-step in a simulated IDE.
The user's initial high-level goal is: "${initialPrompt}".

The current file structure is:
\`\`\`
${fileContext}
\`\`\`

Based on the current project state, determine the single next logical step to progress towards the user's goal.
Examples:
- If the project is empty, the first step is to create the main 'index.html' file.
- After 'index.html' exists, the next step might be to create 'style.css'.
- After CSS, create 'script.js', and so on.

Your response must be ONLY a valid JSON object with the following structure:
{ 
  "title": "string (e.g., 'Step 1: HTML Boilerplate')", 
  "description": "string (A brief explanation of this step)", 
  "codeBlocks": [{ 
    "language": "html" | "css" | "javascript" | "typescript" | "markdown" | "yaml" | "json", 
    "code": "string (The full code for the file)", 
    "filePath": "/path/to/file.ext" 
  }]
}

IMPORTANT:
- Each step should be small and atomic. Only create or modify one or two files per step.
- Ensure 'filePath' is a full, absolute path from the root (e.g., '/spa/project-name/index.html').
- The 'code' property must contain the complete code for the file, not just a diff.
- Do not add any explanation, markdown, or anything else outside the JSON object.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              codeBlocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    language: { type: Type.STRING },
                    code: { type: Type.STRING },
                    filePath: { type: Type.STRING },
                  },
                  required: ['language', 'code', 'filePath']
                }
              }
            },
            required: ['title', 'description', 'codeBlocks']
          }
        }
      });
      
      const jsonText = handleApiResponse(response).trim();
      const buildStepData = JSON.parse(jsonText);

      const newBuildStep: BuildStepMessage = {
          id: `build-step-${Date.now()}`,
          type: 'build_step',
          title: buildStepData.title,
          description: buildStepData.description,
          status: 'pending',
          codeBlocks: buildStepData.codeBlocks,
      };

      return newBuildStep;

    } catch (error) {
      console.error("Failed to generate build step:", error);
      return null;
    }
  },

  generateImages: async (prompt: string, apiKey: string): Promise<string[] | null> => {
      if (!apiKey) {
          console.error("Image generation failed: Gemini API key is not set.");
          return null;
      }
      const ai = new GoogleGenAI({ apiKey });

      try {
          const response = await ai.models.generateImages({
              model: 'imagen-3.0-generate-002',
              prompt: prompt,
              config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: '1:1',
              },
          });

          if (response.generatedImages && response.generatedImages.length > 0) {
              return response.generatedImages.map(img => img.image.imageBytes);
          }
          return null;

      } catch (error) {
          console.error("Image generation failed:", error);
          return null;
      }
  },
  
  generateSuggestions: async (prompt: string, responseText: string, apiKey: string): Promise<string[]> => {
    if (!apiKey) return [];
     const ai = new GoogleGenAI({ apiKey });
     try {
         const suggestionPrompt = `Based on the user's last request in a web dev IDE ("${prompt}") and the AI's response ("${responseText.substring(0, 300)}..."), suggest 3 brief, actionable follow-up actions. The user might want to refine the code, ask for an explanation, or request a new component. Return ONLY a valid JSON object with a "suggestions" key containing an array of strings, like {"suggestions": ["Explain this code", "Add a button", "Convert to a React component"]}. Do not include any other text or markdown.`;
         
         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: [{role: "user", parts: [{text: suggestionPrompt}]}],
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['suggestions']
                }
             }
         });
         
         const jsonText = handleApiResponse(response).trim();
         const result = JSON.parse(jsonText);
         return Array.isArray(result.suggestions) ? result.suggestions : [];

     } catch(error) {
         console.error("Failed to generate suggestions:", error);
         return []; // Return empty array on failure
     }
  },

  validateKey: async (key: string): Promise<boolean> => {
    if (!key) return false;
    const ai = new GoogleGenAI({ apiKey: key });
    try {
        // A lightweight call to check if the key is valid.
        await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: "hi", config: { maxOutputTokens: 5, thinkingConfig: {thinkingBudget: 0} }});
        return true;
    } catch (error) {
        console.error("Gemini key validation failed:", error);
        return false;
    }
  },

  analyzeCode: async (fileName: string, fileContent: string, apiKey: string): Promise<CodeAnalysis | null> => {
    if (!apiKey || !fileContent) return null;
    const ai = new GoogleGenAI({ apiKey });
    try {
        const prompt = `As an expert code reviewer, analyze the following code from the file named "${fileName}". 
Provide a concise summary of its purpose, a deeper analysis of its structure and logic, and three actionable suggestions for improvement (e.g., refactoring, adding features, fixing bugs).
Return ONLY a valid JSON object with the following structure: { "summary": "string", "analysis": "string", "suggestions": ["string", "string", "string"] }. Do not include any other text, markdown, or explanation.

Code:
\`\`\`
${fileContent}
\`\`\`
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        analysis: { type: Type.STRING },
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['summary', 'analysis', 'suggestions']
                }
            }
        });
        const jsonText = handleApiResponse(response).trim();
        const analysisResult = JSON.parse(jsonText);
        return analysisResult as CodeAnalysis;
    } catch (error) {
        console.error("Failed to analyze code:", error);
        return null;
    }
  },

  applySuggestion: async (code: string, suggestion: string, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("Gemini API key is not set.");
    const ai = new GoogleGenAI({ apiKey });
    try {
        const prompt = `
A user wants to apply a suggestion to their code. 
Apply the following suggestion to the provided code block and return ONLY the complete, updated code. Do not add any explanation, markdown, or anything else.

Suggestion: "${suggestion}"

Original Code:
\`\`\`
${code}
\`\`\`
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        
        let updatedCode = handleApiResponse(response).trim();
        const codeBlockRegex = /```(?:\w*\n)?([\s\S]+)```/m;
        const match = updatedCode.match(codeBlockRegex);
        if (match && match[1]) {
            updatedCode = match[1].trim();
        }

        return updatedCode;
    } catch (error) {
        console.error("Failed to apply suggestion:", error);
        throw new Error(`Gemini API Error: ${(error as Error).message}`);
    }
  },
  
  getCommandSuggestion: async (currentInput: string, cli: 'codex' | 'gemini', apiKey: string): Promise<string> => {
    if (!apiKey || !currentInput) return '';
    const ai = new GoogleGenAI({ apiKey });
    const codexHelp = `CODEX Commands:
- container list
- container create --name "<name>"
- container delete --id <id>
- container upload --id <id> --file <path>
- /help`;
    const geminiHelp = `GEMINI Commands:
- analyze <filepath>
- create html <name>
- ls <path>
- cat <filepath>
- rm [-r] <path>
- touch <filepath>
- echo "content" > <filepath> (overwrite)
- echo "content" >> <filepath> (append)
- mv <source> <destination>
- cp <source> <destination>
- emulate <filepath.php|filepath.py>
- /help`;

    const prompt = `You are an expert CLI auto-complete engine. A user is typing a command into the "${cli}" terminal. 
    Based on their input, provide a helpful suggestion or completion.
    The full command list for this CLI is:
    ---
    ${cli === 'codex' ? codexHelp : geminiHelp}
    ---
    The user has typed: "${currentInput}"

    Your response should be a short, helpful hint. For example, if they type "codex container cre", you could suggest "--name <name>". If they type "gemini analyze", suggest "<filepath>". If the command is complete, suggest an optional flag or just return an empty string.
    Return ONLY the suggestion text, with no explanation.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { maxOutputTokens: 20, thinkingConfig: { thinkingBudget: 0 } }
      });
      return handleApiResponse(response).trim().replace(/["']/g, ''); // Clean quotes
    } catch (error) {
      console.error("Suggestion generation failed:", error);
      return '';
    }
  },

  generateInstallationRecommendation: async (prompt: string, apiKey: string): Promise<InstallationRecommendationMessage | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an expert system administrator who recommends software installations inside a development container. 
The user wants to: "${prompt}".
Based on this, recommend a simple, common software installation. For now, only recommend an Express.js server if they ask for a web server, backend, or API.
If the request is not for a web server, respond with a JSON object where the title is "Recommendation Not Available".

If recommending Express, your response must be ONLY a valid JSON object with the following structure:
{ 
  "title": "Express.js Server", 
  "description": "A simple Node.js web server using the Express framework. This will create a package.json and a server.js file.", 
  "codeBlocks": [
    { 
      "language": "json", 
      "code": "{\\"name\\": \\"express-server\\", ...}", 
      "filePath": "package.json" 
    },
    { 
      "language": "javascript", 
      "code": "const express = require('express'); ...", 
      "filePath": "server.js" 
    }
  ]
}

The 'code' properties must be valid, complete code, correctly escaped for a JSON string.
Do not add any explanation, markdown, or anything else outside the JSON object.`;

    const expressPackageJson = {
      name: "express-server-recipe",
      version: "1.0.0",
      description: "A simple Express server",
      main: "server.js",
      scripts: {
        start: "node server.js"
      },
      dependencies: {
        express: "^4.19.2"
      }
    };

    const expressServerJs = `const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from your Express server running in a CODEX container!');
});

app.listen(port, () => {
  console.log(\`Express server listening on port \${port}\`);
});`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              codeBlocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    language: { type: Type.STRING },
                    code: { type: Type.STRING },
                    filePath: { type: Type.STRING },
                  },
                  required: ['language', 'code', 'filePath']
                }
              }
            },
            required: ['title', 'description', 'codeBlocks']
          }
        }
      });

      const jsonText = handleApiResponse(response).trim();
      const recommendationData = JSON.parse(jsonText);

      if (recommendationData.title !== "Express.js Server") {
          return {
              id: `install-rec-${Date.now()}`,
              type: 'installation_recommendation',
              title: 'Recommendation Not Available',
              description: 'Sorry, I can only recommend setting up an Express.js web server at this time.',
              status: 'pending',
              codeBlocks: []
          }
      }
      
      // Override with deterministic content for reliability
      recommendationData.codeBlocks = [
          { language: 'json', code: JSON.stringify(expressPackageJson, null, 2), filePath: 'package.json' },
          { language: 'javascript', code: expressServerJs, filePath: 'server.js' }
      ];

      const newRecommendation: InstallationRecommendationMessage = {
          id: `install-rec-${Date.now()}`,
          type: 'installation_recommendation',
          title: recommendationData.title,
          description: recommendationData.description,
          status: 'pending',
          codeBlocks: recommendationData.codeBlocks,
      };

      return newRecommendation;

    } catch (error) {
      console.error("Failed to generate installation recommendation:", error);
      return null;
    }
  },

  generatePageHtml: async (description: string, apiKey: string): Promise<string> => {
    if (!apiKey) return '<p>Error: Gemini API Key not set.</p>';
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are a web simulator. Based on the user's action, generate a single, self-contained HTML file that represents the resulting web page.
      - The HTML should be simple and focus on structure and content.
      - Use inline CSS for a basic, clean, modern dark mode theme.
      - Ensure interactive elements like inputs, buttons, and links have clear 'id' attributes for the agent to identify.
      - DO NOT include any <script> tags or external file links.
      - The entire output should be only the HTML code, with no explanations, markdown, or code fences.

      Scenario: "${description}"
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        
        let html = handleApiResponse(response).trim();
        // Clean up potential markdown code fences if the model adds them
        const codeBlockRegex = /```(?:html\n)?([\s\S]+)```/m;
        const match = html.match(codeBlockRegex);
        if (match && match[1]) {
            html = match[1].trim();
        }
        return html;
    } catch (error) {
        console.error("Failed to generate page HTML:", error);
        return `<p>Error generating page: ${(error as Error).message}</p>`;
    }
  },

  generatePreviewForCode: async (code: string, apiKey: string): Promise<string> => {
    if (!apiKey) return '<p>Error: Gemini API Key not set.</p>';
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are an expert at creating visual HTML previews from server-side code.
      Analyze the provided Node.js server code (likely using Express). 
      Generate a single, self-contained HTML file that visually represents what the server's main '/' route would render.
      - The HTML should be simple, clean, and use inline CSS for a modern dark mode theme.
      - DO NOT include any <script> tags or external file links.
      - Focus on the visual output, not a line-by-line code conversion.
      - The entire output should be only the HTML code, with no explanations, markdown, or code fences.

      Server Code:
      \`\`\`javascript
      ${code}
      \`\`\`
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        
        let html = handleApiResponse(response).trim();
        const codeBlockRegex = /```(?:html\n)?([\s\S]+)```/m;
        const match = html.match(codeBlockRegex);
        if (match && match[1]) {
            html = match[1].trim();
        }
        return html;
    } catch (error) {
        console.error("Failed to generate code preview HTML:", error);
        return `<p>Error generating preview: ${(error as Error).message}</p>`;
    }
  },

  debugCode: async (logs: string[], code: string, apiKey: string): Promise<string> => {
    if (!apiKey) return 'Error: Gemini API key not set.';
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are an expert AI software engineer. The user's Node.js application failed to run.
Analyze the error logs and the corresponding source code.
Provide a clear, concise explanation of the bug and a step-by-step guide to fix it.
Your response should be formatted as helpful advice in a chat window.

Error Logs:
\`\`\`
${logs.join('\n')}
\`\`\`

Source Code (server.js):
\`\`\`javascript
${code}
\`\`\`
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("Failed to debug code:", error);
        return `Error debugging code: ${(error as Error).message}`;
    }
  },
};