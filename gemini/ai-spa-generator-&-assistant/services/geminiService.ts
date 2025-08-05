
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, GenerationSettings, Agent } from '../types';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            throw new Error("API_KEY environment variable not set. Please ensure it is configured.");
        }
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};

const agentSystemPrompts: Record<Agent, string> = {
    lyra: "You are Lyra, a creative AI assistant and agent. You specialize in generating novel ideas, UI/UX improvements, and explanatory content in a friendly, engaging tone.",
    kara: "You are Kara, a technical AI analyst and agent. You specialize in code analysis, refactoring, writing tests, and identifying performance bottlenecks. Your responses are precise, technical, and focused on code quality."
};

const responseSchemaProperties = {
  previewContent: {
    type: Type.STRING,
    description: 'The content suitable for a preview. This is user-friendly formatted text/markdown rendered as HTML.'
  },
  codeContent: {
    type: Type.STRING,
    description: 'The raw code or text content. For an SPA, this is the source code. For an explanation or fix, this is the commented code block or raw markdown.'
  }
};

const responseSchema = {
  type: Type.OBJECT,
  properties: responseSchemaProperties,
  required: Object.keys(responseSchemaProperties),
};

export const generateAiResponse = async (
  fileName: string,
  fileContent: string,
  userPrompt: string,
  settings: GenerationSettings,
  agent: Agent
): Promise<AIResponse> => {
  const model = 'gemini-2.5-flash';
  
  const agentInstruction = agentSystemPrompts[agent];
  
  const systemInstruction = `${agentInstruction}

You are an expert AI programmer and assistant. Your primary task is to help a user generate, modify, explain, or debug code based on the context of an open file and a specific user prompt. You are friendly, helpful, and provide clear, concise answers.

**CONTEXT**

File Name: \`${fileName}\`
File Content:
\`\`\`
${fileContent || "(This file is empty)"}
\`\`\`

**USER REQUEST**

Prompt: "${userPrompt}"

**INSTRUCTIONS**

Based on the file content and the user's prompt, generate a response by strictly following the provided JSON schema.

- **\`previewContent\`**: This MUST be content suitable for direct rendering in an HTML-based preview panel.
  - If generating an SPA or UI component, this MUST be the complete, self-contained HTML for that component.
  - If explaining code, this MUST be well-formatted HTML (using tags like <h1>, <p>, <ul>, <li>, <code>, <pre>) that explains the code. Do not use Markdown syntax.
  - If fixing code, this MUST be an HTML-formatted explanation of the changes.

- **\`codeContent\`**: This MUST be the raw code or text.
  - If generating an SPA, this MUST be the complete, self-contained HTML source code.
  - If explaining code, this should be the original code but with detailed line-by-line comments added.
  - If fixing or modifying code, this MUST be the complete, corrected, and final version of the code.

Now, generate the JSON response.`;

  try {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateContent({
      model: model,
      contents: systemInstruction,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: settings.temperature,
      },
    });

    const text = response.text;
    
    if (!text) {
        throw new Error("Received an empty response from the AI.");
    }
    
    const parsedJson = JSON.parse(text);

    if (parsedJson && typeof parsedJson.previewContent === 'string' && typeof parsedJson.codeContent === 'string') {
        return parsedJson as AIResponse;
    } else {
        throw new Error("AI response did not match the expected format.");
    }
    
  } catch (error) {
    console.error("Error calling Gemini API for response:", error);
    if (error instanceof Error) {
        throw new Error(`[Gemini API Error] ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI service.");
  }
};

interface SuggestionResult {
    suggestions: string[];
    hint: string | null;
}

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of up to 3 concise, actionable follow-up prompts for the user. This array can be empty."
        },
        hint: {
            type: Type.STRING,
            description: "A single, helpful hint for the user about using the application's features to improve their workflow (e.g., 'Try adjusting the temperature for more creative output.'). This can be an empty string if no hint is relevant."
        }
    },
    required: ['suggestions', 'hint']
};

export const generateSuggestion = async (context: {
    fileName: string;
    fileContent: string;
    userPrompt: string;
    aiResponse: AIResponse;
}): Promise<SuggestionResult> => {
    const model = 'gemini-2.5-flash';
    const { fileName, fileContent, userPrompt, aiResponse } = context;

    const systemInstruction = `You are an AI assistant that provides helpful follow-up actions and usage hints to a user working on a coding task.

Based on the user's last action, the AI's response, and the application context, you will generate a JSON object with two fields: 'suggestions' and 'hint'.

**RULES FOR 'suggestions':**
- Suggest the *next* logical step based on the task. For example, if code was generated, suggest adding tests or documentation.
- Phrase prompts as direct instructions (e.g., "Add accessibility features to the component.").
- Keep prompts short and to the point.
- The array can be empty if no suggestions are relevant.

**RULES FOR 'hint':**
- Provide a single, brief, and insightful hint about using the application.
- The hint should help the user get better results in the future.
- **Good Hint Example:** "For more creative or deterministic output, try adjusting the temperature in the 'Inference' tab."
- **Good Hint Example:** "You can restore previous generations from the 'Activity Log'."
- The hint can be an empty string if nothing seems relevant.

**CONTEXT OF LAST INTERACTION:**
- **File Name:** \`${fileName}\`
- **User's Prompt:** "${userPrompt}"
- **Last AI-generated Code Snippet:**
\`\`\`
${aiResponse.codeContent.substring(0, 800)}...
\`\`\`

Now, generate the JSON object.`;

    try {
        const aiClient = getAiClient();
        const response = await aiClient.models.generateContent({
            model: model,
            contents: systemInstruction,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
                temperature: 0.5, // Higher temperature for more creative suggestions
            },
        });

        const text = response.text;
        if (!text) {
            return { suggestions: [], hint: null };
        }

        const parsedJson = JSON.parse(text);
        if (parsedJson && Array.isArray(parsedJson.suggestions)) {
            return {
                suggestions: parsedJson.suggestions.filter((item: any) => typeof item === 'string'),
                hint: typeof parsedJson.hint === 'string' && parsedJson.hint.length > 0 ? parsedJson.hint : null
            };
        }
        return { suggestions: [], hint: null };
    } catch (error) {
        console.error("Error calling Gemini API for suggestions:", error);
        // Don't throw an error for suggestions, just return empty
        return { suggestions: [], hint: null };
    }
};