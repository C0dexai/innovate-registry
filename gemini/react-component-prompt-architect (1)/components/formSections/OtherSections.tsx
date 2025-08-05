import React, { PropsWithChildren } from 'react';
import Section from '../Section';
import { InputField, TextAreaField } from '../shared/InputField';
import { PlusIcon, TrashIcon } from '../icons';
import AiHint from '../shared/AiHint';
import AiSectionHint from '../shared/AiSectionHint';
import { Type } from '@google/genai';
import type { FullPromptState, StateVariable, SideEffect, UserInteraction, EventEmitter, ConditionalRender } from '../../types';

// Generic item editor component
const ItemEditor = <T extends { id: string },>({
  item,
  onUpdate,
  onRemove,
  children,
  title,
}: PropsWithChildren<{
  item: T;
  onUpdate: (updatedItem: T) => void;
  onRemove: () => void;
  title: string;
}>) => (
  <div className="glass-card p-4 rounded-lg border border-[var(--border-color)] space-y-4">
    <div className="flex justify-between items-center">
      <h4 className="font-bold text-lg text-[var(--color-primary-hover)]">{title}</h4>
      <button
        onClick={onRemove}
        className="p-1 text-[var(--color-accent-pink)] hover:text-white hover:bg-[var(--color-accent-pink)] rounded-full transition-colors"
        aria-label={`Remove ${title}`}
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
    {children}
  </div>
);


// Generic Section for adding/removing items
const DynamicListSection = <T extends { id: string },>({
  items,
  setItems,
  newItemFactory,
  renderItem,
  buttonText,
}: {
  items: T[];
  setItems: (items: T[]) => void;
  newItemFactory: () => T;
  renderItem: (item: T, onUpdate: (updated: T) => void, onRemove: () => void) => React.ReactNode;
  buttonText: string;
}) => {
  const addItem = () => setItems([...items, newItemFactory()]);
  
  const updateItem = (index: number, updatedItem: T) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
         {renderItem(item, (updated) => updateItem(index, updated), () => removeItem(index))}
        </React.Fragment>
      ))}
      <button
        onClick={addItem}
        className="mt-2 flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] text-black font-semibold rounded-md shadow-md transition-all transform hover:scale-105"
      >
        <PlusIcon className="w-5 h-5" />
        {buttonText}
      </button>
    </div>
  );
};


