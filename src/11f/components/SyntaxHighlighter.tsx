import React, { useMemo } from 'react';

// A simple, lightweight syntax highlighter using regex.
// This avoids pulling in a large library for this demonstration.

type Token = {
    type: string;
    content: string;
};

const tokenize = (code: string, language: string): Token[] => {
    if (!code) return [];
    
    // A very basic set of regexes for tokenization
    const grammar: { [lang: string]: { [type: string]: RegExp } } = {
        javascript: {
            comment: /(?:\/\/.*|\/\*[\s\S]*?\*\/)/,
            string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/,
            keyword: /\b(const|let|var|function|return|if|else|for|while|import|export|from|async|await|new|class|extends|super|this|true|false|null|of|in|try|catch|finally|typeof|instanceof|delete|void)\b/,
            function: /\b[a-zA-Z_]\w*(?=\s*\()/,
            number: /\b\d+(\.\d+)?\b/,
            operator: /[+\-*/%&|^=<>!]+/,
            punctuation: /[{}[\]();,.:]/,
        },
        html: {
            comment: /<!--[\s\S]*?-->/,
            tag: /<\/?[a-zA-Z0-9\s]+(?=[^>]*>)/,
            attribute: /\b[a-zA-Z-]+(?=\s*=)/,
            string: /"(?:\\.|[^"\\])*"/,
            punctuation: /[<>/=]/,
        },
        css: {
            comment: /\/\*[\s\S]*?\*\//,
            selector: /(?:[.#&]?-?[_a-zA-Z]+[_a-zA-Z0-9-]*|::?[_a-zA-Z]+[_a-zA-Z0-9-]*|\[[^\]]+\])(?=\s*\{)/,
            property: /\b[\w-]+(?=\s*:)/,
            string: /"(?:\\.|[^"\\])*"/,
            number: /[-+]?\d*\.?\d+(?:px|em|rem|%|vh|vw|s)?/,
            punctuation: /[{};:,]/,
        },
        json: {
            property: /"(?:\\.|[^"\\])*"(?=\s*:)/,
            string: /"(?:\\.|[^"\\])*"/,
            number: /-?\d+(\.\d+)?([eE][+-]?\d+)?/,
            keyword: /\b(true|false|null)\b/,
            punctuation: /[{}[\]:,]/,
        },
        bash: {
            comment: /#.*/,
            string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/,
            keyword: /\b(echo|ls|cd|mkdir|touch|rm|cat|sudo|if|then|else|fi|for|while|do|done|export|unset)\b/,
            variable: /\$[a-zA-Z_]\w*|\$\{[^}]+\}/,
            operator: /[><|&;]=?/,
            punctuation: /[\[\]()]/,
        },
    };

    const langGrammar = grammar[language] || grammar.javascript; // Default to JS
    const tokenDefs = Object.entries(langGrammar).map(([type, pattern]) => ({
        type,
        pattern: new RegExp(`^(${pattern.source})`),
    }));

    let remainingCode = code;
    const tokens: Token[] = [];

    while (remainingCode.length > 0) {
        let matched = false;
        for (const { type, pattern } of tokenDefs) {
            const match = remainingCode.match(pattern);
            if (match) {
                tokens.push({ type, content: match[0] });
                remainingCode = remainingCode.substring(match[0].length);
                matched = true;
                break;
            }
        }
        if (!matched) {
            // If no token matches, consume one character as plain text
            tokens.push({ type: 'plain', content: remainingCode[0] });
            remainingCode = remainingCode.substring(1);
        }
    }

    return tokens;
};


const getTokenClassName = (type: string): string => {
    switch (type) {
        case 'comment': return 'text-token-comment';
        case 'string': return 'text-token-string';
        case 'keyword': return 'text-token-keyword';
        case 'number': return 'text-token-number';
        case 'function': return 'text-token-function';
        case 'operator': return 'text-token-operator';
        case 'punctuation': return 'text-token-punctuation';
        case 'tag': return 'text-token-keyword'; // Use keyword color for tags
        case 'attribute': return 'text-token-function'; // Use function color for attributes
        case 'selector': return 'text-token-tag'; // Use tag color for selectors
        case 'property': return 'text-token-attribute';
        case 'variable': return 'text-token-value';
        default: return 'text-bright-text';
    }
}

export const SyntaxHighlighter: React.FC<{ code: string; language?: string }> = ({ code, language = 'javascript' }) => {
    
    // Detect language from code if not provided
    const detectedLanguage = useMemo(() => {
        const trimmedCode = code.trim();
        if (language && language !== 'javascript') return language;
        if (trimmedCode.startsWith('{') || trimmedCode.startsWith('[')) return 'json';
        if (trimmedCode.startsWith('<')) return 'html';
        if (trimmedCode.match(/^{?[a-zA-Z0-9\s.#:-]+}?/)) return 'css';
        if (trimmedCode.match(/^(#|\b(echo|ls|cd)\b)/)) return 'bash';
        return 'javascript';
    }, [code, language]);
    
    const tokens = useMemo(() => tokenize(code, detectedLanguage), [code, detectedLanguage]);
    
    return (
        <div className="group relative bg-primary rounded-lg my-1">
            <pre className="p-4 text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                <code>
                    {tokens.map((token, i) => (
                        <span key={i} className={getTokenClassName(token.type)}>
                            {token.content}
                        </span>
                    ))}
                </code>
            </pre>
        </div>
    );
};