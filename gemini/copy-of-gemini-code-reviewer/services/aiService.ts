import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { Agent, ChatMessage } from '../types.ts';

async function callGemini(prompt: string, agent: Agent, config?: any): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key not found in environment variables. Please set API_KEY.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
              systemInstruction: agent.systemPrompt,
              ...config,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error(`Your Gemini API key is not valid. Please check your environment configuration.`);
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while communicating with the Gemini API.");
    }
}

async function callOpenAI(prompt: string, agent: Agent): Promise<string> {
    console.warn("OpenAI provider is a placeholder and not yet implemented.");
    // In a real app, you would get the key from process.env.OPENAI_API_KEY
    return Promise.resolve(`(Placeholder) As ${agent.name}, I received your prompt: "${prompt}" using the OpenAI provider.`);
}

export async function ask(prompt: string, agent: Agent, config?: any): Promise<string> {
    switch (agent.provider) {
        case 'gemini':
            return callGemini(prompt, agent, config);
        case 'openai':
            return callOpenAI(prompt, agent);
        default:
            console.error(`Unsupported provider: ${agent.provider}`);
            return `Error: Provider "${agent.provider}" is not supported.`;
    }
}

export async function sendMessageInChat(
    message: string, 
    history: ChatMessage[], 
    agent: Agent
): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key not found in environment variables. Please set API_KEY.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const geminiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    
    const chat: Chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: geminiHistory,
      config: {
        systemInstruction: agent.systemPrompt,
      }
    });

    try {
        const response: GenerateContentResponse = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini Chat API:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                 throw new Error(`Your Gemini API key is not valid. Please check your environment configuration.`);
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while communicating with the Gemini Chat API.");
    }
}
