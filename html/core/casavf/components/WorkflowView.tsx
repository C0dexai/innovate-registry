
import React, { useState, useCallback } from 'react';
import { AGENTS } from '../agents';
import { createChatSession, sendMessage } from '../services/geminiService';
import WorkflowStep from './WorkflowStep';

type Phase = 'sophia' | 'adam' | 'david';
type Status = 'pending' | 'running' | 'complete' | 'error';

const WorkflowView: React.FC = () => {
    const [operationStatus, setOperationStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
    const [phaseStatuses, setPhaseStatuses] = useState<Record<Phase, Status>>({
        sophia: 'pending',
        adam: 'pending',
        david: 'pending',
    });
    const [fileContents, setFileContents] = useState({
        yaml: '',
        json: '',
        markdown: '',
    });
    const [error, setError] = useState<string | null>(null);

    const runOperation = useCallback(async () => {
        setOperationStatus('running');
        setError(null);
        setPhaseStatuses({ sophia: 'running', adam: 'pending', david: 'pending' });
        setFileContents({ yaml: '', json: '', markdown: '' });

        const projectContext = "a new secure, decentralized messaging application for the family, codenamed 'The Veil'.";

        try {
            // Phase 1: Sophia (YAML)
            const sophia = AGENTS.find(a => a.name === 'Sophia');
            if (!sophia) throw new Error("Agent Sophia not found.");
            const sophiaPrompt = `Your task is to create the high-level project plan for ${projectContext}. Your output must be ONLY the raw YAML content, with no other text or explanations. The plan should outline: \n- core_modules (e.g., encryption, peer-to-peer_network, secure_storage) \n- technology_stack (suggest visionary but practical technologies) \n- key_milestones (with estimated timelines in weeks). \nKeep it concise and strategic.`;
            let chat = createChatSession(sophia.personality_prompt);
            const yamlContent = await sendMessage(chat, sophiaPrompt);
            setFileContents(c => ({ ...c, yaml: yamlContent }));
            setPhaseStatuses(s => ({ ...s, sophia: 'complete', adam: 'running' }));

            // Phase 2: Adam (JSON)
            const adam = AGENTS.find(a => a.name === 'Adam');
            if (!adam) throw new Error("Agent Adam not found.");
            const adamPrompt = `Take Sophia's visionary YAML plan for 'The Veil' and translate it into a structured, detailed JSON specification. Your output must be ONLY the raw JSON object, with no other text or explanations. Every module from her plan must be an object in a "modules" array, with properties for "name", "description", "dependencies", and "tech_stack". Also, create a "timeline" array of objects based on her milestones, each with "milestone_name", "duration_weeks", and "deliverables". Here is the YAML plan:\n\n---\n${yamlContent}`;
            chat = createChatSession(adam.personality_prompt);
            const jsonContent = await sendMessage(chat, adamPrompt);
            setFileContents(c => ({ ...c, json: jsonContent }));
            setPhaseStatuses(s => ({ ...s, adam: 'complete', david: 'running' }));

            // Phase 3: David (Markdown)
            const david = AGENTS.find(a => a.name === 'David');
            if (!david) throw new Error("Agent David not found.");
            const davidPrompt = `Take Adam's technical JSON specification for 'The Veil' and create a summary in Markdown format. The summary should be a high-level briefing for the crew. Your output must be ONLY the raw Markdown content, with no other text or explanations. It must include: \n- A brief project overview (## Project: The Veil). \n- Key Features (as a bulleted list). \n- Technology Choices (as a bulleted list). \n- A simple project timeline table. \nHere is the JSON data:\n\n---\n${jsonContent}`;
            chat = createChatSession(david.personality_prompt);
            const markdownContent = await sendMessage(chat, davidPrompt);
            setFileContents(c => ({ ...c, markdown: markdownContent }));
            setPhaseStatuses(s => ({ ...s, david: 'complete' }));
            
            setOperationStatus('complete');

        } catch (err) {
            console.error("Operation failed:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during the operation.");
            setOperationStatus('error');
            setPhaseStatuses(s => {
                const newStatuses = { ...s };
                (Object.keys(newStatuses) as Phase[]).forEach(key => {
                    if (newStatuses[key] === 'running') newStatuses[key] = 'error';
                });
                return newStatuses;
            });
        }
    }, []);

    const sophia = AGENTS.find(a => a.name === 'Sophia')!;
    const adam = AGENTS.find(a => a.name === 'Adam')!;
    const david = AGENTS.find(a => a.name === 'David')!;

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wider">Operation: The Blueprint</h2>
                <p className="text-lg text-neutral-300 font-light max-w-3xl mx-auto">Andoy orchestrates the creation of project artifacts, tasking the family's specialists in sequence.</p>
                <p className="text-red-400 mt-2 italic">"I need a full blueprint for 'The Veil'. Sophia, give me the vision. Adam, architect it. David, break it down. Move."</p>
            </div>

            {operationStatus === 'idle' && (
                <div className="text-center">
                    <button 
                        onClick={runOperation}
                        className="bg-red-700 text-white font-bold py-3 px-8 rounded-md hover:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 uppercase tracking-widest text-lg transform hover:scale-105"
                    >
                        Initiate Operation
                    </button>
                </div>
            )}
            
            {operationStatus !== 'idle' && (
                 <div className="space-y-4">
                    <WorkflowStep
                        phase={1}
                        agentName={sophia.name}
                        agentRole={sophia.role}
                        fileName="_plan.yaml"
                        status={phaseStatuses.sophia}
                        content={fileContents.yaml}
                        language="yaml"
                    />
                    <WorkflowStep
                        phase={2}
                        agentName={adam.name}
                        agentRole={adam.role}
                        fileName="_requirements.json"
                        status={phaseStatuses.adam}
                        content={fileContents.json}
                        language="json"
                    />
                     <WorkflowStep
                        phase={3}
                        agentName={david.name}
                        agentRole={david.role}
                        fileName="_summary.md"
                        status={phaseStatuses.david}
                        content={fileContents.markdown}
                        language="markdown"
                    />
                </div>
            )}

            {error && (
                <div className="mt-6 text-center bg-red-900/50 border border-red-700 p-4 rounded-lg">
                    <h3 className="font-bold text-red-400 text-lg uppercase">Operation Halted</h3>
                    <p className="text-neutral-300">{error}</p>
                </div>
            )}

            {operationStatus === 'complete' && (
                 <div className="mt-8 text-center">
                    <button 
                        onClick={runOperation}
                        className="bg-red-800 text-white font-bold py-3 px-8 rounded-md hover:bg-red-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 uppercase tracking-widest text-lg"
                    >
                        Run Operation Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkflowView;
