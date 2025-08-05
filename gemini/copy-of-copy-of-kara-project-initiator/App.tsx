import React, { useState, useCallback, useMemo } from 'react';
import { ProjectDetails, Workflow, LivePreviewLayout } from './types';
import { TEMPLATES } from './templates';
import { ResizablePanels } from './components/ui/ResizablePanels';
import { Tabs, Tab } from './components/ui/Tabs';
import { generateWorkflow, generateLivePreviewLayout, generateCodeFromPreview } from './services/geminiService';
import { idbSet } from './idb';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProjectForm from './components/ProjectForm';
import WorkflowDisplay from './components/WorkflowDisplay';
import { SimulationView } from './components/SimulationView';
import { PreviewHost } from './components/PreviewHost';
import { CodePreview } from './components/CodePreview';
import PreviewLauncher from './components/PreviewLauncher';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import FloatingOrb from './components/FloatingOrb';

// Icons
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { EyeIcon } from './components/icons/EyeIcon';
import { CodeBracketIcon } from './components/icons/CodeBracketIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';

type View = 'config' | 'simulation' | 'livePreview' | 'codePreview';
type AiStatus = 'Idle' | 'Busy' | 'Error';

const App: React.FC = () => {
    const [view, setView] = useState<View>('config');
    const [projectDetails, setProjectDetails] = useState<ProjectDetails>(TEMPLATES.custom.details);
    
    // State for generated assets
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [livePreview, setLivePreview] = useState<LivePreviewLayout | null>(null);
    const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

    // Loading and error states
    const [workflowLoading, setWorkflowLoading] = useState(false);
    const [workflowError, setWorkflowError] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeError, setCodeError] = useState<string | null>(null);

    const aiStatus: AiStatus = useMemo(() => {
        if (workflowLoading || previewLoading || codeLoading) return 'Busy';
        if (workflowError || previewError || codeError) return 'Error';
        return 'Idle';
    }, [workflowLoading, previewLoading, codeLoading, workflowError, previewError, codeError]);

    const handleDetailsChange = useCallback((newDetails: Partial<ProjectDetails>) => {
        setProjectDetails(prev => ({ ...prev, ...newDetails }));
    }, []);

    const handleTemplateChange = useCallback((templateId: string) => {
        const template = TEMPLATES[templateId as keyof typeof TEMPLATES];
        if (template) {
            setProjectDetails(template.details);
            setWorkflow(template.workflow || null);
            setLivePreview(null);
            setHasGeneratedCode(false);
            // Clear stored data for old project
            localStorage.removeItem('kara-preview-data');
            localStorage.removeItem('kara-project-details');
            idbSet(projectDetails.overview.projectName, null);
        }
    }, [projectDetails.overview.projectName]);

    const handleGenerateWorkflow = useCallback(async () => {
        setWorkflowLoading(true);
        setWorkflowError(null);
        try {
            const result = await generateWorkflow(projectDetails);
            setWorkflow(result);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred';
            setWorkflowError(message);
        } finally {
            setWorkflowLoading(false);
        }
    }, [projectDetails]);
    
    const handleGeneratePreview = useCallback(async () => {
        setPreviewLoading(true);
        setPreviewError(null);
        try {
            const result = await generateLivePreviewLayout(projectDetails);
            setLivePreview(result);
            localStorage.setItem('kara-preview-data', JSON.stringify(result));
            localStorage.setItem('kara-project-details', JSON.stringify(projectDetails));
            setHasGeneratedCode(false); // New preview means code is outdated
            idbSet(projectDetails.overview.projectName, null); // Clear old code
        } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred';
            setPreviewError(message);
        } finally {
            setPreviewLoading(false);
        }
    }, [projectDetails]);

    const handleGenerateCode = useCallback(async () => {
        if (!livePreview) {
            setCodeError("Please generate a UI Preview first.");
            return;
        }
        setCodeLoading(true);
        setCodeError(null);
        try {
            const result = await generateCodeFromPreview(livePreview, projectDetails.overview.projectName);
            await idbSet(projectDetails.overview.projectName, result);
            setHasGeneratedCode(true);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred';
            setCodeError(message);
        } finally {
            setCodeLoading(false);
        }
    }, [livePreview, projectDetails]);


    const renderConfigView = () => (
        <ResizablePanels
            leftPanel={
                <div className="h-full overflow-y-auto p-4 lg:p-6">
                    <ProjectForm
                        projectDetails={projectDetails}
                        onDetailsChange={handleDetailsChange}
                        onTemplateChange={handleTemplateChange}
                        onGenerate={handleGenerateWorkflow}
                        isLoading={workflowLoading}
                    />
                </div>
            }
            rightPanel={
                <div className="h-full overflow-y-auto p-4 lg:p-6">
                    <Tabs>
                        <Tab label="Workflow" icon={<DocumentTextIcon className="w-5 h-5"/>}>
                            <WorkflowDisplay
                                workflow={workflow}
                                error={workflowError}
                                onStartSimulation={() => setView('simulation')}
                            />
                        </Tab>
                        <Tab label="UI Preview" icon={<EyeIcon className="w-5 h-5"/>}>
                             <PreviewLauncher 
                                hasPreviewData={!!livePreview}
                                isLoading={previewLoading}
                                error={previewError}
                                onGenerate={handleGeneratePreview}
                                onOpen={() => setView('livePreview')}
                             />
                        </Tab>
                        <Tab label="Code Gen" icon={<CodeBracketIcon className="w-5 h-5"/>}>
                             <Card>
                                 <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
                                     <CodeBracketIcon className="w-12 h-12 text-dark-base-300 mb-4" />
                                     <h3 className="text-lg font-semibold">Generate Code</h3>
                                     <p className="text-sm text-dark-base-content/70 max-w-xs mt-1 mb-4">Create runnable HTML, CSS, and JS from the UI Preview.</p>
                                     {codeError && <p className="text-red-400/90 bg-red-900/20 p-3 rounded-md text-sm my-2">{codeError}</p>}
                                     
                                     {!hasGeneratedCode ? (
                                        <Button onClick={handleGenerateCode} disabled={!livePreview || codeLoading} className="!py-2 !px-4 text-sm">
                                            {codeLoading ? <><SpinnerIcon className="w-5 h-5 animate-spin mr-2"/>Generating...</> : <><SparklesIcon className="w-4 h-4 mr-2"/>Generate Code</>}
                                        </Button>
                                     ) : (
                                         <div className="flex gap-2">
                                            <Button onClick={() => setView('codePreview')} className="!py-2 !px-4 text-sm">View Code</Button>
                                            <Button onClick={handleGenerateCode} disabled={codeLoading} title="Regenerate Code" className="!p-2.5 text-sm !font-bold bg-dark-base-300 hover:bg-dark-base-300/80 text-dark-base-content/80">
                                                <SparklesIcon className="w-4 h-4 text-brand-secondary" />
                                            </Button>
                                         </div>
                                     )}
                                 </div>
                             </Card>
                        </Tab>
                    </Tabs>
                </div>
            }
        />
    );
    
    const renderContent = () => {
        switch(view) {
            case 'simulation':
                // The marketing video is the only one with a pre-canned simulation
                const marketingTemplate = TEMPLATES['marketing-video'];
                return <SimulationView 
                            projectDetails={marketingTemplate.details} 
                            workflow={marketingTemplate.workflow!} 
                            onEndSimulation={() => setView('config')} 
                        />;
            case 'livePreview':
                return <PreviewHost onClose={() => setView('config')} />;
            case 'codePreview':
                return <CodePreview projectName={projectDetails.overview.projectName} onClose={() => setView('config')} />;
            case 'config':
            default:
                return renderConfigView();
        }
    }

    return (
        <div className="min-h-screen bg-dark-base-100 text-dark-base-content font-sans flex flex-col overflow-hidden">
            <Header />
            <main className="flex-grow flex flex-col" style={{ paddingTop: '4rem', paddingBottom: '3rem', minHeight: 0, height: '100vh' }}>
                {renderContent()}
            </main>
            <Footer apiStatus={aiStatus} />
            <FloatingOrb
                currentView={view}
                setView={setView}
                canSimulate={projectDetails.templateId === 'marketing-video'}
                canPreview={!!livePreview}
                canCode={hasGeneratedCode}
            />
        </div>
    );
};

export default App;