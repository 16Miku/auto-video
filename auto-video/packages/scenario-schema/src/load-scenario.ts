import {readFile} from 'node:fs/promises';
import type {ScenarioSpec, StepKind, StepSpec} from './types.js';

const STEP_KINDS: StepKind[] = ['goto', 'click', 'type', 'waitFor', 'assert', 'screenshot'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isStepKind(value: unknown): value is StepKind {
  return typeof value === 'string' && STEP_KINDS.includes(value as StepKind);
}

function validateStep(step: unknown): StepSpec {
  if (!isRecord(step)) {
    throw new Error('Scenario step is invalid');
  }

  if (!isNonEmptyString(step.stepId) || !isNonEmptyString(step.goal) || !isStepKind(step.kind)) {
    throw new Error('Scenario step is missing required fields');
  }

  return {
    stepId: step.stepId,
    kind: step.kind,
    goal: step.goal,
    selector: typeof step.selector === 'string' ? step.selector : undefined,
    inputValue: typeof step.inputValue === 'string' ? step.inputValue : undefined,
    url: typeof step.url === 'string' ? step.url : undefined,
  };
}

export async function loadScenarioFromFile(filePath: string): Promise<ScenarioSpec> {
  const content = await readFile(filePath, 'utf8');
  const parsed: unknown = JSON.parse(content);

  if (!isRecord(parsed)) {
    throw new Error('Scenario is missing required fields');
  }

  if (
    !isNonEmptyString(parsed.scenarioId) ||
    !isNonEmptyString(parsed.name) ||
    !isNonEmptyString(parsed.description) ||
    !isRecord(parsed.target) ||
    !isNonEmptyString(parsed.target.baseUrl) ||
    !Array.isArray(parsed.steps) ||
    parsed.steps.length === 0
  ) {
    throw new Error('Scenario is missing required fields');
  }

  return {
    scenarioId: parsed.scenarioId,
    name: parsed.name,
    description: parsed.description,
    target: {
      baseUrl: parsed.target.baseUrl,
    },
    steps: parsed.steps.map(validateStep),
  };
}
