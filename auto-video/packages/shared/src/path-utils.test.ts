import test from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {getRunPaths} from './path-utils.js';

test('getRunPaths returns standard run directory layout', () => {
  const workspaceRoot = join('A:', 'tmp', 'auto-video');
  const runId = 'demo-001';
  const paths = getRunPaths(workspaceRoot, runId);
  const root = join(workspaceRoot, 'runs', runId);

  assert.equal(paths.root, root);
  assert.equal(paths.input, join(root, 'input'));
  assert.equal(paths.logs, join(root, 'logs'));
  assert.equal(paths.screenshots, join(root, 'screenshots'));
  assert.equal(paths.recording, join(root, 'recording'));
  assert.equal(paths.narration, join(root, 'narration'));
  assert.equal(paths.subtitles, join(root, 'subtitles'));
  assert.equal(paths.editSpec, join(root, 'edit-spec'));
  assert.equal(paths.output, join(root, 'output'));
});

