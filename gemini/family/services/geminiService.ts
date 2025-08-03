
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { CuaAction } from "../types";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

const getAi = () => {
    if (!ai) {
        throw new Error("API_KEY environment variable not set or invalid.");
    }
    return ai;
}


export const createChatSession = (systemInstruction: string): Chat => {
  const chat = getAi().chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      topP: 1,
      topK: 32,
    },
  });
  return chat;
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
  if (!getAi()) {
      // This check is somewhat redundant due to createChatSession's check, but good for safety.
      throw new Error("Gemini AI not initialized. Check API Key.");
  }
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("Failed to get response from the agent's core systems.");
  }
};

const cuaActionSchema = {
  type: Type.OBJECT,
  properties: {
    thought: { type: Type.STRING, description: 'Your reasoning for the action. Explain what you are about to do for the user.' },
    action_type: { type: Type.STRING, description: "The type of action. Must be one of: 'click', 'type', 'scroll', 'wait', 'done'." },
    coordinates: {
      type: Type.OBJECT,
      description: 'The x and y coordinates for click actions, as a percentage of screen width/height (0.0 to 1.0). Required for click.',
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER }
      },
      required: ['x', 'y'],
    },
    text_to_type: { type: Type.STRING, description: 'The text to be typed. Required for type action.' },
    scroll_direction: { type: Type.STRING, description: "Direction to scroll, e.g., 'down', 'up'. Required for scroll action." },
    summary: { type: Type.STRING, description: 'A summary of the completed task. Required for done action.' }
  },
  required: ['thought', 'action_type']
};


export const generateCuaAction = async (task: string, history: CuaAction[], imageBase64: string): Promise<CuaAction> => {
    const systemPrompt = `You are an expert computer-using agent. Your goal is to help the user complete tasks on their computer. You will be given a screenshot of the user's screen and a high-level goal.
Your task is to determine the very next, single, atomic action the user should take to progress.
You must respond ONLY with a JSON object that matches the provided schema. Do not add any other text or markdown formatting.
Your actions should be simple, like a single click or typing a short phrase. Break down complex tasks into small, sequential steps.
The user's goal is: "${task}".
The history of actions taken so far is: ${history.length > 0 ? JSON.stringify(history) : 'None'}.
Analyze the screenshot and determine the next best action.`;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
        },
    };
    const textPart = { text: systemPrompt };

    try {
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: cuaActionSchema,
                temperature: 0.2,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CuaAction;
    } catch (error) {
        console.error("Error generating CUA action:", error);
        throw new Error("The agent failed to determine the next action.");
    }
};


export type { Chat };
