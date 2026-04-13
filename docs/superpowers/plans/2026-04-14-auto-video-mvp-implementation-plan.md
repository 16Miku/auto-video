# auto-video MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 auto-video 首版 MVP：输入一份结构化步骤清单，执行浏览器自动化流程，落盘保存截图与执行轨迹，生成规则旁白与占位字幕素材，并用 Remotion 输出一条带标题、步骤说明、字幕和简单高亮的产品演示视频。

**Architecture:** 采用单仓库、分目录的事件驱动流水线。`auto-video/apps/browser-runner` 负责执行与采集，`auto-video/packages/*` 负责模型、路径、旁白、剪辑规划等纯逻辑，`remotion-app` 暂时继续作为 Remotion 原型渲染器，通过读取 `runs/<run-id>` 下的标准中间产物完成成片。

**Tech Stack:** TypeScript、Node.js、Remotion、现有浏览器自动化工具（先封装为 stub 适配层）、JSON 文件输入输出、npm

---

## File Structure

### New files and directories

- Create: `auto-video/package.json`
  - 作用：定义 auto-video 工作区的最小脚本，先使用 npm，统一 lint/typecheck/测试入口。
- Create: `auto-video/tsconfig.json`
  - 作用：定义 TypeScript 编译配置，供 packages 与 apps 共享。
- Create: `auto-video/.gitignore`
  - 作用：忽略 `runs/`、临时文件与构建产物。
- Create: `auto-video/README.md`
  - 作用：说明 MVP 的运行方式与目录职责。
- Create: `auto-video/scenarios/examples/demo-login-flow.json`
  - 作用：提供首个可执行的结构化示例场景。
- Create: `auto-video/packages/scenario-schema/src/types.ts`
  - 作用：定义 `ScenarioSpec`、`StepSpec` 等输入模型。
- Create: `auto-video/packages/scenario-schema/src/load-scenario.ts`
  - 作用：从 JSON 读取并校验 scenario。
- Create: `auto-video/packages/scenario-schema/src/load-scenario.test.ts`
  - 作用：验证 scenario 读取与必要字段校验。
- Create: `auto-video/packages/shared/src/path-utils.ts`
  - 作用：生成并管理 `runs/<run-id>` 目录结构。
- Create: `auto-video/packages/shared/src/path-utils.test.ts`
  - 作用：验证 run 目录路径生成逻辑。
- Create: `auto-video/packages/telemetry-schema/src/types.ts`
  - 作用：定义 `ExecutionEvent`、截图元数据、run manifest。
- Create: `auto-video/packages/narration-engine/src/build-narration.ts`
  - 作用：基于执行轨迹生成规则旁白骨架。
- Create: `auto-video/packages/narration-engine/src/build-narration.test.ts`
  - 作用：验证旁白骨架输出。
- Create: `auto-video/packages/subtitle-engine/src/build-subtitles.ts`
  - 作用：根据旁白段落输出占位字幕时间轴。
- Create: `auto-video/packages/subtitle-engine/src/build-subtitles.test.ts`
  - 作用：验证字幕时间分配逻辑。
- Create: `auto-video/packages/edit-planner/src/build-edit-spec.ts`
  - 作用：根据执行事件和旁白输出最小 `EditSpec`。
- Create: `auto-video/packages/edit-planner/src/build-edit-spec.test.ts`
  - 作用：验证最小剪辑决策生成。
- Create: `auto-video/apps/browser-runner/src/runner.ts`
  - 作用：按步骤清单执行一个 stub 浏览器运行器，生成截图与事件文件。
- Create: `auto-video/apps/browser-runner/src/runner.test.ts`
  - 作用：验证 stub 运行器会写出标准事件与截图占位文件。
- Create: `auto-video/apps/orchestrator/src/index.ts`
  - 作用：串起 scenario 加载、执行、旁白、字幕、edit spec 生成。
- Create: `auto-video/apps/orchestrator/src/index.test.ts`
  - 作用：验证 orchestrator 会产出完整 run 目录。
- Create: `auto-video/scripts/run-demo.ts`
  - 作用：提供本地一键运行 MVP 场景入口。
- Create: `remotion-app/src/types.ts`
  - 作用：定义 Remotion 读取的 `RenderInput` / `EditSpec` / 字幕与步骤条类型。
- Create: `remotion-app/src/loadRenderInput.ts`
  - 作用：从 `runs/<run-id>/edit-spec/render-input.json` 读取成片输入。
- Create: `remotion-app/src/StepCard.tsx`
  - 作用：渲染步骤说明卡片。
- Create: `remotion-app/src/SubtitleTrack.tsx`
  - 作用：渲染字幕轨道。
- Create: `remotion-app/src/HighlightBox.tsx`
  - 作用：渲染简单高亮框。