// State Section
export const StateSection: React.FC<{ state: FullPromptState['state']; setState: (s: FullPromptState['state']) => void; identity: FullPromptState['identity'] }> = ({ state, setState, identity }) => (
  <Section title="III. Internal Logic & State" description="Describe internal state, side effects, and any performance optimizations.">
    <AiSectionHint
        buttonText="Suggest State & Effects with AI"
        createPrompt={() => `You are a React component architect. For a component named "${identity.name}" described as "${identity.description}", suggest necessary internal state variables (useState), side effects (useEffect), and potential performance optimizations or custom hooks. Focus on common patterns for this type of component.`}
        responseSchema={{
          type: Type.OBJECT,
          properties: {
            variables: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, initialValue: {type: Type.STRING}, hook: {type: Type.STRING}, purpose: {type: Type.STRING}, transitions: {type: Type.STRING} } } },
            effects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, dependencies: {type: Type.STRING}, cleanup: {type: Type.STRING} } } },
            optimizations: { type: Type.STRING },
            customHooks: { type: Type.STRING },
          }
        }}
        onSuggestion={(suggestion: any) => {
            setState({
                ...state,
                variables: [...state.variables, ...suggestion.variables.map((v: any) => ({...v, id: crypto.randomUUID()}))],
                effects: [...state.effects, ...suggestion.effects.map((e: any) => ({...e, id: crypto.randomUUID()}))],
                optimizations: state.optimizations ? `${state.optimizations}\n${suggestion.optimizations}` : suggestion.optimizations,
                customHooks: state.customHooks ? `${state.customHooks}\n${suggestion.customHooks}` : suggestion.customHooks,
            });
        }}
         className="my-0 mb-4 pt-0 border-none"
    />
    <h3 className="text-xl font-semibold text-[var(--color-text)] border-b border-[var(--color-primary)]/50 pb-2">State Variables</h3>
    <DynamicListSection<StateVariable>
        items={state.variables}
        setItems={(vars) => setState({ ...state, variables: vars })}
        newItemFactory={() => ({ id: crypto.randomUUID(), name: '', initialValue: '', hook: 'useState', purpose: '', transitions: '' })}
        buttonText="Add State Variable"
        renderItem={(item, onUpdate, onRemove) => (
            <ItemEditor item={item} onUpdate={onUpdate} onRemove={onRemove} title={item.name || "New State Variable"}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Name" value={item.name} onChange={e => onUpdate({...item, name: e.target.value})} />
                    <InputField label="Initial Value" value={item.initialValue} onChange={e => onUpdate({...item, initialValue: e.target.value})} />
                    <InputField label="Hook" value={item.hook} onChange={e => onUpdate({...item, hook: e.target.value})} />
                </div>
                <TextAreaField label="Purpose" value={item.purpose} onChange={e => onUpdate({...item, purpose: e.target.value})} />
                <TextAreaField label="Transitions" value={item.transitions} onChange={e => onUpdate({...item, transitions: e.target.value})} />
            </ItemEditor>
        )}
    />
    <h3 className="text-xl font-semibold text-[var(--color-text)] border-b border-[var(--color-primary)]/50 pb-2 mt-6">Side Effects (`useEffect`)</h3>
     <DynamicListSection<SideEffect>
        items={state.effects}
        setItems={(effects) => setState({ ...state, effects: effects })}
        newItemFactory={() => ({ id: crypto.randomUUID(), description: '', dependencies: '', cleanup: ''})}
        buttonText="Add Side Effect"
        renderItem={(item, onUpdate, onRemove) => (
            <ItemEditor item={item} onUpdate={onUpdate} onRemove={onRemove} title={"New Effect"}>
                <TextAreaField label="Description" value={item.description} onChange={e => onUpdate({...item, description: e.target.value})} />
                <InputField label="Dependencies" value={item.dependencies} onChange={e => onUpdate({...item, dependencies: e.target.value})} placeholder="e.g., propName, stateName" />
                <InputField label="Cleanup Logic" value={item.cleanup} onChange={e => onUpdate({...item, cleanup: e.target.value})} />
            </ItemEditor>
        )}
    />
    <div className="mt-6">
      <TextAreaField label="Performance Optimizations" value={state.optimizations} onChange={e => setState({...state, optimizations: e.target.value})} placeholder="e.g., useMemo for expensive calculations, useCallback for event handlers" />
    </div>
     <div className="mt-6">
      <TextAreaField label="Custom Hooks" value={state.customHooks} onChange={e => setState({...state, customHooks: e.target.value})} placeholder="e.g., useToggle for internal boolean state logic" />
    </div>
  </Section>
);

