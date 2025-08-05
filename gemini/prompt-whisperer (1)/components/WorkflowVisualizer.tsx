import React, { useEffect, useState } from 'react';
import * as yaml from 'js-yaml';
import type { WorkflowDefinition, AgentDefinition, StepDefinition } from '../types';
import { Card } from './ui/Card';
import { ICONS } from '../constants';
import { Button } from './ui/Button';
import { ResponseRenderer } from './ResponseRenderer';
import type { WorkflowStepState } from './WorkflowRunner';

interface WorkflowVisualizerProps {
  yamlString: string;
  workflowState: Record<number, WorkflowStepState>;
  isExecutingStepId: number | null;
  onExecuteStep: (stepId: number, instruction: string) => void;
  onWorkflowParsed: (data: WorkflowDefinition | null) => void;
}

const AgentCard: React.FC<{ name: string; agent: AgentDefinition }> = ({ name, agent }) => (
    <Card className="bg-gray-900/50 h-full border-blue-500/40 shadow-blue-900/20 hover:border-blue-400 transition-all">
        <div className="p-3">
            <h4 className="font-bold text-blue-400">{name}</h4>
            <p className="text-sm text-gray-300 mt-1">{agent.role}</p>
            <div className="mt-2 flex flex-wrap gap-1">
                {agent.verbs.map(verb => (
                    <span key={verb} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">{verb}</span>
                ))}
            </div>
        </div>
    </Card>
);

