import React, { useState, useMemo } from 'react';
import { ProjectDetails, Workflow } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SimulationViewProps {
  projectDetails: ProjectDetails;
  workflow: Workflow;
  onEndSimulation: () => void;
}

const SIMULATION_LOGS = [
    "Initializing task for agent Lyra... Parsing brand assets from 'assets/latest.zip'. Data normalization protocols engaged.",
    "Engaging fine-tuning model for Kara. Applying training parameters: epochs=3, lr=5e-6. Generating promo script with citation markers.",
    "Sophia now active. Converting 'promo_script.md' to visual storyboard. Initiating draft renders. Handing off to Cecilia.",
    "Cecilia orchestrating render farm. Scheduling job with high priority. Output target: 'final_video.mp4'. Monitoring queue.",
    "Stan receiving 'final_video.mp4'. Packaging final assets, compressing, and tagging release build. Generating checksums.",
    "Dude is now crafting launch narrative. Analyzing 'release_build.zip' for key features. Preparing ROI deck and press materials.",
    "Final package 'launch_assets/' submitted to ANDIE for executive review. Awaiting SIGNOFF. Project nearing completion.",
];

export const SimulationView: React.FC<SimulationViewProps> = ({ projectDetails, workflow, onEndSimulation }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const currentStep = workflow.workflow[currentStepIndex];
    const currentAgent = useMemo(() => 
        projectDetails.agents?.find(a => a.name === currentStep.agentName),
    [projectDetails.agents, currentStep.agentName]);

    const handleNext = () => {
        setCurrentStepIndex(prev => Math.min(prev + 1, workflow.workflow.length - 1));
    }
    const handlePrev = () => {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    }
    const handleStepSelect = (index: number) => {
        setCurrentStepIndex(index);
    }

    return (
        <div className="container mx-auto p-4 lg:p-8">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark-base-content">Simulation Mode</h1>
                    <p className="text-dark-base-content/70">Interactive walkthrough for: <span className="font-semibold text-brand-primary">{workflow.projectName}</span></p>
                </div>
                <Button onClick={onEndSimulation} className="!py-2 !px-4 text-sm bg-dark-base-200 hover:bg-dark-base-300 text-dark-base-content/80 !font-medium">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Configuration
                </Button>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Agents Column */}
                <aside className="lg:col-span-3">
                    <Card className="sticky top-24">
                        <h3 className="font-bold text-lg mb-4">AI Agent Roster</h3>
                        <ul className="space-y-3">
                            {projectDetails.agents?.map(agent => (
                                <li key={agent.name} className={`p-3 rounded-lg transition-all duration-300 ${agent.name === currentAgent?.name ? 'bg-brand-secondary/20 border-l-4 border-brand-secondary shadow-glow-pink' : 'bg-dark-base-200/30'}`}>
                                    <p className="font-semibold text-dark-base-content">{agent.name}</p>
                                    <p className="text-sm text-dark-base-content/70">{agent.role}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </aside>
                
                {/* Workflow Column */}
                <section className="lg:col-span-5">
                    <Card>
                        <h3 className="font-bold text-lg mb-4">Workflow Orchestration</h3>
                        <div className="relative">
                            {/* Dotted line */}
                             <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-dark-base-300/50 rounded-full"></div>
                             <ul className="space-y-2">
                                {workflow.workflow.map((step, index) => (
                                    <li key={step.phaseName} onClick={() => handleStepSelect(index)} className="flex items-start space-x-4 p-2 rounded-lg cursor-pointer hover:bg-dark-base-300/30 transition-colors">
                                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${index <= currentStepIndex ? `bg-brand-primary text-black font-bold ${index === currentStepIndex ? 'shadow-glow-blue' : ''}` : 'bg-dark-base-300'}`}>
                                           {index < currentStepIndex ? (
                                             <CheckCircleIcon className="w-5 h-5" />
                                           ) : (
                                            <span className={`${index === currentStepIndex ? '' : 'text-dark-base-content/70'}`}>{index + 1}</span>
                                           )}
                                        </div>
                                        <div>
                                            <p className={`font-semibold transition-colors ${index === currentStepIndex ? 'text-brand-primary' : 'text-dark-base-content'}`}>{step.phaseName}</p>
                                            <p className="text-sm text-dark-base-content/60">{step.agentName ? `Handled by ${step.agentName}` : ''}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </section>
                
                {/* Execution Column */}
                <section className="lg:col-span-4">
                    <Card className="sticky top-24">
                        <h3 className="font-bold text-lg mb-2">Current Task: <span className="text-brand-primary">{currentStep.phaseName}</span></h3>
                        <div className="mb-4 p-3 bg-dark-base-200/50 rounded-lg">
                            <p className="font-semibold">Active Agent: <span className="font-normal text-dark-base-content">{currentAgent?.name || 'N/A'}</span></p>
                            <p className="font-semibold">Role: <span className="font-normal text-dark-base-content/80">{currentAgent?.role || 'N/A'}</span></p>
                        </div>

                        <h4 className="font-semibold mb-2">Activities & Handoffs:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm bg-dark-base-200/50 p-3 rounded-lg mb-4">
                            {currentStep.activities.map((activity, i) => <li key={i}>{activity}</li>)}
                        </ul>
                        
                         <h4 className="font-semibold mb-2">Simulated Log:</h4>
                         <div className="font-mono text-xs bg-black/80 p-3 rounded-lg h-32 overflow-y-auto text-brand-accent/80 border border-dark-base-300/50 shadow-inner">
                             <p className="whitespace-pre-wrap">&gt; {SIMULATION_LOGS[currentStepIndex] || "Waiting for task..."}</p>
                         </div>

                        <div className="flex justify-between mt-6">
                            <Button onClick={handlePrev} disabled={currentStepIndex === 0} className="!py-2 !px-4 text-sm bg-dark-base-300 hover:bg-dark-base-300/80 text-dark-base-content/80 !font-medium">
                                <ChevronLeftIcon className="w-5 h-5 mr-1"/> Prev
                            </Button>
                            <Button onClick={handleNext} disabled={currentStepIndex === workflow.workflow.length - 1} className="!py-2 !px-4 text-sm">
                                Next <ChevronRightIcon className="w-5 h-5 ml-1"/>
                            </Button>
                        </div>
                    </Card>
                </section>
            </main>
        </div>
    );
};