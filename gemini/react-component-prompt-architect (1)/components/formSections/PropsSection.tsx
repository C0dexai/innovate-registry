import React from 'react';
import Section from '../Section';
import { InputField, TextAreaField } from '../shared/InputField';
import { PlusIcon, TrashIcon } from '../icons';
import AiSectionHint from '../shared/AiSectionHint';
import { Type } from "@google/genai";
import type { PropDefinition } from '../../types';
import type { FullPromptState } from '../../types';

interface PropsSectionProps {
  props: PropDefinition[];
  setProps: (props: PropDefinition[]) => void;
  identity: FullPromptState['identity'];
}

const PropEditor: React.FC<{
  prop: PropDefinition;
  onUpdate: (updatedProp: PropDefinition) => void;
  onRemove: () => void;
}> = ({ prop, onUpdate, onRemove }) => {
  const handleChange = <K extends keyof PropDefinition>(
    key: K,
    value: PropDefinition[K]
  ) => {
    onUpdate({ ...prop, [key]: value });
  };

  return (
    <div className="glass-card p-4 rounded-lg border border-[var(--border-color)] space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg text-[var(--color-primary-hover)]">{prop.name || 'New Prop'}</h4>
        <button
          onClick={onRemove}
          className="p-1 text-[var(--color-accent-pink)] hover:text-white hover:bg-[var(--color-accent-pink)] rounded-full transition-colors"
          aria-label="Remove Prop"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Prop Name"
          id={`prop-name-${prop.id}`}
          value={prop.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., title"
        />
        <InputField
          label="Type"
          id={`prop-type-${prop.id}`}
          value={prop.type}
          onChange={(e) => handleChange('type', e.target.value)}
          placeholder="e.g., string, number, () => void"
        />
      </div>
      <TextAreaField
        label="Description"
        id={`prop-desc-${prop.id}`}
        value={prop.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="What the prop controls or provides."
      />
      <TextAreaField
        label="Impact on UI/Behavior"
        id={`prop-impact-${prop.id}`}
        value={prop.impact}
        onChange={(e) => handleChange('impact', e.target.value)}
        placeholder="How this prop visually or functionally alters the component."
      />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <input
            type="checkbox"
            id={`prop-required-${prop.id}`}
            checked={prop.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border-color)] bg-[var(--color-background-offset)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <label htmlFor={`prop-required-${prop.id}`} className="text-sm text-[var(--color-text)]">Required</label>
        </div>
        {!prop.required && (
          <InputField
            label="Default Value"
            id={`prop-default-${prop.id}`}
            value={prop.defaultValue}
            onChange={(e) => handleChange('defaultValue', e.target.value)}
            placeholder="e.g., 'default text'"
            className="flex-grow"
          />
        )}
      </div>
    </div>
  );
};


const PropsSection: React.FC<PropsSectionProps> = ({ props, setProps, identity }) => {
  const addProp = () => {
    const newProp: PropDefinition = {
      id: crypto.randomUUID(),
      name: '',
      type: '',
      description: '',
      required: false,
      defaultValue: '',
      impact: '',
    };
    setProps([...props, newProp]);
  };

  const updateProp = (index: number, updatedProp: PropDefinition) => {
    const newProps = [...props];
    newProps[index] = updatedProp;
    setProps(newProps);
  };

  const removeProp = (index: number) => {
    setProps(props.filter((_, i) => i !== index));
  };

  return (
    <Section
      title="II. Component Interface (Props)"
      description="Define the component's API. Add each prop with its name, type, description, and other details."
    >
      <AiSectionHint
        buttonText="Suggest Props with AI"
        createPrompt={() => `You are a React component architect. For a component named "${identity.name || 'unnamed'}" described as "${identity.description || 'no description'}", suggest a list of essential props. Provide the name, a TypeScript type, a description, whether it's required, a sensible default value if not required, and its impact on the component. Avoid suggesting 'children' as a prop.`}
        responseSchema={{
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              required: { type: Type.BOOLEAN },
              defaultValue: { type: Type.STRING },
              impact: { type: Type.STRING },
            },
            required: ['name', 'type', 'description', 'required', 'defaultValue', 'impact']
          }
        }}
        onSuggestion={(suggestedProps: Omit<PropDefinition, 'id'>[]) => {
            const newProps = suggestedProps.map(p => ({...p, id: crypto.randomUUID()}));
            setProps([...props, ...newProps]);
        }}
        className="my-0 mb-4 pt-0 border-none"
      />
      <div className="space-y-4">
        {props.map((prop, index) => (
          <PropEditor
            key={prop.id}
            prop={prop}
            onUpdate={(p) => updateProp(index, p)}
            onRemove={() => removeProp(index)}
          />
        ))}
      </div>
      <button
        onClick={addProp}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black font-bold rounded-md shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] focus:ring-[var(--color-primary-hover)]"
      >
        <PlusIcon className="w-5 h-5" />
        Add Prop
      </button>
    </Section>
  );
};

export default PropsSection;