const InteractiveStepCard: React.FC<{ step: StepDefinition, isLast: boolean, state: WorkflowStepState, isExecuting: boolean, onExecute: (stepId: number, instruction: string) => void }> = ({ step, isLast, state, isExecuting, onExecute }) => {
    const [instruction, setInstruction] = useState('');

    const getStatusStyles = () => {
        switch (state.status) {
            case 'completed': return {
                bubble: 'bg-lime-500 border-lime-300 shadow-[0_0_10px_#84cc16]',
                text: 'text-black font-extrabold',
                cardBorder: 'border-lime-500/50',
            };
            case 'active': return {
                bubble: 'bg-fuchsia-500 border-fuchsia-300 animate-pulse shadow-[0_0_12px_#d946ef]',
                text: 'text-black font-extrabold',
                cardBorder: 'border-fuchsia-500/80',
            };
            case 'error': return {
                bubble: 'bg-red-500 border-red-300 shadow-[0_0_10px_#ef4444]',
                text: 'text-black font-extrabold',
                cardBorder: 'border-red-500/80',
            };
            case 'pending':
            default: return {
                bubble: 'bg-gray-700 border-gray-500',
                text: 'text-gray-900 font-extrabold',
                cardBorder: 'border-fuchsia-500/20',
            };
        }
    }
    
    const { bubble: bubbleClass, text: textClass, cardBorder: cardBorderClass } = getStatusStyles();

    return (
        <div className="relative pl-8">
            {!isLast && <div className="absolute left-3 top-5 h-full w-0.5 bg-gray-700"></div>}
            <div className="absolute left-0 top-2.5">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${bubbleClass}`}>
                     <span className={`text-xs ${textClass}`}>{step.id}</span>
                </div>
            </div>
            <Card className={`mb-4 bg-black/50 backdrop-blur-sm transition-all duration-300 ${cardBorderClass} ${state.status === 'pending' ? 'opacity-60' : 'opacity-100'}`}>
                <div className="p-4">
                    <p className="text-sm text-gray-400 font-mono mb-1">{step.name}</p>
                    <h4 className="font-semibold text-lg text-gray-200">{step.agent} &rarr; <span className="text-fuchsia-400">{step.verb}</span></h4>
                    <div className="mt-3 text-xs font-mono text-gray-400 space-y-2 bg-black/50 p-3 rounded-md border border-gray-700">
                        <p><span className="text-gray-500 w-16 inline-block">INPUT:</span> {step.input}</p>
                        <p><span className="text-gray-500 w-16 inline-block">OUTPUT:</span> {step.output}</p>
                        <p><span className="text-gray-500 w-16 inline-block">HANDOVER:</span> <span className="font-bold text-blue-400">{step.handover_to}</span></p>
                    </div>

                    {state.status === 'active' && (
                        <div className="mt-4 pt-4 border-t border-fuchsia-500/20">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Instructions for {step.agent}:</label>
                            <textarea
                              value={instruction}
                              onChange={(e) => setInstruction(e.target.value)}
                              placeholder={`e.g., Draft a witty tweet about our new feature...`}
                              className="w-full p-2 bg-gray-900/70 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm h-24"
                              disabled={isExecuting}
                            />
                             <Button size="md" className="w-full mt-2" onClick={() => onExecute(step.id, instruction)} disabled={isExecuting || !instruction}>
                                {isExecuting ? React.cloneElement(ICONS.SPINNER, {className: 'mr-2 h-5 w-5'}) : null}
                                {isExecuting ? 'Delegating...' : `Delegate to ${step.agent}`}
                             </Button>
                        </div>
                    )}
                    
                    {state.output && (
                         <div className="mt-4 pt-4 border-t border-fuchsia-500/20">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Result:</h5>
                            <div className="bg-black/50 p-3 rounded-md">
                               <ResponseRenderer content={state.output} />
                               {isExecuting && <span className="inline-block w-2 h-4 bg-fuchsia-400 animate-pulse ml-1"></span>}
                            </div>
                         </div>
                    )}

                    {state.status === 'error' && state.error && (
                        <div className="mt-4 text-pink-400 bg-pink-900/50 p-3 rounded-md font-mono text-xs">
                           <strong>Error:</strong> {state.error}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}


export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ yamlString, onWorkflowParsed, workflowState, isExecutingStepId, onExecuteStep }) => {
  const [data, setData] = useState<WorkflowDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentPage, setAgentPage] = useState(0);
  const AGENTS_PER_PAGE = 4;

  useEffect(() => {
    if (!yamlString) {
        setData(null);
        setError(null);
        onWorkflowParsed(null);
        return;
    };
    try {
      const yamlMatch = yamlString.match(/```yaml\n([\s\S]*?)\n```/);
      const yamlContent = yamlMatch ? yamlMatch[1] : yamlString;
      
      const parsed = yaml.load(yamlContent) as WorkflowDefinition;
      if (parsed && typeof parsed === 'object' && parsed.meta && parsed.agents && parsed.steps) {
        setData(parsed);
        setError(null);
        onWorkflowParsed(parsed);
      } else {
         setError('Waiting for valid YAML structure...');
         setData(null);
         onWorkflowParsed(null);
      }
    } catch (e) {
      setError(e instanceof Error ? `YAML Parsing Error: ${e.message}` : 'An unknown parsing error occurred.');
      setData(null);
      onWorkflowParsed(null);
    }
  }, [yamlString, onWorkflowParsed]);

  if (error) {
    return <div className="text-yellow-400 bg-yellow-900/50 p-4 rounded-md font-mono text-xs">{error}</div>;
  }

  if (!data) {
    return <div className="text-gray-500">Parsing generated workflow...</div>;
  }
  
  const agentEntries = Object.entries(data.agents);
  const paginatedAgents = agentEntries.slice(agentPage * AGENTS_PER_PAGE, (agentPage + 1) * AGENTS_PER_PAGE);
  const totalAgentPages = Math.ceil(agentEntries.length / AGENTS_PER_PAGE);

  return (
    <div className="space-y-8">
      <div>
        <Card>
            <div className="p-4">
                <h3 className="text-xl font-bold text-fuchsia-300">{data.meta.flow_name}</h3>
                <p className="text-sm text-gray-400 mt-1">Owned by <span className="font-semibold text-gray-300">{data.meta.owner}</span></p>
                <p className="mt-3 text-gray-300">{data.meta.description}</p>
            </div>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-blue-400">Agents on Deck</h3>
            {totalAgentPages > 1 && (
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setAgentPage(p => Math.max(0, p - 1))} disabled={agentPage === 0}>Prev</Button>
                    <span className="text-xs text-gray-400">{agentPage + 1} / {totalAgentPages}</span>
                    <Button size="sm" variant="secondary" onClick={() => setAgentPage(p => Math.min(totalAgentPages - 1, p + 1))} disabled={agentPage === totalAgentPages - 1}>Next</Button>
                </div>
            )}
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-48">
          {paginatedAgents.map(([name, agent]) => (
            <AgentCard key={name} name={name} agent={agent} />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-fuchsia-400 mb-3">Execution Flow</h3>
        <div>
            {data.steps.map((step, index) => (
                <InteractiveStepCard 
                    key={step.id} 
                    step={step} 
                    isLast={index === data.steps.length - 1} 
                    state={workflowState[step.id]}
                    isExecuting={isExecutingStepId === step.id}
                    onExecute={onExecuteStep}
                />
            ))}
        </div>
      </div>
    </div>
  );
};