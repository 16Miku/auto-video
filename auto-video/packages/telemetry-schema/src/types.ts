export interface ExecutionEvent {
  eventId: string;
  stepId: string;
  eventType: 'step-start' | 'step-complete' | 'screenshot';
  timestamp: string;
  page: {
    url: string;
    title: string;
  };
  actionSummary: string;
  screenshotPath?: string;
  status: 'ok' | 'error';
}

export interface RunManifest {
  runId: string;
  scenarioId: string;
  createdAt: string;
}