- Create: `remotion-app/src/fixtures/sample-render-input.json`
  - 作用：Remotion 独立开发时使用的本地 fixture。

### Existing files to modify

- Modify: `remotion-app/package.json`
  - 作用：添加 MVP 渲染脚本，例如读取 fixture 或 run 目录参数。
- Modify: `remotion-app/src/Root.tsx`
  - 作用：注册新的 demo composition 与默认 props。
- Modify: `remotion-app/src/Composition.tsx`
  - 作用：从空实现改为最小产品演示视频 Composition。
- Modify: `docs/architecture/auto-video-repo-layout.md`
  - 作用：在实现完成后补充“当前已实现到 MVP stub 路线”。

### Existing tooling assumptions

- 当前仓库已有 `remotion-app`，依赖已安装且 `npm run lint` 可通过。
- `auto-video` 目前为空目录，本计划先构建最小 TypeScript 工程，不引入 monorepo 管理器。
- 浏览器自动化真实接入先不在 MVP 首轮做深耦合，先做 `StubBrowserRunner` 以打通全链路，后续替换为真实 Agent Browser / Browser Use 适配器。

## Task 1: 初始化 auto-video 工作区骨架

**Files:**
- Create: `auto-video/package.json`
- Create: `auto-video/tsconfig.json`
- Create: `auto-video/.gitignore`
- Create: `auto-video/README.md`

- [ ] **Step 1: 写工作区配置文件**

```json
{
  "name": "auto-video",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit",
    "test": "node --test ./dist/**/*.test.js",
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/node": "^24.0.0"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": [
    "apps/**/*.ts",
    "packages/**/*.ts",
    "scripts/**/*.ts"
  ]
}
```

```gitignore
node_modules/
dist/
runs/
tmp/
```

```md
# auto-video

自动化产品演示视频 MVP 工作区。

## 当前范围

- 结构化 scenario 输入
- stub 浏览器执行器
- 执行轨迹与截图落盘
- 规则旁白
- 占位字幕
- 最小 Edit Spec
- Remotion 成片
```

- [ ] **Step 2: 安装依赖**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm install`
Expected: 生成 `package-lock.json`，安装 `typescript` 与 `@types/node`。

- [ ] **Step 3: 运行 typecheck 验证工作区初始化成功**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run typecheck`
Expected: PASS，输出 `Found 0 errors` 或无报错退出。

- [ ] **Step 4: 提交**

```bash
git add auto-video/package.json auto-video/package-lock.json auto-video/tsconfig.json auto-video/.gitignore auto-video/README.md
git commit -m "feat: 初始化 auto-video MVP 工作区"
```

## Task 2: 定义 scenario 输入模型与示例场景

**Files:**
- Create: `auto-video/packages/scenario-schema/src/types.ts`
- Create: `auto-video/packages/scenario-schema/src/load-scenario.ts`
- Create: `auto-video/packages/scenario-schema/src/load-scenario.test.ts`
- Create: `auto-video/scenarios/examples/demo-login-flow.json`

- [ ] **Step 1: 先写失败测试，覆盖最小 scenario 加载**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadScenarioFromFile} from './load-scenario.js';
import {join} from 'node:path';