// Interactions Section
export const InteractionsSection: React.FC<{ interactions: FullPromptState['interactions']; setInteractions: (i: FullPromptState['interactions']) => void; identity: FullPromptState['identity'] }> = ({ interactions, setInteractions, identity }) => (
    <Section title="IV. Behavior & Interactions" description="Define user interactions, event handlers, and conditional rendering logic.">
      <AiSectionHint
        buttonText="Suggest Interactions with AI"
        createPrompt={() => `You are a React component architect. For a component named "${identity.name}" described as "${identity.description}", suggest common user interactions, event emitters (prop callbacks), and conditional rendering logic.`}
        responseSchema={{
          type: Type.OBJECT,
          properties: {
            userInteractions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING} } } },
            eventEmitters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, arguments: {type: Type.STRING}, trigger: {type: Type.STRING} } } },
            conditionalRendering: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, condition: {type: Type.STRING} } } },
          }
        }}
        onSuggestion={(suggestion: any) => {
          setInteractions({
            userInteractions: [...interactions.userInteractions, ...suggestion.userInteractions.map((i: any) => ({...i, id: crypto.randomUUID()}))],
            eventEmitters: [...interactions.eventEmitters, ...suggestion.eventEmitters.map((e: any) => ({...e, id: crypto.randomUUID()}))],
            conditionalRendering: [...interactions.conditionalRendering, ...suggestion.conditionalRendering.map((c: any) => ({...c, id: crypto.randomUUID()}))],
          });
        }}
        className="my-0 mb-4 pt-0 border-none"
      />
      <h3 className="text-xl font-semibold text-[var(--color-text)] border-b border-[var(--color-primary)]/50 pb-2">User Interactions</h3>
      <DynamicListSection<UserInteraction>
          items={interactions.userInteractions}
          setItems={userInteractions => setInteractions({ ...interactions, userInteractions })}
          newItemFactory={() => ({ id: crypto.randomUUID(), description: '' })}
          buttonText="Add User Interaction"
          renderItem={(item, onUpdate, onRemove) => (
            <ItemEditor item={item} onUpdate={onUpdate} onRemove={onRemove} title="New Interaction">
                <InputField label="Interaction Description" value={item.description} onChange={e => onUpdate({...item, description: e.target.value})} placeholder="e.g., Clicking the primary button"/>
            </ItemEditor>
          )}
      />

      <h3 className="text-xl font-semibold text-[var(--color-text)] border-b border-[var(--color-primary)]/50 pb-2 mt-6">Event Emitters</h3>
       <DynamicListSection<EventEmitter>
          items={interactions.eventEmitters}
          setItems={eventEmitters => setInteractions({ ...interactions, eventEmitters })}
          newItemFactory={() => ({ id: crypto.randomUUID(), name: '', arguments: '', trigger: '' })}
          buttonText="Add Event Emitter"
          renderItem={(item, onUpdate, onRemove) => (
            <ItemEditor item={item} onUpdate={onUpdate} onRemove={onRemove} title={item.name || 'New Event'}>
                <InputField label="Prop Name" value={item.name} onChange={e => onUpdate({...item, name: e.target.value})} placeholder="e.g., onConfirm"/>
                <InputField label="Arguments" value={item.arguments} onChange={e => onUpdate({...item, arguments: e.target.value})} placeholder="e.g., event, value"/>
                <TextAreaField label="Trigger Condition" value={item.trigger} onChange={e => onUpdate({...item, trigger: e.target.value})} placeholder="e.g., When the user clicks the save button"/>
            </ItemEditor>
          )}
      />

      <h3 className="text-xl font-semibold text-[var(--color-text)] border-b border-[var(--color-primary)]/50 pb-2 mt-6">Conditional Rendering</h3>
       <DynamicListSection<ConditionalRender>
          items={interactions.conditionalRendering}
          setItems={conditionalRendering => setInteractions({ ...interactions, conditionalRendering })}
          newItemFactory={() => ({ id: crypto.randomUUID(), description: '', condition: '' })}
          buttonText="Add Conditional Render"
          renderItem={(item, onUpdate, onRemove) => (
            <ItemEditor item={item} onUpdate={onUpdate} onRemove={onRemove} title="New Render Condition">
                <InputField label="Renders..." value={item.description} onChange={e => onUpdate({...item, description: e.target.value})} placeholder="e.g., a loading spinner"/>
                <InputField label="When..." value={item.condition} onChange={e => onUpdate({...item, condition: e.target.value})} placeholder="e.g., isLoading is true"/>
            </ItemEditor>
          )}
      />
    </Section>
);

// Visuals Section
export const VisualsSection: React.FC<{ 
  visuals: FullPromptState['visuals']; 
  setVisuals: (v: FullPromptState['visuals']) => void;
  identity: FullPromptState['identity'];
}> = ({ visuals, setVisuals, identity }) => (
    <Section title="V. Visuals & Structure" description="Suggest HTML structure, styling approach, and basic layout.">
        <AiSectionHint
            buttonText="Suggest Visual Strategy with AI"
            createPrompt={() => `You are a UI/UX architect. For a component named "${identity.name}" described as "${identity.description}", suggest a list of primary semantic HTML elements, a styling strategy, and basic layout cues.`}
            responseSchema={{
                type: Type.OBJECT,
                properties: {
                    htmlElements: { type: Type.STRING },
                    styling: { type: Type.STRING },
                    layout: { type: Type.STRING }
                }
            }}
            onSuggestion={(suggestion: FullPromptState['visuals']) => {
                setVisuals({
                    ...visuals,
                    htmlElements: visuals.htmlElements ? `${visuals.htmlElements}, ${suggestion.htmlElements}` : suggestion.htmlElements,
                    styling: suggestion.styling,
                    layout: visuals.layout ? `${visuals.layout}\n${suggestion.layout}` : suggestion.layout,
                });
            }}
            className="my-0 mb-4 pt-0 border-none"
        />
        <InputField 
            label="Primary Semantic HTML Elements" 
            value={visuals.htmlElements} 
            onChange={e => setVisuals({...visuals, htmlElements: e.target.value})} 
            placeholder="e.g., <dialog>, <section>, <button>"
            hint={
                <AiHint
                    createPrompt={() => `You are a UI/UX engineer. For a component named "${identity.name || 'a generic component'}" described as "${identity.description || 'no description'}", what primary semantic HTML elements would you suggest for its structure? List a few comma-separated elements. For example, for a "ModalDialog", you might suggest "<dialog>, <section>, <header>, <button>". Return ONLY the comma-separated list of tags.`}
                    onHint={(hint) => setVisuals({...visuals, htmlElements: hint})}
                />
            }
        />
        <TextAreaField 
            label="Styling Strategy" 
            value={visuals.styling} 
            onChange={e => setVisuals({...visuals, styling: e.target.value})} 
            placeholder="e.g., Use Tailwind CSS for all styling."
            hint={
                <AiHint
                    createPrompt={() => `You are a frontend architect. Suggest a concise styling strategy for a new React component. Consider approaches like CSS Modules, Styled Components, Tailwind CSS, or inline styles for dynamic properties. Keep the suggestion to one or two sentences. For example: "Utilize CSS Modules for scoped component styles, and use inline styles for dynamic properties passed via props like 'width' or 'color'.". Return ONLY the strategy text.`}
                    onHint={(hint) => setVisuals({...visuals, styling: hint})}
                />
            }
        />
        <TextAreaField label="Basic Layout Cues" value={visuals.layout} onChange={e => setVisuals({...visuals, layout: e.target.value})} placeholder="e.g., Content should be vertically centered."/>
    </Section>
);

