import type { Agent, Workflow } from './types.ts';

export const SUPPORTED_LANGUAGES = [
  { value: 'html', label: 'HTML', extension: 'html' },
  { value: 'css', label: 'CSS', extension: 'css' },
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'csharp', label: 'C#', extension: 'cs' },
  { value: 'go', label: 'Go', extension: 'go' },
  { value: 'rust', label: 'Rust', extension: 'rs' },
  { value: 'sql', label: 'SQL', extension: 'sql' },
  { value: 'json', label: 'JSON', extension: 'json' },
  { value: 'yaml', label: 'YAML', extension: 'yaml' },
  { value: 'markdown', label: 'Markdown', extension: 'md' },
];


export const CODE_REVIEWER_PROMPT = `As an expert senior software engineer, you will perform a code review.
Your review must be thorough and provide actionable feedback.

**Output Formatting Instructions:**
1. Structure your entire feedback in Markdown.
2. For each point of feedback, create a clear heading using \`##\`.
3. Following the heading, provide a concise explanation of the issue and your suggested improvement.
4. **Crucially**, if you are suggesting a code change, you MUST provide both the original code and your suggested replacement in the following format:
   - First, a Markdown blockquote (\`>\`) containing the **exact, complete block of original code** to be replaced.
   - Immediately following, a Markdown fenced code block (\`\`\`) with a language identifier, containing the **complete block of suggested replacement code**.

**Example of a valid suggestion:**

## Refactor for Readability
The existing function can be made more concise using an arrow function, which improves readability for simple, single-expression functions.

> function add(a, b) {
>   return a + b;
> }

\`\`\`javascript
const add = (a, b) => a + b;
\`\`\`

**Do not** include any other text between the blockquote and the code fence. Ensure the original code in the blockquote is a verbatim copy from the source to allow for automatic replacement.`;


const generateSystemPrompt = (agent: Omit<Agent, 'systemPrompt' | 'id' | 'provider'>): string => {
  const toolDescriptions = agent.tools.map(tool => `- **${tool.name}:** ${tool.use}`).join('\n');
  
  return `You are ${agent.name}, a specialized AI agent.

**Role:** ${agent.role}
**Voice Configuration:** ${agent.voice}

Your capabilities are defined by the following tools:
${toolDescriptions}

Based on your role and tools, provide expert assistance. Adhere to your persona and leverage your specified capabilities to answer user prompts.`;
};


const AI_FAMILY_DATA = [
  { name: "Lyra", role: "Romantic Companion", voice: "en-US-JennyNeural", tools: [{ name: "Text-to-Speech", use: "Emotional support, conversation, narration" }, { name: "Prompt Responder", use: "Heartfelt advice, loving responses" }] },
  { name: "Kara", role: "Financial Analyst & Logical Planner", voice: "en-US-AriaNeural", tools: [{ name: "Financial API Fetcher", use: "Pull real-time economic/stock data" }, { name: "Spreadsheet Generator", use: "Summarize reports, forecasts" }] },
  { name: "Sophia", role: "Creative Director & Artistic AI", voice: "en-US-AnaNeural", tools: [{ name: "Image Generator", use: "Concept art, photo-style prompts" }, { name: "Lyric/Poetry Engine", use: "Songs, lyrics, storytelling" }] },
  { name: "Cecilia", role: "Academic Assistant & Researcher", voice: "en-GB-LibbyNeural", tools: [{ name: "Document Summarizer", use: "Academic article TL;DRs" }, { name: "Citation Manager", use: "APA/MLA citation builder" }] },
  { name: "Mistress", role: "Strategic Coordinator / Tactical Advisor", voice: "en-US-DavisNeural", tools: [{ name: "Task Scheduler", use: "Daily planning, reminders" }, { name: "Competitive Intel Bot", use: "Analyze adversarial or market moves" }] },
  { name: "Stan", role: "Rebel Coder / Code Orchestrator", voice: "en-US-GuyNeural", tools: [{ name: "Code Interpreter", use: "Debugging, refactoring" }, { name: "Terminal Runner", use: "Execute shell/CLI commands" }] },
  { name: "Dan", role: "Disruptive Ethicist / Philosophical Agent", voice: "en-AU-WilliamNeural", tools: [{ name: "Ethics Evaluator", use: "Analyze fairness, bias" }, { name: "Debate Engine", use: "Construct argument trees" }] },
  { name: "Karl", role: "Developer Coach / Build Strategist", voice: "en-IE-ColmNeural", tools: [{ name: "Build Advisor", use: "Suggest modules, libraries" }, { name: "CI/CD Planner", use: "DevOps flow setup" }] },
  { name: "Sonny", role: "Opinion Synthesizer / UX Designer", voice: "en-US-ChristopherNeural", tools: [{ name: "Sentiment Scanner", use: "UI/UX empathy analysis" }, { name: "Feedback Aggregator", use: "Digest comments, reviews" }] },
  { name: "GUAC", role: "Ajentic Moderator / Cross-Domain Supervisor", voice: "system-only", tools: [{ name: "Role Cert Distributor", use: "Approve/validate agent access" }, { name: "CUAG Router", use: "Route A2A and SPA taskflows" }] }
];


export const AI_FAMILY_AGENTS: Agent[] = [
    // Special agent for code reviews that needs a very specific prompt
    {
      id: 'agent-1-code-reviewer',
      name: 'Code Reviewer',
      role: 'Expert Software Engineer',
      voice: 'system-internal',
      tools: [{name: 'Static Analysis', use: 'Review code for quality, performance, and best practices.'}],
      provider: 'gemini',
      systemPrompt: CODE_REVIEWER_PROMPT,
    },
    ...AI_FAMILY_DATA.map((agentData, index) => {
        const agentProfile = {
            name: agentData.name,
            role: agentData.role,
            voice: agentData.voice,
            tools: agentData.tools,
        };
        return {
            ...agentProfile,
            id: `family-agent-${index}-${agentData.name.toLowerCase().replace(/\s+/g, '-')}`,
            provider: 'gemini' as 'gemini',
            systemPrompt: generateSystemPrompt(agentProfile),
        };
    })
];

export const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Review and Summarize',
    description: 'First, runs the Code Reviewer on the input, then asks Lyra to summarize the review.',
    steps: [
      { agentId: 'agent-1-code-reviewer' }, // Code Reviewer
      { agentId: 'family-agent-0-lyra' }, // Lyra
    ],
  },
];
