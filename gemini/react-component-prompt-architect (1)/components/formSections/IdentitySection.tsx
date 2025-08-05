import React from 'react';
import Section from '../Section';
import { InputField, TextAreaField } from '../shared/InputField';
import AiHint from '../shared/AiHint';
import type { FullPromptState } from '../../types';

interface IdentitySectionProps {
  identity: FullPromptState['identity'];
  setIdentity: (identity: FullPromptState['identity']) => void;
}

const IdentitySection: React.FC<IdentitySectionProps> = ({ identity, setIdentity }) => {
  const handleChange = <K extends keyof FullPromptState['identity']>(
    key: K,
    value: FullPromptState['identity'][K]
  ) => {
    setIdentity({ ...identity, [key]: value });
  };

  return (
    <Section
      title="I. Component Identity & Purpose"
      description="Define the component's name, primary function, and its role within a UI."
    >
      <InputField
        label="Component Name"
        id="componentName"
        placeholder="e.g., UserProfileCard"
        value={identity.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <TextAreaField
        label="Brief Description"
        id="description"
        placeholder="A concise sentence explaining the component's primary function."
        value={identity.description}
        onChange={(e) => handleChange('description', e.target.value)}
        hint={
          <AiHint
            createPrompt={() => `You are an expert React architect. For a new React component named "${identity.name || 'unnamed component'}", suggest a brief, one-sentence description for its primary function. Be creative and professional. For example, for "UserProfileCard", suggest "Displays a snapshot of a user's profile information, including their avatar, name, and a short bio.". Return ONLY the description text, without any introductory phrases.`}
            onHint={(hint) => handleChange('description', hint)}
          />
        }
      />
      <TextAreaField
        label="Core Use Case"
        id="useCase"
        placeholder="Describe a typical scenario where this component would be used."
        value={identity.useCase}
        onChange={(e) => handleChange('useCase', e.target.value)}
        hint={
          <AiHint
            createPrompt={() => `You are an expert React architect. For a React component named "${identity.name || 'unnamed component'}" with the description "${identity.description || 'No description yet'}", suggest a typical scenario or core use case. Be specific. For example, for "UserProfileCard", suggest "Ideal for user directories, social media feeds, or team member pages to provide a quick overview of each person.". Return ONLY the use case text, without any introductory phrases.`}
            onHint={(hint) => handleChange('useCase', hint)}
          />
        }
      />
    </Section>
  );
};

export default IdentitySection;