import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LightbulbIcon, LoadingSpinnerIcon } from '../icons';

interface AiHintProps {
  createPrompt: () => string;
  onHint: (hint: string) => void;
  className?: string;
}

const AiHint: React.FC<AiHintProps> = ({ createPrompt, onHint, className }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not set. Please set the API_KEY environment variable.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = createPrompt();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
        }
      });
      
      const cleanText = response.text.trim().replace(/^"|"$/g, '');
      onHint(cleanText);

    } catch (e: any) {
      setError('Failed to get hint. Check console for details.');
      console.error("AI Hint Error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinnerIcon className="w-5 h-5 text-[var(--color-accent-purple)] animate-spin" />;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={error || "Get AI Hint"}
      className={`transition-colors ${className} ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]'}`}
      disabled={loading}
    >
      <LightbulbIcon className="w-5 h-5" />
    </button>
  );
};

export default AiHint;