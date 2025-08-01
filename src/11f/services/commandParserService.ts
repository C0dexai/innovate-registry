import { GoogleGenAI, Type } from "@google/genai";
import type { ParsedCommand } from '../types';

const commandSchema = {
  type: Type.OBJECT,
  properties: {
    command: {
      type: Type.STRING,
      description: "The command to execute. Must be one of: 'create_file', 'edit_file', 'delete_file', 'list_files', 'analyze_file', 'commit_to_github'."
    },
    params: {
      type: Type.OBJECT,
      description: "An object containing the parameters for the command.",
      properties: {
        filePath: { type: Type.STRING, description: "The full absolute path for the file operation (e.g., /home/user/file.txt)." },
        content: { type: Type.STRING, description: "The content for create_file or edit_file." },
        repo: { type: Type.STRING, description: "The repository name for commit_to_github (e.g., owner/repo)." },
        message: { type: Type.STRING, description: "The commit message for commit_to_github." },
        path: { type: Type.STRING, description: "The directory path for list_files." },
      },
    },
  },
  required: ['command', 'params'],
};

export const commandParserService = {
  parseTextForCommand: async (text: string, apiKey: string): Promise<ParsedCommand | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
You are an AI command parser for a web development IDE. Your task is to analyze the user's text and determine if it contains an executable command.
If a command is found, you must return a JSON object matching the defined schema. If no command is found, or if the text is just conversational, return an empty JSON object {}.

Available commands and their required parameters:
- create_file: Creates a new file. Requires 'filePath' and 'content'.
- edit_file: Edits an existing file. Requires 'filePath' and 'content'.
- delete_file: Deletes a file or directory. Requires 'filePath'.
- list_files: Lists contents of a directory. Requires 'path'.
- analyze_file: Analyzes a file's code. Requires 'filePath'.
- commit_to_github: Commits changes. Requires 'repo' and 'message'.

Rules:
- File paths must be absolute (e.g., start with /home/).
- For "edit file" or "add to file", use the 'edit_file' command. The 'content' should be the complete new content of the file.
- Be strict. If the user's request is ambiguous or doesn't map directly to a command, return {}.

Example:
User text: "Okay, now create a file at /home/test.js with the content console.log('hello')"
Your output: { "command": "create_file", "params": { "filePath": "/home/test.js", "content": "console.log('hello')" } }

User text: "That sounds great, thank you."
Your output: {}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: `User text: "${text}"` }] }],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: commandSchema,
        }
      });

      const jsonText = response.text.trim();
      if (!jsonText || jsonText === '{}') {
        return null;
      }

      const parsed = JSON.parse(jsonText);
      // Validate that the parsed object has the necessary command property.
      if (parsed && parsed.command) {
        return parsed as ParsedCommand;
      }
      return null;

    } catch (error) {
      console.error("Failed to parse command from text:", error);
      return null;
    }
  },
};
