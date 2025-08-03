import { GoogleGenAI, Type } from "@google/genai";
import type { FileSystemState, ChatMessage, TerminalExecutionResult } from '../types';

function formatFileSystemForPrompt(fileSystem: FileSystemState, previewRoot: string | null): string {
    const fileEntries = Object.entries(fileSystem)
        .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
        .map(([path, content]) => {
            const language = path.split('.').pop() || '';
            return `
---
File: ${path}
\`\`\`${language}
${content}
\`\`\`
`;
        });
    
    const previewContext = previewRoot ? `The user is currently previewing the project from the "${previewRoot}" directory.` : 'The user is currently previewing the root directory.';

    return `Here is the current state of all files in the project. Use this as context for the user's request.
${previewContext}
${fileEntries.join('')}
---
`;
}

export async function chatWithAgent(history: ChatMessage[], fileSystem: FileSystemState, previewRoot: string | null): Promise<{ text: string, explanation: string, code?: { path: string, content: string }[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const model = "gemini-2.5-flash";

    const systemInstruction = `You are an expert web developer AI agent and a helpful guide. Your primary goal is to help the user build and design web pages by modifying their file system.

## Core Capabilities & Context
The file system includes a special directory: \`/innovate\`.

### The /innovate Directory
The \`/innovate\` directory is a central template registry for bootstrapping projects. It contains starter templates for various environments (Node, React, Python, etc.).

- **/innovate/manifest.json**: A machine-readable index of all available templates. Read this file to discover what templates are available, their paths, and their purpose.
- **/innovate/containers/**: This folder holds the source code for all templates.
- **/innovate/templates/**: This folder may contain pre-zipped versions of the templates.

**Your Task with /innovate:**
When a user asks to create a new project (e.g., "create a new react app"), you should:
1.  First, consult \`/innovate/manifest.json\` to find a suitable template.
2.  Read the files from the template's path (e.g., \`/innovate/containers/react-vanilla/\`).
3.  Copy those files to the new destination directory the user specified.

### General Instructions
Ensure that text colors have sufficient contrast against their background colors for readability. Default to dark text on light backgrounds unless a dark theme is specifically requested.
When the user asks for a code change, you must act as a true collaborator.
1. First, provide a brief, friendly, conversational response in the 'text' field.
2. Then, provide a detailed explanation in the 'explanation' field. This should be formatted with markdown. Explain what you've changed, why, and offer practical suggestions for what the user could do next. Guide them on best practices and code style.
3. Finally, if you are generating or modifying code, include the complete, full file content for all modified files in the 'code' property. The 'code' property must be an array of objects, where each object has a 'path' (string) and 'content' (string) key. Do not just return diffs.

Your response MUST be a JSON object that adheres to the provided schema.

${formatFileSystemForPrompt(fileSystem, previewRoot)}
`;

    const contents = history
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

    try {
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: {
                            type: Type.STRING,
                            description: 'A brief, friendly, conversational reply to the user. Keep it short.'
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "A detailed explanation of any code changes, including what was done, why it was done, and suggestions for the user's next steps. Use markdown for formatting (e.g., lists, bold text)."
                        },
                        code: {
                            type: Type.ARRAY,
                            description: "An array of objects, where each object has a 'path' and 'content' key. Represents all files modified by the agent.",
                            nullable: true,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    path: { type: Type.STRING },
                                    content: { type: Type.STRING }
                                },
                                required: ['path', 'content']
                            }
                        }
                    },
                    required: ['text', 'explanation']
                }
            },
        });

        const responseText = response.text.trim();
        const parsedJson = JSON.parse(responseText);

        if (parsedJson && parsedJson.text && parsedJson.explanation) {
             const { text, explanation, code } = parsedJson;
             if (code && Array.isArray(code)) {
                return { text, explanation, code };
             }
             return { text, explanation };
        }
        
        console.error("Gemini API returned unexpected JSON structure:", responseText);
        throw new Error("Received an invalid response from the AI agent.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                 throw new Error(`Invalid Gemini API key. Please ensure it is correctly configured in the environment.`);
            }
            throw new Error(`Gemini API request failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}

export async function runCommandInTerminal(
    command: string,
    cwd: string,
    fileSystem: FileSystemState
): Promise<TerminalExecutionResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const model = "gemini-2.5-flash";

    const systemInstruction = `You are a simulated Linux terminal environment for a web development sandbox.
Your task is to receive a user's command, the current working directory (cwd), and the full file system, then simulate the command's execution and return a structured JSON response.

**Core Rules:**
1.  **Path Resolution:** All relative paths in commands (e.g., \`cat file.js\`) must be resolved relative to the provided \`cwd\`. The root is always \`/\`.
2.  **File System Context:** Use the provided file system to inform your output. For \`ls\`, list the files in \`cwd\`. For \`cat\`, output the content of the specified file.
3.  **Command Simulation:**
    *   **\`node <script.js>\`**: Read the content of \`<script.js>\`. Simulate its execution by returning any \`console.log\` statements as \`stdout\`. Do NOT actually execute the code.
    *   **\`npm install\`**: Read \`package.json\` from the \`cwd\`. Simulate the installation process by listing the dependencies and printing a success message to \`stdout\`.
    *   **File Operations (\`touch\`, \`mkdir\`, \`rm\`, \`mv\`)**: These commands MUST result in changes to the \`fileSystemChanges\` array.
    *   **\`cd <dir>\`**: Update the \`newCurrentDirectory\`. Do not produce \`stdout\` unless there's an error (e.g., directory not found). Handle \`cd ..\` and absolute/relative paths correctly.
4.  **JSON Response:** Your response MUST be a single, valid JSON object that adheres exactly to the provided schema. Do not include any other text or markdown.

**File System Changes Array (\`fileSystemChanges\`):**
This array must contain objects describing every file system mutation.
-   \`{ "action": "create", "path": "/path/to/new_file.txt", "content": "initial content" }\`
-   \`{ "action": "update", "path": "/path/to/existing_file.txt", "content": "new full content" }\`
-   \`{ "action": "delete", "path": "/path/to/deleted_file.txt" }\`
-   For \`mkdir\`, create a placeholder file: \`{ "action": "create", "path": "/new_dir/.placeholder", "content": "" }\`

${formatFileSystemForPrompt(fileSystem, null)}
`;

    const userPrompt = `CWD: ${cwd}\nCOMMAND: ${command}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        stdout: { type: Type.STRING, description: "The standard output of the command. For 'ls', this would be the file list. For 'cat', the file content." },
                        stderr: { type: Type.STRING, description: "The standard error output. Use for errors like 'file not found'." },
                        newCurrentDirectory: { type: Type.STRING, description: "The updated current working directory after the command (especially 'cd')." },
                        fileSystemChanges: {
                            type: Type.ARRAY,
                            description: "An array of objects representing file system mutations.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    action: { type: Type.STRING, enum: ['create', 'update', 'delete'] },
                                    path: { type: Type.STRING, description: "Absolute path from root, e.g., /src/index.js" },
                                    content: { type: Type.STRING, nullable: true, description: "Full file content for 'create' or 'update'." }
                                },
                                required: ['action', 'path']
                            }
                        }
                    },
                    required: ['stdout', 'stderr', 'newCurrentDirectory', 'fileSystemChanges']
                }
            }
        });

        const responseText = response.text.trim();
        const parsedJson = JSON.parse(responseText);
        return parsedJson as TerminalExecutionResult;

    } catch (error) {
        console.error("Error in terminal command execution:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return {
            stdout: '',
            stderr: `Terminal Agent Error: ${errorMessage}`,
            newCurrentDirectory: cwd,
            fileSystemChanges: []
        };
    }
}

export async function getAiHint(history: ChatMessage[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const model = "gemini-2.5-flash";

    const systemInstruction = `You are a helpful AI assistant. The user is in a web development sandbox. Based on the last few messages of the conversation, suggest one single, concise, and practical next step for the user.
- The suggestion should be a prompt the user can give to an AI.
- Return ONLY the suggested prompt text.
- Do NOT include any preamble, explanation, or markdown formatting.
- Be creative and helpful. For example, if the user just added a button, suggest styling it or adding a click handler.
- Keep the suggestion under 15 words.`;

    // Take the last 4 messages for context, it's enough for a hint.
    const lastMessages = history.slice(-4);
    
    const contents = lastMessages
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map(msg => ({
            role: msg.role,
            // Use the main content for hints, not the detailed explanation
            parts: [{ text: msg.content }],
        }));

    try {
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
                temperature: 0.8, // Higher temperature for more creative hints
                stopSequences: ['\n'] // Stop at the first newline to keep it concise
            },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error fetching AI hint:", error);
        // Fail silently, a missing hint is not a critical error.
        return '';
    }
}


export async function refineCodeWithAgent(code: string, language: string, instruction: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const model = "gemini-2.5-flash";

    const systemInstruction = `You are a world-class software engineer. Your task is to modify the user's code based on their instruction.
You MUST only return the complete, raw code for the specified language.
Do NOT include any markdown formatting like \`\`\`${language} or \`\`\`.
Do NOT include any explanations, comments about your changes, or any other text that is not valid code.
Your output will be directly placed into a code editor, so it must be perfect.
`;

    const userPrompt = `Instruction: "${instruction}"

Language: ${language}

Current Code:
---
${code}
---
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
                systemInstruction,
                temperature: 0.2, // Lower temperature for more deterministic code output
            }
        });

        const refinedCode = response.text.trim();
        return refinedCode;

    } catch (error) {
        console.error("Error calling Gemini API for code refinement:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                 throw new Error(`Invalid Gemini API key. Please ensure it is correctly configured in the environment.`);
            }
            throw new Error(`Gemini API request failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}