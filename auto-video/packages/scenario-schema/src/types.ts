export type StepKind =
  | 'goto'
  | 'click'
  | 'type'
  | 'waitFor'
  | 'assert'
  | 'screenshot';

export interface StepSpec {
  stepId: string;
  kind: StepKind;
  goal: string;
  selector?: string;
  inputValue?: string;
  url?: string;
}

export interface ScenarioSpec {
  scenarioId: string;
  name: string;
  description: string;
  target: {
    baseUrl: string;
  };
  steps: StepSpec[];
}
