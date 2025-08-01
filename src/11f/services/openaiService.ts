// This service now makes live calls to the OpenAI API using the official SDK.
import OpenAI from 'openai';
import type { OpenAIFile, ComputerUseResponse } from '../types';

let openai: OpenAI;

const initializeClient = (apiKey: string) => {
    if (!openai || openai.apiKey !== apiKey) {
        openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }
};

export const openaiService = {
  validateKey: async (key: string): Promise<boolean> => {
    if (!key || !key.startsWith('sk-')) return false;
    
    try {
        initializeClient(key);
        await openai.models.list();
        return true;
    } catch (error) {
        console.error("OpenAI key validation failed:", error);
        return false;
    }
  },

  generateContent: async (prompt: string, apiKey: string, attachment?: { data: string; mimeType: string }): Promise<{ text: string }> => {
    if (!apiKey) return { text: "Error: OpenAI API key is not set. Please set it in the Integrations tab." };
    initializeClient(apiKey);

    try {
        const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [{ type: 'text', text: prompt }];

        if (attachment && attachment.mimeType.startsWith('image/')) {
            content.push({
                type: 'image_url',
                image_url: {
                    url: `data:${attachment.mimeType};base64,${attachment.data}`
                }
            });
        } else if (attachment) {
            try {
                const textContent = atob(attachment.data);
                content.push({ type: 'text', text: `\n\n--- Attached File Content ---\n${textContent}\n--- End Attached File ---` });
            } catch (e) {
                console.error("Failed to decode base64 attachment content:", e);
                content.push({ type: 'text', text: '\n\n--- Attached File Content (could not be decoded) ---' });
            }
        }
        
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: 'user', content }];
        
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 1500,
        });

        const text = response.choices[0]?.message?.content || "No response text found.";
        return { text };

    } catch (error) {
        console.error("OpenAI API call failed:", error);
        return { text: `Error calling OpenAI API: ${(error as Error).message}` };
    }
  },
  
  textToSpeech: async (text: string, apiKey: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'): Promise<Blob | null> => {
      if (!apiKey || !text) return null;
      initializeClient(apiKey);
      
      try {
        const response = await openai.audio.speech.create({
            model: 'tts-1',
            input: text.substring(0, 4096), // TTS has a character limit
            voice: voice,
        });
        
        // The SDK returns a Response object, get the blob from it
        const audioBlob = await response.blob();
        return audioBlob;
        
      } catch (error) {
          console.error(`OpenAI TTS call failed for voice ${voice}:`, error);
          return null;
      }
  },

  // --- Computer Use Agent Function ---
  createComputerUseResponse: async (apiKey: string, request: any): Promise<ComputerUseResponse> => {
    if (!apiKey) throw new Error("OpenAI API key not set.");

    // This is a preview API and may not be in the SDK. Use a direct fetch call,
    // similar to how the Realtime API is handled.
    const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2', // Required for some beta features
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: `HTTP error! status: ${response.status}` }}));
        console.error("Computer Agent Error Response:", JSON.stringify(errorData, null, 2));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // --- Realtime API Function ---
  createRealtimeSession: async (apiKey: string): Promise<{ client_secret: { value: string } } | null> => {
    if (!apiKey) {
        console.error("OpenAI API key is required to create a realtime session.");
        return null;
    }
    try {
        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-2024-05-13',
                modalities: ['audio', 'text'],
                instructions: 'You are a friendly, conversational assistant in the Gemini WebDev Studio. Keep your responses concise and helpful.',
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to create OpenAI Realtime session:", error);
        return null;
    }
  },

  // --- New Global File Management Functions (using fetch) ---

  listFiles: async (apiKey: string, purpose?: string): Promise<OpenAIFile[]> => {
    if (!apiKey) return [];
    let url = 'https://api.openai.com/v1/files';
    if (purpose) {
        url += `?purpose=${encodeURIComponent(purpose)}`;
    }
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!response.ok) {
        console.error("Failed to list files:", await response.text());
        return [];
    }
    const data = await response.json();
    return data.data as OpenAIFile[];
  },

  uploadFile: async (apiKey: string, file: File, purpose: string): Promise<OpenAIFile> => {
      if (!apiKey) throw new Error("OpenAI API key is required.");
      const formData = new FormData();
      formData.append('purpose', purpose);
      formData.append('file', file);

      const response = await fetch('https://api.openai.com/v1/files', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: formData,
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: `HTTP error! status: ${response.status}` }}));
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      return response.json();
  },

  deleteFile: async (apiKey: string, fileId: string): Promise<boolean> => {
      if (!apiKey) throw new Error("OpenAI API key is required.");
      const response = await fetch(`https://api.openai.com/v1/files/${fileId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: `HTTP error! status: ${response.status}` }}));
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.deleted;
  },

  retrieveFileContent: async (apiKey: string, fileId: string): Promise<Blob | null> => {
      if (!apiKey) return null;
      try {
        const response = await fetch(`https://api.openai.com/v1/files/${fileId}/content`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.blob();
      } catch (error) {
          console.error(`Failed to retrieve content for file ${fileId}:`, error);
          return null;
      }
  }
};