import React from 'react';
import { orchestrationConfig } from '../orchestration.config';
import { BotIcon } from './Icons';

const OrchestrationDashboard: React.FC = () => {
    const { agents, taskflow } = orchestrationConfig;

    return (
        <div className="p-8 max-w-7xl mx-auto text-bright-text">
            <h2 className="text-3xl font-bold mb-2">AI Agent Orchestration</h2>
            <p className="text-dim-text mb-8">This dashboard visualizes the multi-agent workflow for building applications.</p>
            
            <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4 border-b border-secondary pb-2">Agents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map(agent => (
                        <div key={agent.name} className="bg-secondary p-6 rounded-lg shadow-lg">
                            <div className="flex items-center mb-3">
                                <BotIcon className={`w-8 h-8 mr-3 ${agent.llm === 'Gemini' ? 'text-sky-400' : 'text-green-400'}`} />
                                <div>
                                    <h4 className="text-xl font-bold">{agent.name}</h4>
                                    <p className="text-sm text-dim-text">{agent.role}</p>
                                </div>
                            </div>
                            <p className="text-sm mb-3"><strong>LLM:</strong> {agent.llm}</p>
                            <p className="text-sm"><strong>Expertise:</strong> {agent.expertise}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-semibold mb-4 border-b border-secondary pb-2">Task Flow</h3>
                <div className="relative">
                     {/* Dotted line connecting the steps */}
                    <div className="absolute left-5 top-5 h-full border-l-2 border-dashed border-secondary"></div>
                    <div className="space-y-8">
                        {taskflow.map((step, index) => (
                             <div key={index} className="relative pl-12">
                                 <div className="absolute left-0 top-1 flex items-center justify-center w-10 h-10 bg-accent rounded-full text-white font-bold">
                                    {index + 1}
                                </div>
                                <h4 className="text-xl font-bold text-bright-text">{step.step}</h4>
                                <p className="text-dim-text mb-1">Assigned to: <strong>{step.agent}</strong></p>
                                <p className="text-bright-text">{step.action}</p>
                                {step.handoff && (
                                     <p className="text-xs text-sky-400 mt-2">Handoff to: {step.handoff}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrchestrationDashboard;
