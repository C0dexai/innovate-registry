import type { Suggestion } from '../types.ts';

export const parseResponse = (text: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let lastCodeBlock: string | undefined = undefined;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    const codeContent = match[2].trim();
    parts.push({ type: 'code', language: match[1] || 'plaintext', content: codeContent });
    lastCodeBlock = codeContent;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return { parts, lastCodeBlock };
};


export const parseSuggestions = (markdown: string): Suggestion[] => {
  if (!markdown) return [];
  const sections = markdown.split(/(?=##\s)/g);
  const suggestions: Suggestion[] = [];

  for (const section of sections) {
    if (!section.trim()) continue;

    const headingMatch = section.match(/^##\s+(.*)/);
    const heading = headingMatch ? headingMatch[1].trim() : 'General Feedback';
    
    const blockquoteRegex = />\s(.*(?:\n>.*)*)/;
    const blockquoteMatch = section.match(blockquoteRegex);
    const originalCode = blockquoteMatch ? blockquoteMatch[0].replace(/^>\s?/gm, '').trim() : undefined;

    const codeFenceRegex = /```(\w+)?\n([\s\S]*?)\n```/;
    const codeFenceMatch = section.match(codeFenceRegex);
    const suggestedCode = codeFenceMatch ? codeFenceMatch[2].trim() : undefined;
    const language = codeFenceMatch ? codeFenceMatch[1] : undefined;

    let description = section;
    if (headingMatch) {
      description = description.substring(headingMatch[0].length);
    }
    const suggestionBlockIndex = description.search(blockquoteRegex);
    if (suggestionBlockIndex > -1) {
      description = description.substring(0, suggestionBlockIndex);
    }
    
    description = description
      .trim()
      .replace(/`([^`]+)`/g, '<code class="bg-slate-700 rounded px-1.5 py-1 font-mono text-violet-300 text-sm">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    suggestions.push({
      id: `suggestion-${suggestions.length}`,
      heading,
      description,
      originalCode,
      suggestedCode,
      language,
    });
  }

  return suggestions;
};
