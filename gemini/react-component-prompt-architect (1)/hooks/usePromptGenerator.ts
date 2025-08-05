
import { useMemo } from 'react';
import type { FullPromptState, PropDefinition, StateVariable, SideEffect, UserInteraction, EventEmitter, ConditionalRender } from '../types';

const generatePropsSection = (props: PropDefinition[]) => {
  if (props.length === 0) return '';
  const propDocs = props
    .map(
      (p) => `*   **\`${p.name || 'propName'}\`** (\`${p.type || 'string'}\`):
    *   **Description:** ${p.description || 'No description provided.'}
    *   **Required:** \`${p.required ? 'required' : 'optional'}\`
    *   **Default:** ${!p.required ? `\`${p.defaultValue || 'none'}\`` : 'N/A'}
    *   **Impact:** ${p.impact || 'No impact specified.'}`
    )
    .join('\n\n');

  return `
---

## 🚀 Component API (Props)

This component's functionality is primarily driven by the following props, ensuring its reusability and configurability:

${propDocs}
`;
};

const generateStateSection = (state: FullPromptState['state']) => {
    const { variables, effects, optimizations, customHooks } = state;
    if (variables.length === 0 && effects.length === 0 && !optimizations && !customHooks) return '';

    let content = '\n---\n\n## ⚙️ Internal Logic & State Management\n\nThe component will manage its internal state and side effects using React Hooks as follows:';

    if (variables.length > 0) {
        content += '\n\n*   **State Variables:**';
        variables.forEach((v: StateVariable) => {
            content += `\n    *   \`${v.name || 'stateName'}\` (\`${v.initialValue || 'initialValue'}\`, managed by \`${v.hook || 'useState'}\`)
        *   **Purpose:** ${v.purpose || 'No purpose provided.'}
        *   **Transitions:** ${v.transitions || 'No transitions specified.'}`;
        });
    }

    if (effects.length > 0) {
        content += '\n\n*   **Side Effects (`useEffect`):**';
        effects.forEach((e: SideEffect, i: number) => {
            content += `\n    *   **Effect ${i + 1}:** ${e.description || 'No description provided.'}
        *   **Dependencies:** \`[${e.dependencies || ''}]\`
        *   **Cleanup:** ${e.cleanup || 'No cleanup logic specified.'}`;
        });
    }

    if (optimizations) {
        content += `\n\n*   **Performance Optimizations:**\n    *   ${optimizations}`;
    }

    if (customHooks) {
        content += `\n\n*   **Custom Hooks:**\n    *   ${customHooks}`;
    }

    return content;
};

const generateInteractionsSection = (interactions: FullPromptState['interactions']) => {
    const { userInteractions, eventEmitters, conditionalRendering } = interactions;
    if (userInteractions.length === 0 && eventEmitters.length === 0 && conditionalRendering.length === 0) return '';
    
    let content = '\n---\n\n## ⚡ Behaviors & Interactions\n\nThe component will respond to the following user interactions and manage its internal flow:';

    if (userInteractions.length > 0) {
        content += '\n\n*   **User Interactions Supported:**';
        userInteractions.forEach((i: UserInteraction) => {
            content += `\n    *   ${i.description || 'No description provided.'}`;
        });
    }

    if (eventEmitters.length > 0) {
        content += '\n\n*   **Event Emitters (Prop Callbacks):**';
        eventEmitters.forEach((e: EventEmitter) => {
            content += `\n    *   \`${e.name || 'onEvent'}\` (\`function(${e.arguments || ''})\`)
        *   **Triggered When:** ${e.trigger || 'No trigger specified.'}`;
        });
    }
    
    if (conditionalRendering.length > 0) {
        content += '\n\n*   **Conditional Rendering:**';
        conditionalRendering.forEach((cr: ConditionalRender) => {
            content += `\n    *   The component should render **${cr.description || 'something'}** when \`${cr.condition || 'a condition is met'}\`.`;
        });
    }

    return content;
};

const generateVisualsSection = (visuals: FullPromptState['visuals']) => {
    if (!visuals.htmlElements && !visuals.styling && !visuals.layout) return '';
    return `
---

## 🎨 Visuals & Structure

*   **Primary Semantic HTML Elements:** \`${visuals.htmlElements || 'Not specified'}\`
*   **Styling Strategy:** ${visuals.styling || 'Not specified'}
*   **Basic Layout Cues:** ${visuals.layout || 'Not specified'}
`;
};

const generateRobustnessSection = (robustness: FullPromptState['robustness']) => {
    if (!robustness.accessibility && !robustness.errorHandling && !robustness.loadingStates && !robustness.edgeCases && !robustness.testing) return '';
    return `
---

## ✅ Robustness & Reusability Checklist

*   **Accessibility:** ${robustness.accessibility || 'Standard accessibility practices should be followed.'}
*   **Error Handling:** ${robustness.errorHandling || 'No specific error handling strategy defined.'}
*   **Loading States:** ${robustness.loadingStates || 'No specific loading state strategy defined.'}
*   **Edge Cases:** ${robustness.edgeCases || 'No specific edge cases defined.'}
*   **Testing Focus:** ${robustness.testing || 'Focus on standard unit tests for component logic.'}
`;
};


export const usePromptGenerator = (state: FullPromptState): string => {
  return useMemo(() => {
    const { identity, props, state: stateData, interactions, visuals, robustness } = state;

    const name = identity.name || '[Component Name]';
    const description = identity.description || '[Brief Description]';
    const useCase = identity.useCase || '[Core Use Case]';

    const header = `# React Component Generation Request: ${name}

**Objective:**
To create a highly reusable and well-structured React component named \`${name}\` that ${description}. This component will serve as ${useCase}.`;

    const propsSection = generatePropsSection(props);
    const stateSection = generateStateSection(stateData);
    const interactionsSection = generateInteractionsSection(interactions);
    const visualsSection = generateVisualsSection(visuals);
    const robustnessSection = generateRobustnessSection(robustness);

    return [header, propsSection, stateSection, interactionsSection, visualsSection, robustnessSection]
      .filter(Boolean)
      .join('\n');
  }, [state]);
};
