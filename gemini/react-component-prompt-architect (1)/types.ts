
export interface PropDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue: string;
  impact: string;
}

export interface StateVariable {
  id: string;
  name: string;
  initialValue: string;
  hook: string;
  purpose: string;
  transitions: string;
}

export interface SideEffect {
  id: string;
  description: string;
  dependencies: string;
  cleanup: string;
}

export interface UserInteraction {
  id: string;
  description: string;
}

export interface EventEmitter {
  id: string;
  name: string;
  arguments: string;
  trigger: string;
}

export interface ConditionalRender {
    id: string;
    description: string;
    condition: string;
}

export interface FullPromptState {
  identity: {
    name: string;
    description: string;
    useCase: string;
  };
  props: PropDefinition[];
  state: {
    variables: StateVariable[];
    effects: SideEffect[];
    optimizations: string;
    customHooks: string;
  };
  interactions: {
    userInteractions: UserInteraction[];
    eventEmitters: EventEmitter[];
    conditionalRendering: ConditionalRender[];
  };
  visuals: {
    htmlElements: string;
    styling: string;
    layout: string;
  };
  robustness: {
    accessibility: string;
    errorHandling: string;
    loadingStates: string;
    edgeCases: string;
    testing: string;
  };
}
