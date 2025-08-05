import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LightbulbIcon, LoadingSpinnerIcon } from '../icons';

interface AiSectionHintProps {
  createPrompt: () => string;
  responseSchema: any;
  onSuggestion: (suggestion: any) => void;
  buttonText: string;
  className?: string;
}

const AiSectionHint: React.FC<AiSectionHintProps> = ({ createPrompt, responseSchema, onSuggestion, buttonText, className }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) throw new Error("API key not configured.");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = createPrompt();

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.5,
        }
      });
      
      const jsonText = response.text.trim();
      // Gemini may wrap the JSON in markdown backticks
      const cleanedJson = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
      const suggestion = JSON.parse(cleanedJson);
      onSuggestion(suggestion);

    } catch (e: any) {
      setError('Failed to get suggestion. Check console.');
      console.error("AI Section Suggestion Error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`my-4 border-t border-[var(--border-color)] pt-4 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        title={error || `Use AI to suggest ${buttonText.toLowerCase()}`}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary-hover)] font-semibold rounded-md shadow-sm border border-[var(--color-primary)]/50 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] focus:ring-[var(--color-primary)] disabled:opacity-50"
      >
        {loading ? (
          <>
            <LoadingSpinnerIcon className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <LightbulbIcon className="w-5 h-5" />
            {buttonText}
          </>
        )}
      </button>
      {error && <p className="text-xs text-[var(--color-error)] mt-2 text-center">{error}</p>}
    </div>
  );
};

export default AiSectionHint;