test('loadScenarioFromFile loads a valid scenario', async () => {
  const filePath = join(process.cwd(), 'scenarios/examples/demo-login-flow.json');
  const scenario = await loadScenarioFromFile(filePath);

  assert.equal(scenario.name, 'Demo Login Flow');
  assert.equal(scenario.steps.length, 3);
  assert.equal(scenario.steps[0]?.kind, 'goto');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/packages/scenario-schema/src/load-scenario.test.js`
Expected: FAIL，提示 `Cannot find module './load-scenario.js'` 或导出不存在。

- [ ] **Step 3: 实现最小类型与读取逻辑**

```ts
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
```

```ts
import {readFile} from 'node:fs/promises';
import type {ScenarioSpec} from './types.js';

export async function loadScenarioFromFile(filePath: string): Promise<ScenarioSpec> {
  const content = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(content) as Partial<ScenarioSpec>;

  if (!parsed.scenarioId || !parsed.name || !parsed.target?.baseUrl || !parsed.steps?.length) {
    throw new Error('Scenario is missing required fields');
  }

  return parsed as ScenarioSpec;
}
```

```json
{
  "scenarioId": "demo-login-flow",
  "name": "Demo Login Flow",
  "description": "Open a login page and demonstrate the login entry path.",
  "target": {
    "baseUrl": "https://example.com"
  },
  "steps": [
    {
      "stepId": "step-open-home",
      "kind": "goto",
      "goal": "打开首页",
      "url": "https://example.com"
    },
    {
      "stepId": "step-open-login",
      "kind": "click",
      "goal": "点击登录按钮",
      "selector": "text=Login"
    },
    {
      "stepId": "step-capture-login",
      "kind": "screenshot",
      "goal": "记录登录页面截图"
    }
  ]
}
```

- [ ] **Step 4: 重新构建并运行测试**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/packages/scenario-schema/src/load-scenario.test.js`
Expected: PASS，显示 `ok 1 - loadScenarioFromFile loads a valid scenario`。

- [ ] **Step 5: 提交**

```bash
git add auto-video/packages/scenario-schema/src/types.ts auto-video/packages/scenario-schema/src/load-scenario.ts auto-video/packages/scenario-schema/src/load-scenario.test.ts auto-video/scenarios/examples/demo-login-flow.json
git commit -m "feat: 添加 scenario 输入模型与示例场景"
```

## Task 3: 建立 run 目录工具与 telemetry 模型

**Files:**
- Create: `auto-video/packages/shared/src/path-utils.ts`
- Create: `auto-video/packages/shared/src/path-utils.test.ts`
- Create: `auto-video/packages/telemetry-schema/src/types.ts`

- [ ] **Step 1: 写失败测试，验证 run 目录结构生成**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {getRunPaths} from './path-utils.js';

test('getRunPaths returns standard run directory layout', () => {
  const paths = getRunPaths('A:/tmp/auto-video', 'demo-001');

  assert.equal(paths.root, 'A:/tmp/auto-video/runs/demo-001');
  assert.equal(paths.logs, 'A:/tmp/auto-video/runs/demo-001/logs');
  assert.equal(paths.screenshots, 'A:/tmp/auto-video/runs/demo-001/screenshots');
  assert.equal(paths.editSpec, 'A:/tmp/auto-video/runs/demo-001/edit-spec');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/packages/shared/src/path-utils.test.js`
Expected: FAIL，提示缺少 `path-utils.js`。

- [ ] **Step 3: 实现最小路径工具与 telemetry 类型**

```ts
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
```

```ts
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
```

- [ ] **Step 4: 重新构建并运行测试**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/packages/shared/src/path-utils.test.js`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add auto-video/packages/shared/src/path-utils.ts auto-video/packages/shared/src/path-utils.test.ts auto-video/packages/telemetry-schema/src/types.ts
git commit -m "feat: 添加 run 目录工具与执行轨迹模型"
```

## Task 4: 实现 stub 浏览器执行器并写出标准采集产物

**Files:**
- Create: `auto-video/apps/browser-runner/src/runner.ts`
- Create: `auto-video/apps/browser-runner/src/runner.test.ts`

- [ ] **Step 1: 写失败测试，验证 runner 会输出事件和截图占位文件**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runScenarioWithStub} from './runner.js';
import type {ScenarioSpec} from '../../../packages/scenario-schema/src/types.js';

test('runScenarioWithStub writes events and screenshot placeholder', async () => {
  const workspaceRoot = await mkdtemp(join(tmpdir(), 'auto-video-'));
  const scenario: ScenarioSpec = {
    scenarioId: 'demo-login-flow',
    name: 'Demo Login Flow',
    description: 'demo',
    target: {baseUrl: 'https://example.com'},
    steps: [
      {stepId: 'step-open-home', kind: 'goto', goal: '打开首页', url: 'https://example.com'},
      {stepId: 'step-capture-login', kind: 'screenshot', goal: '记录登录页截图'}
    ]
  };

  const result = await runScenarioWithStub({workspaceRoot, runId: 'demo-001', scenario});
  const events = JSON.parse(await readFile(result.eventsFilePath, 'utf8')) as Array<{stepId: string}>;

  assert.equal(events.length, 2);
  await stat(result.screenshotPaths[0]!);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/apps/browser-runner/src/runner.test.js`
Expected: FAIL，提示 `runScenarioWithStub` 不存在。

- [ ] **Step 3: 实现最小 stub runner**

```ts
import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {ScenarioSpec} from '../../../packages/scenario-schema/src/types.js';
import type {ExecutionEvent} from '../../../packages/telemetry-schema/src/types.js';
import {getRunPaths} from '../../../packages/shared/src/path-utils.js';

export async function runScenarioWithStub(args: {
  workspaceRoot: string;
  runId: string;
  scenario: ScenarioSpec;
}) {
  const paths = getRunPaths(args.workspaceRoot, args.runId);
  await Promise.all([
    mkdir(paths.logs, {recursive: true}),
    mkdir(paths.screenshots, {recursive: true}),
    mkdir(paths.input, {recursive: true}),
    mkdir(paths.recording, {recursive: true})
  ]);

  const events: ExecutionEvent[] = [];
  const screenshotPaths: string[] = [];

  for (const step of args.scenario.steps) {
    if (step.kind === 'screenshot') {
      const screenshotPath = join(paths.screenshots, `${step.stepId}.txt`);
      await writeFile(screenshotPath, `placeholder screenshot for ${step.stepId}`);
      screenshotPaths.push(screenshotPath);

      events.push({
        eventId: `${step.stepId}-event`,
        stepId: step.stepId,
        eventType: 'screenshot',
        timestamp: new Date().toISOString(),
        page: {url: args.scenario.target.baseUrl, title: args.scenario.name},
        actionSummary: step.goal,
        screenshotPath,
        status: 'ok'
      });
      continue;
    }

    events.push({
      eventId: `${step.stepId}-event`,
      stepId: step.stepId,
      eventType: 'step-complete',
      timestamp: new Date().toISOString(),
      page: {url: step.url ?? args.scenario.target.baseUrl, title: args.scenario.name},
      actionSummary: step.goal,
      status: 'ok'
    });
  }

  const eventsFilePath = join(paths.logs, 'events.json');
  await writeFile(eventsFilePath, JSON.stringify(events, null, 2));
  await writeFile(join(paths.input, 'scenario.json'), JSON.stringify(args.scenario, null, 2));

  return {
    runId: args.runId,
    eventsFilePath,
    screenshotPaths
  };
}
```

- [ ] **Step 4: 重新构建并运行测试**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/apps/browser-runner/src/runner.test.js`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add auto-video/apps/browser-runner/src/runner.ts auto-video/apps/browser-runner/src/runner.test.ts
git commit -m "feat: 添加 stub 浏览器执行器与采集落盘"
```

## Task 5: 生成规则旁白、占位字幕与最小 Edit Spec

**Files:**
- Create: `auto-video/packages/narration-engine/src/build-narration.ts`
- Create: `auto-video/packages/narration-engine/src/build-narration.test.ts`
- Create: `auto-video/packages/subtitle-engine/src/build-subtitles.ts`
- Create: `auto-video/packages/subtitle-engine/src/build-subtitles.test.ts`
- Create: `auto-video/packages/edit-planner/src/build-edit-spec.ts`
- Create: `auto-video/packages/edit-planner/src/build-edit-spec.test.ts`

- [ ] **Step 1: 写失败测试，验证规则旁白生成**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildNarrationSegments} from './build-narration.js';

test('buildNarrationSegments maps events to narration text', () => {
  const segments = buildNarrationSegments([
    {
      eventId: 'step-open-home-event',
      stepId: 'step-open-home',
      eventType: 'step-complete',
      timestamp: '2026-04-14T00:00:00.000Z',
      page: {url: 'https://example.com', title: 'Demo Login Flow'},
      actionSummary: '打开首页',
      status: 'ok'
    }
  ]);

  assert.equal(segments[0]?.finalText, '接下来，系统会打开首页。');
});
```

- [ ] **Step 2: 写失败测试，验证字幕时间轴生成**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSubtitleCues} from './build-subtitles.js';

test('buildSubtitleCues assigns sequential cue timing', () => {
  const cues = buildSubtitleCues([
    {
      segmentId: 'seg-1',
      stepIds: ['step-open-home'],
      draftText: '打开首页',
      finalText: '接下来，系统会打开首页。',
      emphasisWords: [],
      voiceStyle: 'demo',
      estimatedDurationMs: 1200,
      ttsAudioPath: 'narration/seg-1.wav'
    }
  ]);

  assert.equal(cues[0]?.startMs, 0);
  assert.equal(cues[0]?.endMs, 1200);
});
```

- [ ] **Step 3: 写失败测试，验证 Edit Spec 生成**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildEditSpec} from './build-edit-spec.js';

test('buildEditSpec creates timeline segments from events and subtitles', () => {
  const editSpec = buildEditSpec({
    runId: 'demo-001',
    events: [
      {
        eventId: 'step-open-home-event',
        stepId: 'step-open-home',
        eventType: 'step-complete',
        timestamp: '2026-04-14T00:00:00.000Z',
        page: {url: 'https://example.com', title: 'Demo Login Flow'},
        actionSummary: '打开首页',
        status: 'ok'
      }
    ],
    subtitles: [
      {
        cueId: 'cue-1',
        text: '接下来，系统会打开首页。',
        startMs: 0,
        endMs: 1200,
        wordTimings: [],
        sourceNarrationSegmentId: 'seg-1'
      }
    ]
  });

  assert.equal(editSpec.timelineSegments.length, 1);
  assert.equal(editSpec.timelineSegments[0]?.label, '打开首页');
});
```

- [ ] **Step 4: 运行测试确认失败**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/packages/narration-engine/src/build-narration.test.js dist/packages/subtitle-engine/src/build-subtitles.test.js dist/packages/edit-planner/src/build-edit-spec.test.js`
Expected: FAIL，分别提示目标模块不存在。

- [ ] **Step 5: 实现最小逻辑**

```ts
import type {ExecutionEvent} from '../../telemetry-schema/src/types.js';

export interface NarrationSegment {
  segmentId: string;
  stepIds: string[];
  draftText: string;
  finalText: string;
  emphasisWords: string[];
  voiceStyle: string;
  estimatedDurationMs: number;
  ttsAudioPath: string;
}

export function buildNarrationSegments(events: ExecutionEvent[]): NarrationSegment[] {
  return events.map((event, index) => ({
    segmentId: `seg-${index + 1}`,
    stepIds: [event.stepId],
    draftText: event.actionSummary,
    finalText: `接下来，系统会${event.actionSummary}。`,
    emphasisWords: [],
    voiceStyle: 'demo',
    estimatedDurationMs: 1200,
    ttsAudioPath: `narration/seg-${index + 1}.wav`
  }));
}
```

```ts
import type {NarrationSegment} from '../../narration-engine/src/build-narration.js';

export interface SubtitleCue {
  cueId: string;
  text: string;
  startMs: number;
  endMs: number;
  wordTimings: Array<{word: string; startMs: number; endMs: number}>;
  sourceNarrationSegmentId: string;
}

export function buildSubtitleCues(segments: NarrationSegment[]): SubtitleCue[] {
  let cursor = 0;

  return segments.map((segment, index) => {
    const cue = {
      cueId: `cue-${index + 1}`,
      text: segment.finalText,
      startMs: cursor,
      endMs: cursor + segment.estimatedDurationMs,
      wordTimings: [],
      sourceNarrationSegmentId: segment.segmentId
    };

    cursor += segment.estimatedDurationMs;
    return cue;
  });
}
```

```ts
import type {ExecutionEvent} from '../../telemetry-schema/src/types.js';
import type {SubtitleCue} from '../../subtitle-engine/src/build-subtitles.js';

export interface EditSpec {
  runId: string;
  timelineSegments: Array<{
    segmentId: string;
    label: string;
    startMs: number;
    endMs: number;
    highlight: boolean;
  }>;
  subtitleTrack: SubtitleCue[];
}

export function buildEditSpec(args: {
  runId: string;
  events: ExecutionEvent[];
  subtitles: SubtitleCue[];
}): EditSpec {
  return {
    runId: args.runId,
    timelineSegments: args.events.map((event, index) => ({
      segmentId: `timeline-${index + 1}`,
      label: event.actionSummary,
      startMs: args.subtitles[index]?.startMs ?? 0,
      endMs: args.subtitles[index]?.endMs ?? 1000,
      highlight: true
    })),
    subtitleTrack: args.subtitles
  };
}
```

- [ ] **Step 6: 重新构建并运行测试**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/packages/narration-engine/src/build-narration.test.js dist/packages/subtitle-engine/src/build-subtitles.test.js dist/packages/edit-planner/src/build-edit-spec.test.js`
Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add auto-video/packages/narration-engine/src/build-narration.ts auto-video/packages/narration-engine/src/build-narration.test.ts auto-video/packages/subtitle-engine/src/build-subtitles.ts auto-video/packages/subtitle-engine/src/build-subtitles.test.ts auto-video/packages/edit-planner/src/build-edit-spec.ts auto-video/packages/edit-planner/src/build-edit-spec.test.ts
git commit -m "feat: 添加规则旁白、字幕与最小剪辑规划"
```

## Task 6: 实现 orchestrator，打通 runs 目录全链路

**Files:**
- Create: `auto-video/apps/orchestrator/src/index.ts`
- Create: `auto-video/apps/orchestrator/src/index.test.ts`
- Create: `auto-video/scripts/run-demo.ts`

- [ ] **Step 1: 写失败测试，验证 orchestrator 生成完整 run 输出**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runDemoScenario} from './index.js';

test('runDemoScenario writes scenario, events, subtitles and edit spec', async () => {
  const workspaceRoot = await mkdtemp(join(tmpdir(), 'auto-video-'));

  const result = await runDemoScenario({
    workspaceRoot,
    scenarioFilePath: join(process.cwd(), 'scenarios/examples/demo-login-flow.json'),
    runId: 'demo-001'
  });

  await stat(result.paths.logs);
  await stat(result.paths.subtitles);
  const editSpec = JSON.parse(await readFile(join(result.paths.editSpec, 'render-input.json'), 'utf8')) as {runId: string};

  assert.equal(editSpec.runId, 'demo-001');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/apps/orchestrator/src/index.test.js`
Expected: FAIL，提示 `runDemoScenario` 不存在。

- [ ] **Step 3: 实现最小 orchestrator 与脚本入口**

```ts
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {loadScenarioFromFile} from '../../../packages/scenario-schema/src/load-scenario.js';
import {runScenarioWithStub} from '../../browser-runner/src/runner.js';
import {buildNarrationSegments} from '../../../packages/narration-engine/src/build-narration.js';
import {buildSubtitleCues} from '../../../packages/subtitle-engine/src/build-subtitles.js';
import {buildEditSpec} from '../../../packages/edit-planner/src/build-edit-spec.js';
import {getRunPaths} from '../../../packages/shared/src/path-utils.js';
import type {ExecutionEvent} from '../../../packages/telemetry-schema/src/types.js';

export async function runDemoScenario(args: {
  workspaceRoot: string;
  scenarioFilePath: string;
  runId: string;
}) {
  const scenario = await loadScenarioFromFile(args.scenarioFilePath);
  const runnerResult = await runScenarioWithStub({
    workspaceRoot: args.workspaceRoot,
    runId: args.runId,
    scenario
  });

  const paths = getRunPaths(args.workspaceRoot, args.runId);
  await Promise.all([
    mkdir(paths.narration, {recursive: true}),
    mkdir(paths.subtitles, {recursive: true}),
    mkdir(paths.editSpec, {recursive: true}),
    mkdir(paths.output, {recursive: true})
  ]);

  const events = JSON.parse(await readFile(runnerResult.eventsFilePath, 'utf8')) as ExecutionEvent[];
  const narration = buildNarrationSegments(events);
  const subtitles = buildSubtitleCues(narration);
  const editSpec = buildEditSpec({runId: args.runId, events, subtitles});

  await writeFile(join(paths.narration, 'narration.json'), JSON.stringify(narration, null, 2));
  await writeFile(join(paths.subtitles, 'subtitles.json'), JSON.stringify(subtitles, null, 2));
  await writeFile(join(paths.editSpec, 'render-input.json'), JSON.stringify(editSpec, null, 2));

  return {runId: args.runId, paths, editSpecPath: join(paths.editSpec, 'render-input.json')};
}
```

```ts
import {resolve} from 'node:path';
import {runDemoScenario} from '../apps/orchestrator/src/index.js';

const workspaceRoot = resolve(process.cwd());
const scenarioFilePath = resolve(process.cwd(), 'scenarios/examples/demo-login-flow.json');
const runId = `demo-${Date.now()}`;

await runDemoScenario({workspaceRoot, scenarioFilePath, runId});
console.log(`Run created: ${runId}`);
```

- [ ] **Step 4: 重新构建并运行测试**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node --test dist/apps/orchestrator/src/index.test.js`
Expected: PASS。

- [ ] **Step 5: 运行脚本生成一个真实 demo run**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && node dist/scripts/run-demo.js`
Expected: 输出 `Run created: demo-<timestamp>`，并在 `auto-video/runs/` 下生成一个 run 目录。

- [ ] **Step 6: 提交**

```bash
git add auto-video/apps/orchestrator/src/index.ts auto-video/apps/orchestrator/src/index.test.ts auto-video/scripts/run-demo.ts
git commit -m "feat: 打通 auto-video MVP 编排主链路"
```

## Task 7: 在 Remotion 原型中接入 render-input 并输出最小产品演示视频

**Files:**
- Create: `remotion-app/src/types.ts`
- Create: `remotion-app/src/loadRenderInput.ts`
- Create: `remotion-app/src/StepCard.tsx`
- Create: `remotion-app/src/SubtitleTrack.tsx`
- Create: `remotion-app/src/HighlightBox.tsx`
- Create: `remotion-app/src/fixtures/sample-render-input.json`
- Modify: `remotion-app/src/Composition.tsx`
- Modify: `remotion-app/src/Root.tsx`
- Modify: `remotion-app/package.json`

- [ ] **Step 1: 写失败测试前先准备 fixture 与渲染输入类型**

```ts
export interface SubtitleCue {
  cueId: string;
  text: string;
  startMs: number;
  endMs: number;
  wordTimings: Array<{word: string; startMs: number; endMs: number}>;
  sourceNarrationSegmentId: string;
}

export interface RenderInput {
  runId: string;
  timelineSegments: Array<{
    segmentId: string;
    label: string;
    startMs: number;
    endMs: number;
    highlight: boolean;
  }>;
  subtitleTrack: SubtitleCue[];
}
```

```json
{
  "runId": "sample-run",
  "timelineSegments": [
    {
      "segmentId": "timeline-1",
      "label": "打开首页",
      "startMs": 0,
      "endMs": 1200,
      "highlight": true
    },
    {
      "segmentId": "timeline-2",
      "label": "点击登录按钮",
      "startMs": 1200,
      "endMs": 2400,
      "highlight": true
    }
  ],
  "subtitleTrack": [
    {
      "cueId": "cue-1",
      "text": "接下来，系统会打开首页。",
      "startMs": 0,
      "endMs": 1200,
      "wordTimings": [],
      "sourceNarrationSegmentId": "seg-1"
    }
  ]
}
```

- [ ] **Step 2: 实现读取 render-input 的工具**

```ts
import {readFileSync} from 'node:fs';
import type {RenderInput} from './types';

export const loadRenderInput = (filePath?: string): RenderInput => {
  if (!filePath) {
    return JSON.parse(readFileSync('./src/fixtures/sample-render-input.json', 'utf8')) as RenderInput;
  }

  return JSON.parse(readFileSync(filePath, 'utf8')) as RenderInput;
};
```

- [ ] **Step 3: 实现最小视觉组件**

```tsx
export const StepCard: React.FC<{label: string}> = ({label}) => {
  return (
    <div className="rounded-2xl bg-white/90 px-8 py-4 text-3xl font-semibold text-black shadow-lg">
      {label}
    </div>
  );
};
```

```tsx
import type {SubtitleCue} from './types';

export const SubtitleTrack: React.FC<{
  cues: SubtitleCue[];
  currentMs: number;
}> = ({cues, currentMs}) => {
  const activeCue = cues.find((cue) => currentMs >= cue.startMs && currentMs < cue.endMs);

  if (!activeCue) {
    return null;
  }

  return (
    <div className="absolute bottom-12 left-0 right-0 flex justify-center">
      <div className="max-w-4xl rounded-xl bg-black/75 px-6 py-3 text-center text-3xl text-white">
        {activeCue.text}
      </div>
    </div>
  );
};
```

```tsx
export const HighlightBox: React.FC = () => {
  return <div className="absolute inset-[18%] rounded-3xl border-8 border-sky-400" />;
};
```

- [ ] **Step 4: 将空 Composition 改为最小成片模板**

```tsx
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {StepCard} from './StepCard';
import {SubtitleTrack} from './SubtitleTrack';
import {HighlightBox} from './HighlightBox';
import type {RenderInput} from './types';

export const MyComposition: React.FC<{input: RenderInput}> = ({input}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const activeSegment =
    input.timelineSegments.find((segment) => currentMs >= segment.startMs && currentMs < segment.endMs) ??
    input.timelineSegments[input.timelineSegments.length - 1];

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill className="bg-slate-950 text-white">
      <AbsoluteFill style={{opacity}} className="items-center justify-center gap-10">
        <div className="text-6xl font-bold">产品功能演示视频</div>
        {activeSegment ? <StepCard label={activeSegment.label} /> : null}
        {activeSegment?.highlight ? <HighlightBox /> : null}
      </AbsoluteFill>
      <SubtitleTrack cues={input.subtitleTrack} currentMs={currentMs} />
    </AbsoluteFill>
  );
};
```

```tsx
import './index.css';
import {Composition} from 'remotion';
import {MyComposition} from './Composition';
import {loadRenderInput} from './loadRenderInput';

const input = loadRenderInput(process.env.RENDER_INPUT_FILE);
const durationInFrames = Math.max(
  90,
  Math.ceil((input.timelineSegments.at(-1)?.endMs ?? 3000) / 1000 * 30)
);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ProductDemo"
      component={MyComposition}
      durationInFrames={durationInFrames}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{input}}
    />
  );
};
```

- [ ] **Step 5: 添加渲染脚本并做静态校验**

```json
{
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle",
    "upgrade": "remotion upgrade",
    "lint": "eslint src && tsc",
    "render:sample": "remotion render src/index.ts ProductDemo out/sample.mp4"
  }
}
```

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/remotion-app" && npm run lint`
Expected: PASS。