// Robustness Section
export const RobustnessSection: React.FC<{ robustness: FullPromptState['robustness']; setRobustness: (r: FullPromptState['robustness']) => void; identity: FullPromptState['identity'] }> = ({ robustness, setRobustness, identity }) => (
    <Section title="VI. Robustness & Reusability" description="Consider accessibility, error handling, edge cases, and testing.">
        <AiSectionHint
            buttonText="Suggest Robustness Strategy with AI"
            createPrompt={() => `You are a senior frontend engineer. For a component named "${identity.name}" described as "${identity.description}", suggest a comprehensive strategy for robustness. Provide specific, actionable advice for accessibility, error handling, loading states, potential edge cases, and key areas to focus on for testing.`}
            responseSchema={{
                type: Type.OBJECT,
                properties: {
                    accessibility: { type: Type.STRING },
                    errorHandling: { type: Type.STRING },
                    loadingStates: { type: Type.STRING },
                    edgeCases: { type: Type.STRING },
                    testing: { type: Type.STRING }
                }
            }}
            onSuggestion={(suggestion: FullPromptState['robustness']) => {
                setRobustness({
                    accessibility: robustness.accessibility ? `${robustness.accessibility}\n${suggestion.accessibility}` : suggestion.accessibility,
                    errorHandling: robustness.errorHandling ? `${robustness.errorHandling}\n${suggestion.errorHandling}` : suggestion.errorHandling,
                    loadingStates: robustness.loadingStates ? `${robustness.loadingStates}\n${suggestion.loadingStates}` : suggestion.loadingStates,
                    edgeCases: robustness.edgeCases ? `${robustness.edgeCases}\n${suggestion.edgeCases}` : suggestion.edgeCases,
                    testing: robustness.testing ? `${robustness.testing}\n${suggestion.testing}` : suggestion.testing
                });
            }}
            className="my-0 mb-4 pt-0 border-none"
        />
        <TextAreaField label="Accessibility (A11y)" value={robustness.accessibility} onChange={e => setRobustness({...robustness, accessibility: e.target.value})} placeholder="e.g., ARIA roles, keyboard navigation"/>
        <TextAreaField label="Error Handling" value={robustness.errorHandling} onChange={e => setRobustness({...robustness, errorHandling: e.target.value})} placeholder="e.g., Display a fallback UI on prop validation failure"/>
        <TextAreaField label="Loading States" value={robustness.loadingStates} onChange={e => setRobustness({...robustness, loadingStates: e.target.value})} placeholder="e.g., Show a spinner when data is being fetched"/>
        <TextAreaField label="Edge Cases" value={robustness.edgeCases} onChange={e => setRobustness({...robustness, edgeCases: e.target.value})} placeholder="e.g., Handle empty data arrays, very long text strings"/>
        <TextAreaField label="Testing Focus" value={robustness.testing} onChange={e => setRobustness({...robustness, testing: e.target.value})} placeholder="e.g., Prop updates, state transitions, callback invocations"/>
    </Section>
);