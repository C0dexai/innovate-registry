import type { OrchestrationAgent, OrchestrationStep } from './types';

export const agents: OrchestrationAgent[] = [
  {
    name: "Lyra",
    role: "Lead UI Designer",
    expertise: "Modern SPA, Tailwind, Figma-to-Code",
    llm: "Gemini",
  },
  {
    name: "Kara",
    role: "UX Architect",
    expertise: "User Flows, Accessibility, State Management",
    llm: "Gemini",
  },
  {
    name: "Sophia",
    role: "SPA Developer",
    expertise: "React, Routing, State, Componentization",
    llm: "Gemini",
  },
  {
    name: "Cecilia",
    role: "UI Polish & QA",
    expertise: "Dark Mode, Animations, Visual QA",
    llm: "Gemini",
  },
  {
    name: "OpenAI",
    role: "Code Synthesis & API Orchestration",
    expertise: "Component Code, API Integration, Recommendations",
    llm: "OpenAI",
  },
];

export const taskflow: OrchestrationStep[] = [
  {
    step: "UI Request",
    agent: "Lyra",
    action: "Designing page structure/layout based on prompt.",
    handoff: "Kara",
  },
  {
    step: "UX Review",
    agent: "Kara",
    action: "Mapping user flow, accessibility, and suggesting improvements.",
    handoff: "Sophia",
  },
  {
    step: "Component Build",
    agent: "Sophia",
    action: "Developing page in React (structure only) and preparing for handoff.",
    handoff: "Cecilia",
  },
  {
    step: "Visual QA & Polish",
    agent: "Cecilia",
    action: "Applying dark mode, polishing CSS, and adding animations.",
    handoff: "OpenAI",
  },
  {
    step: "Synthesis",
    agent: "OpenAI",
    action: "Integrating code, resolving recommendations, and synthesizing final output.",
    handoff: null,
  },
];

export const orchestrationConfig = {
    agents,
    taskflow
};