
import { GoogleGenAI } from "@google/genai";

// Ensure you have the API_KEY in your environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("Missing API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

export const generateComponent = async (prompt: string): Promise<string> => {
    const systemInstruction = `
You are an expert React/Tailwind developer. Your task is to generate a single, self-contained React functional component based on the user's prompt.

**RULES:**
1.  Use only Tailwind CSS for styling. Do not use inline styles, custom CSS files, or CSS-in-JS.
2.  The component must be a single function definition. Do not include 'export default' or any other exports.
3.  Do not include 'import React from "react"'. Assume React and its hooks (useState, useEffect, useCallback, etc.) are already available in the scope.
4.  The entire output must be ONLY the raw code for the component, as a single block of text. Do not add any explanation, notes, or markdown formatting (like \`\`\`jsx) around the code.
5.  Generate a complete, working component. Use placeholder data or images (e.g., from picsum.photos) if needed.
6.  Ensure all elements are properly closed and the JSX is valid.
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                // Disable thinking for faster, more direct code generation
                thinkingConfig: { thinkingBudget: 0 } 
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating component with Gemini:", error);
        if (error instanceof Error) {
            return `// Error: Failed to generate component. ${error.message}`;
        }
        return "// Error: An unknown error occurred."
    }
};
