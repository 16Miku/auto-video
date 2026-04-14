import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {loadScenarioFromFile} from './load-scenario.js';

async function writeScenarioFile(content: unknown): Promise<string> {
  const dirPath = await mkdtemp(join(tmpdir(), 'scenario-schema-'));
  const filePath = join(dirPath, 'scenario.json');
  await writeFile(filePath, JSON.stringify(content), 'utf8');
  return filePath;
}

test('loadScenarioFromFile loads a valid scenario', async () => {
  const filePath = join(process.cwd(), 'scenarios/examples/demo-login-flow.json');
  const scenario = await loadScenarioFromFile(filePath);

  assert.equal(scenario.name, 'Demo Login Flow');
  assert.equal(scenario.steps.length, 3);
  assert.equal(scenario.steps[0]?.kind, 'goto');
});

test('loadScenarioFromFile throws when description is missing', async () => {
  const filePath = await writeScenarioFile({
    scenarioId: 'missing-description',
    name: 'Missing Description',
    target: {
      baseUrl: 'https://example.com',
    },
    steps: [
      {
        stepId: 'step-1',
        kind: 'goto',
        goal: 'Open page',
        url: 'https://example.com',
      },
    ],
  });

  await assert.rejects(() => loadScenarioFromFile(filePath), /Scenario is missing required fields/);
});

test('loadScenarioFromFile throws when a step is missing required fields', async () => {
  const filePath = await writeScenarioFile({
    scenarioId: 'missing-step-field',
    name: 'Missing Step Field',
    description: 'Scenario with invalid step.',
    target: {
      baseUrl: 'https://example.com',
    },
    steps: [
      {
        kind: 'click',
        goal: 'Click login button',
        selector: 'text=Login',
      },
    ],
  });

  await assert.rejects(() => loadScenarioFromFile(filePath), /Scenario step is missing required fields/);
});

test('loadScenarioFromFile throws when step kind is invalid', async () => {
  const filePath = await writeScenarioFile({
    scenarioId: 'invalid-step-kind',
    name: 'Invalid Step Kind',
    description: 'Scenario with unsupported step kind.',
    target: {
      baseUrl: 'https://example.com',
    },
    steps: [
      {
        stepId: 'step-1',
        kind: 'submit',
        goal: 'Submit form',
      },
    ],
  });

  await assert.rejects(() => loadScenarioFromFile(filePath), /Scenario step is missing required fields/);
});
