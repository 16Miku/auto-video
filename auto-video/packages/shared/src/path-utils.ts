import {join} from 'node:path';

export interface RunPaths {
  root: string;
  input: string;
  logs: string;
  screenshots: string;
  recording: string;
  narration: string;
  subtitles: string;
  editSpec: string;
  output: string;
}

export function getRunPaths(workspaceRoot: string, runId: string): RunPaths {
  const root = join(workspaceRoot, 'runs', runId);

  return {
    root,
    input: join(root, 'input'),
    logs: join(root, 'logs'),
    screenshots: join(root, 'screenshots'),
    recording: join(root, 'recording'),
    narration: join(root, 'narration'),
    subtitles: join(root, 'subtitles'),
    editSpec: join(root, 'edit-spec'),
    output: join(root, 'output')
  };
}