- [ ] **Step 6: 渲染 sample 视频验证模板可用**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/remotion-app" && npm run render:sample`
Expected: 生成 `remotion-app/out/sample.mp4`。

- [ ] **Step 7: 提交**

```bash
git add remotion-app/package.json remotion-app/src/types.ts remotion-app/src/loadRenderInput.ts remotion-app/src/StepCard.tsx remotion-app/src/SubtitleTrack.tsx remotion-app/src/HighlightBox.tsx remotion-app/src/fixtures/sample-render-input.json remotion-app/src/Composition.tsx remotion-app/src/Root.tsx
git commit -m "feat: 添加 auto-video MVP 的 Remotion 成片模板"
```

## Task 8: 将 auto-video runs 输出接到 Remotion 渲染入口并补文档

**Files:**
- Modify: `auto-video/README.md`
- Modify: `docs/architecture/auto-video-repo-layout.md`
- Create: `auto-video/scripts/render-latest-run.ts`

- [ ] **Step 1: 写脚本，读取最新 run 并打印 Remotion 渲染命令**

```ts
import {readdir} from 'node:fs/promises';
import {join, resolve} from 'node:path';

const workspaceRoot = resolve(process.cwd());
const runsRoot = join(workspaceRoot, 'runs');
const entries = await readdir(runsRoot, {withFileTypes: true});
const latestRun = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()
  .at(-1);

if (!latestRun) {
  throw new Error('No run directories found');
}

const renderInputFile = join(runsRoot, latestRun, 'edit-spec', 'render-input.json');
console.log(renderInputFile);
```

