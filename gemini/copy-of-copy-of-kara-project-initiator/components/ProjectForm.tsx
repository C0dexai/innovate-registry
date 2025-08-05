
import React, { useState } from 'react';
import { ProjectDetails } from '../types';
import { 
  PROJECT_TYPES, DURATIONS, METHODOLOGIES, BUDGETS, TECH_STACK_OPTIONS, UX_FOCUS_OPTIONS, 
  DETAIL_LEVELS, EXCLUDABLE_PHASES, INDUSTRY_FOCUS_OPTIONS, CLOUD_PROVIDERS, RETENTION_POLICIES, LOG_LEVELS
} from '../constants';
import { generateSuggestions, generateHint } from '../services/geminiService';
import { TEMPLATES } from '../templates';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Slider } from './ui/Slider';
import { Button } from './ui/Button';
import { UserIcon } from './icons/UserIcon';
import { AiIcon } from './icons/AiIcon';
import { SystemIcon } from './icons/SystemIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import AgentGrid from './AgentGrid';
import { Hint } from './Hint';

interface ProjectFormProps {
  projectDetails: ProjectDetails;
  onDetailsChange: (newDetails: Partial<ProjectDetails>) => void;
  onTemplateChange: (templateId: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const SectionHeader: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
  <h3 className="text-lg font-semibold mt-8 border-b border-dark-base-300/50 pb-2 mb-6 flex items-center gap-3 text-dark-base-content">
    {icon} {title}
  </h3>
);

const ProjectForm: React.FC<ProjectFormProps> = ({ projectDetails, onDetailsChange, onTemplateChange, onGenerate, isLoading }) => {
  const [suggestionLoading, setSuggestionLoading] = useState<boolean>(false);
  const [hints, setHints] = useState<Record<string, { text?: string; isLoading: boolean; }>>({});

  const handleOverviewChange = <K extends keyof ProjectDetails['overview']>(field: K, value: ProjectDetails['overview'][K]) => {
    onDetailsChange({ overview: { ...projectDetails.overview, [field]: value } });
  };
  
  const handleUserChange = <K extends keyof ProjectDetails['user']>(field: K, value: ProjectDetails['user'][K]) => {
    onDetailsChange({ user: { ...projectDetails.user, [field]: value } });
  };

  const handleAiChange = <K extends keyof ProjectDetails['ai']>(field: K, value: ProjectDetails['ai'][K]) => {
    onDetailsChange({ ai: { ...projectDetails.ai, [field]: value } });
  };
  
  const handleSystemChange = <K extends keyof ProjectDetails['system']>(field: K, value: ProjectDetails['system'][K]) => {
    onDetailsChange({ system: { ...projectDetails.system, [field]: value } });
  };
  
  const handleMultiSelectChange = (field: keyof ProjectDetails['user'], value: string) => {
    const currentValues = projectDetails.user[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    handleUserChange(field, newValues);
  };

  const handleGenerateSuggestions = async () => {
      setSuggestionLoading(true);
      try {
          const suggestions = await generateSuggestions(projectDetails);
          handleOverviewChange('projectName', suggestions.projectName);
          handleOverviewChange('description', suggestions.description);
          handleUserChange('goals', suggestions.goals.replace(/- /g, ''));
      } catch (error) {
          console.error(`Failed to get suggestions`, error);
          // A user-facing error could be added here, e.g., using an alert or a toast notification library.
      } finally {
          setSuggestionLoading(false);
      }
  };
  
  const handleGetHint = async (fieldId: string) => {
    setHints(prev => ({ ...prev, [fieldId]: { text: prev[fieldId]?.text, isLoading: true } }));
    try {
      const hintText = await generateHint(fieldId, projectDetails);
      setHints(prev => ({ ...prev, [fieldId]: { text: hintText, isLoading: false } }));
    } catch (error) {
      console.error(`Failed to get hint for ${fieldId}`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setHints(prev => ({ ...prev, [fieldId]: { text: `Error: ${errorMessage}`, isLoading: false } }));
    }
  };

  const templateOptions = Object.values(TEMPLATES).map(t => ({ value: t.id, label: t.name }));

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-dark-base-content">Project Definition</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <Select 
            label="Project Template" 
            value={projectDetails.templateId} 
            onChange={(e) => onTemplateChange(e.target.value)} 
            options={templateOptions}
            className="md:col-span-2"
          />
          <Input label="Project Name" value={projectDetails.overview.projectName} onChange={e => handleOverviewChange('projectName', e.target.value)} />
          <div>
            <Select label="Project Type" value={projectDetails.overview.projectType} onChange={e => handleOverviewChange('projectType', e.target.value)} options={PROJECT_TYPES} />
             <Hint
              fieldId="projectType"
              onGetHint={() => handleGetHint('projectType')}
              isLoading={hints.projectType?.isLoading ?? false}
              text={hints.projectType?.text}
            />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Brief Description" value={projectDetails.overview.description} onChange={e => handleOverviewChange('description', e.target.value)} />
          </div>
          
          <div className="md:col-span-2">
            <button 
              onClick={handleGenerateSuggestions} 
              disabled={suggestionLoading || isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-dark-base-content bg-dark-base-300 hover:bg-dark-base-300/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-dark-base-200 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {suggestionLoading ? (
                <><SpinnerIcon className="w-5 h-5 animate-spin"/> Generating Suggestions...</>
              ) : (
                <><SparklesIcon className="w-5 h-5 text-brand-secondary"/> Get AI Suggestions (Name, Description, Goals)</>
              )}
            </button>
          </div>

          <Select label="Expected Duration" value={projectDetails.overview.duration} onChange={e => handleOverviewChange('duration', e.target.value)} options={DURATIONS} />
          <Input type="number" label="Team Size" value={projectDetails.overview.teamSize} onChange={e => handleOverviewChange('teamSize', parseInt(e.target.value, 10))} />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-dark-base-content">Custom Instructions</h2>
        
        {/* User Instructions */}
        <SectionHeader icon={<UserIcon className="w-5 h-5"/>} title="User Instructions" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <Select label="Methodology" value={projectDetails.user.methodology} onChange={e => handleUserChange('methodology', e.target.value)} options={METHODOLOGIES} />
            <Hint
              fieldId="methodology"
              onGetHint={() => handleGetHint('methodology')}
              isLoading={hints.methodology?.isLoading ?? false}
              text={hints.methodology?.text}
            />
          </div>
          <Select label="Budget" value={projectDetails.user.budget} onChange={e => handleUserChange('budget', e.target.value)} options={BUDGETS} />
          <div className="md:col-span-2">
            <Textarea label="Key Deliverables/Goals" value={projectDetails.user.goals} onChange={e => handleUserChange('goals', e.target.value)} />
          </div>
          <Slider label="Security Emphasis" min={1} max={10} value={projectDetails.user.securityEmphasis} onChange={e => handleUserChange('securityEmphasis', parseInt(e.target.value))} />
          <Select label="UX Focus" value={projectDetails.user.uxFocus} onChange={e => handleUserChange('uxFocus', e.target.value)} options={UX_FOCUS_OPTIONS} />
          <Select label="Desired Output Detail Level" value={projectDetails.user.outputDetailLevel} onChange={e => handleUserChange('outputDetailLevel', e.target.value)} options={DETAIL_LEVELS} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark-base-content/80 mb-2">Existing Tech Stack</label>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK_OPTIONS.map(tech => (
                <button key={tech} onClick={() => handleMultiSelectChange('techStack', tech)} className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${projectDetails.user.techStack.includes(tech) ? 'bg-brand-secondary text-black font-semibold shadow-glow-pink' : 'bg-dark-base-300 hover:bg-dark-base-300/80'}`}>
                  {tech}
                </button>
              ))}
            </div>
             <Hint
              fieldId="techStack"
              onGetHint={() => handleGetHint('techStack')}
              isLoading={hints.techStack?.isLoading ?? false}
              text={hints.techStack?.text}
            />
          </div>
        </div>

        {/* AI Team Instructions */}
        <SectionHeader icon={<AiIcon className="w-5 h-5"/>} title="AI Team Instructions" />
        {projectDetails.templateId === 'marketing-video' && projectDetails.agents ? (
          <AgentGrid agents={projectDetails.agents} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <Slider label="KARA's Formality" min={1} max={10} value={projectDetails.ai.formality} onChange={e => handleAiChange('formality', parseInt(e.target.value))} helpText="1=Casual, 10=Formal" />
            <Slider label="KARA's Conciseness" min={1} max={10} value={projectDetails.ai.conciseness} onChange={e => handleAiChange('conciseness', parseInt(e.target.value))} helpText="1=Verbose, 10=Concise" />
            <Slider label="Risk Aversion Level" min={1} max={10} value={projectDetails.ai.riskAversion} onChange={e => handleAiChange('riskAversion', parseInt(e.target.value))} helpText="1=Optimistic, 10=Cautious" />
             <div>
              <Slider label="Innovation vs. Stability" min={1} max={10} value={projectDetails.ai.innovationVsStability} onChange={e => handleAiChange('innovationVsStability', parseInt(e.target.value))} helpText="1=Bleeding Edge, 10=Stable" />
               <Hint
                fieldId="innovationVsStability"
                onGetHint={() => handleGetHint('innovationVsStability')}
                isLoading={hints.innovationVsStability?.isLoading ?? false}
                text={hints.innovationVsStability?.text}
              />
            </div>
            <Select label="Industry Focus Bias" value={projectDetails.ai.industryFocus} onChange={e => handleAiChange('industryFocus', e.target.value)} options={INDUSTRY_FOCUS_OPTIONS} />
             <div className="flex items-center space-x-2">
                <input type="checkbox" id="proposeTooling" checked={projectDetails.ai.proposeTooling} onChange={e => handleAiChange('proposeTooling', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"/>
                <label htmlFor="proposeTooling" className="text-sm text-dark-base-content/80">Propose Specific Tooling?</label>
            </div>
          </div>
        )}

        {/* System Instructions */}
        <SectionHeader icon={<SystemIcon className="w-5 h-5"/>} title="System Instructions" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Default Cloud Provider" value={projectDetails.system.defaultCloudProvider} onChange={e => handleSystemChange('defaultCloudProvider', e.target.value)} options={CLOUD_PROVIDERS} />
            <Select label="Data Retention Policy" value={projectDetails.system.dataRetentionPolicy} onChange={e => handleSystemChange('dataRetentionPolicy', e.target.value)} options={RETENTION_POLICIES} />
            <Select label="Logging Level" value={projectDetails.system.logLevel} onChange={e => handleSystemChange('logLevel', e.target.value)} options={LOG_LEVELS} />
            <div className="md:col-span-2 border-t border-dark-base-300 pt-4 mt-2">
              <p className="text-sm text-dark-base-content/60">Integration settings are for context only and are not functional.</p>
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="jiraEnabled" checked={projectDetails.system.jiraIntegration.enabled} onChange={e => handleSystemChange('jiraIntegration', {...projectDetails.system.jiraIntegration, enabled: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"/>
                <label htmlFor="jiraEnabled" className="text-sm text-dark-base-content/80">Enable Jira Integration</label>
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="githubEnabled" checked={projectDetails.system.githubIntegration.enabled} onChange={e => handleSystemChange('githubIntegration', {...projectDetails.system.githubIntegration, enabled: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"/>
                <label htmlFor="githubEnabled" className="text-sm text--dark-base-content/80">Enable GitHub Integration</label>
            </div>
        </div>
      </Card>

      <div className="mt-6">
        <Button onClick={onGenerate} disabled={isLoading || suggestionLoading} className="w-full">
          {isLoading ? 'Generating...' : 'Generate Project Workflow'}
          <SparklesIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectForm;