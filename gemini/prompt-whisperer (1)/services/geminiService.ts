import { GoogleGenAI, Content } from "@google/genai";
import type { PromptSettings, Variable } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const applyVariables = (prompt: string, variables: Variable[]): string => {
  return variables.reduce((currentPrompt, variable) => {
    if (variable.key) {
      const regex = new RegExp(`\\{\\{\\s*${variable.key}\\s*\\}\\}`, 'g');
      return currentPrompt.replace(regex, variable.value);
    }
    return currentPrompt;
  }, prompt);
};

const constructSystemInstruction = (settings: PromptSettings): string => {
  let instruction = settings.systemInstruction;
  if (settings.formality === 'casual') {
    instruction += ' Respond in a casual and friendly tone.';
  } else if (settings.formality === 'formal') {
    instruction += ' Respond in a formal and professional tone.';
  }
  if (settings.conciseness === 'brief') {
    instruction += ' Be brief and to the point.';
  } else if (settings.conciseness === 'detailed') {
    instruction += ' Provide detailed and comprehensive explanations.';
  }
  return instruction.trim();
};

export const streamGenerateContent = async (
  prompt: string,
  userExample: string,
  modelExample: string,
  variables: Variable[],
  settings: PromptSettings,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: string) => void
): Promise<{ fullPrompt: string }> => {
  const fullPromptText = applyVariables(prompt, variables);
  const fullUserExample = applyVariables(userExample, variables);
  const fullModelExample = applyVariables(modelExample, variables);
  
  const systemInstruction = constructSystemInstruction(settings);
  
  const contents: Content[] = [];

  if (fullUserExample && fullModelExample) {
      contents.push({ role: 'user', parts: [{ text: fullUserExample }] });
      contents.push({ role: 'model', parts: [{ text: fullModelExample }] });
  }
  contents.push({ role: 'user', parts: [{ text: fullPromptText }] });

  const serializedFullPrompt = JSON.stringify(contents, null, 2);

  let attempts = 0;
  const maxAttempts = 4;
  let delay = 1000;

  while (attempts < maxAttempts) {
    try {
      const stream = await ai.models.generateContentStream({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: settings.temperature,
        },
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullResponse += chunkText;
          onChunk(chunkText);
        }
      }
      onComplete(fullResponse);
      return { fullPrompt: serializedFullPrompt };
    } catch (error: any) {
      attempts++;
      const errorMessage = error?.message || "";
      const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimitError && attempts < maxAttempts) {
        const retryMessage = `[System: API rate limit hit. Retrying in ${delay / 1000}s...]`;
        console.warn(retryMessage);
        onChunk('__CLEAR_AND_RETRY__');
        onChunk(retryMessage);
        await sleep(delay);
        onChunk('__CLEAR_AND_RETRY__'); // Clear the retry message before new content comes in
        delay *= 2;
      } else {
        console.error("Gemini API Error:", error);
        const finalErrorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        onError(`Error generating content: ${finalErrorMessage}`);
        return { fullPrompt: serializedFullPrompt };
      }
    }
  }
  onError(`Failed to get response from API after multiple retries due to rate limiting.`);
  return { fullPrompt: serializedFullPrompt };
};

interface SuggestionOptions {
    responseMimeType?: "application/json";
    responseSchema?: any;
}

export const generateSuggestion = async (metaPrompt: string, options?: SuggestionOptions): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 4;
  let delay = 1000;
  
  const config: any = {
      temperature: 0.8,
  };

  if (options?.responseMimeType === 'application/json') {
      config.responseMimeType = "application/json";
      if (options.responseSchema) {
          config.responseSchema = options.responseSchema;
      }
  }

  while(attempts < maxAttempts) {
    try {
      const response = await ai.models.generateContent({
          model: model,
          contents: metaPrompt,
          config,
      });
      return response.text.trim();
    } catch (error: any) {
      attempts++;
      const errorMessage = error?.message || "";
      const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');

      if (isRateLimitError && attempts < maxAttempts) {
        console.warn(`Rate limit on suggestion. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
        delay *= 2;
      } else {
        console.error("Gemini Suggestion Error:", error);
        const finalErrorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return `Error generating suggestion: ${finalErrorMessage}`;
      }
    }
  }
  return `Error: Failed to get suggestion after multiple retries due to rate limiting.`;
};