- [ ] **Step 2: 更新 README，写清最小操作手册**

```md
## MVP 跑通方式

1. 在 `auto-video` 中生成 run：
   - `npm run build`
   - `node dist/scripts/run-demo.js`
2. 找到最新 run 的 `edit-spec/render-input.json`
3. 在 `remotion-app` 中设置 `RENDER_INPUT_FILE` 并渲染：
   - `RENDER_INPUT_FILE=<绝对路径> npm run render:sample`
```

- [ ] **Step 3: 更新架构文档，补充已落地的 MVP 路径**

```md
## 当前 MVP 实现策略（补充）

当前实现采用“stub 浏览器执行器 + 真实 Remotion 渲染器”的路线：
- `auto-video/apps/browser-runner` 先用 stub 产出标准执行事件
- `auto-video/apps/orchestrator` 负责生成 narration、subtitles 和 render-input
- `remotion-app` 读取 `render-input.json` 输出最小产品演示视频

该策略用于先打通数据结构与成片接口，后续再替换为真实浏览器执行器与真实 TTS。
```

- [ ] **Step 4: 构建并验证脚本输出最新 run 路径**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node dist/scripts/render-latest-run.js`
Expected: 输出类似 `A:/study/AI/LLM/browser-use-cli-test/auto-video/runs/demo-.../edit-spec/render-input.json` 的绝对路径。

- [ ] **Step 5: 提交**

```bash
git add auto-video/README.md auto-video/scripts/render-latest-run.ts docs/architecture/auto-video-repo-layout.md
git commit -m "docs: 补充 auto-video MVP 运行与渲染说明"
```

## Task 9: 端到端验证并记录结果

**Files:**
- Modify: `auto-video/README.md`

- [ ] **Step 1: 运行 auto-video MVP 构建与 demo 场景**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run build && node dist/scripts/run-demo.js`
Expected: 生成新的 `runs/demo-<timestamp>/` 目录，且包含 `logs/events.json`、`subtitles/subtitles.json`、`edit-spec/render-input.json`。

- [ ] **Step 2: 渲染基于最新 run 的视频**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && RENDER_INPUT_FILE="$(node dist/scripts/render-latest-run.js)" npm --prefix "../remotion-app" run render:sample`
Expected: 在 `remotion-app/out/` 中生成一条 MP4。

- [ ] **Step 3: 在 README 中记录验证结果与下一阶段替换点**

```md
## 当前验证状态

- [x] Scenario 加载成功
- [x] Stub 浏览器执行器会生成 events 与截图占位文件
- [x] Narration / Subtitle / Edit Spec 已打通
- [x] Remotion 可根据 render-input 输出最小产品演示视频

## 下一阶段替换点

- 将 stub 执行器替换为真实 Agent Browser / Browser Use 适配器
- 将占位字幕时长替换为真实 TTS 音频对齐结果
- 将纯文本高亮框替换为真实截图/录屏画面叠加
```

- [ ] **Step 4: 运行最终静态校验**

Run: `cd "A:/study/AI/LLM/browser-use-cli-test/auto-video" && npm run lint && cd "A:/study/AI/LLM/browser-use-cli-test/remotion-app" && npm run lint`
Expected: 两边都 PASS。

- [ ] **Step 5: 提交**

```bash
git add auto-video/README.md
git commit -m "test: 完成 auto-video MVP 端到端验证"
```

## Self-Review

- Spec coverage: 已覆盖首版 MVP 所需的结构化步骤输入、单一执行器、截图/日志落盘、旁白骨架、字幕占位、Edit Spec、Remotion 成片与可重复渲染路径。未纳入首轮实现的真实 TTS、真实浏览器适配器、多语言与批处理平台均与 spec 中的 MVP 范围一致。
- Placeholder scan: 计划中未使用 TBD/TODO/“后续补充实现细节”等占位语句；每个任务都给出了明确文件、代码片段、命令和预期结果。
- Type consistency: `ScenarioSpec`、`ExecutionEvent`、`NarrationSegment`、`SubtitleCue`、`EditSpec` 的命名在各任务中保持一致；`render-input.json` 在 orchestrator 与 Remotion 之间使用同一概念。
