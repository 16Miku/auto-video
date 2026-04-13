# auto-video 工作目录与仓库布局建议

- 日期：2026-04-14
- 主工作目录：`A:/study/AI/LLM/browser-use-cli-test/auto-video`

## 1. 目标

本文档用于明确 `auto-video` 目录在整个仓库中的定位，以及后续工作流搭建时推荐采用的目录布局。

该目录将作为以下能力的主承载位置：
- 浏览器自动化任务编排
- 执行事件采集
- 录屏与截图管理
- 旁白生成
- 字幕生成
- 剪辑决策规划
- Remotion 合成成片

## 2. 在仓库中的定位

当前仓库根目录为：

`A:/study/AI/LLM/browser-use-cli-test`

建议约定如下：

- `docs/`：保存设计文档、架构文档与规划文档
- `remotion-app/`：当前已有的 Remotion 原型项目
- `auto-video/`：未来正式的工作流主目录

即：

```text
A:/study/AI/LLM/browser-use-cli-test/
├─ docs/
├─ remotion-app/
└─ auto-video/
```

## 3. 推荐目录结构

推荐采用以下布局：

```text
auto-video/
├─ docs/
│  ├─ product/
│  ├─ architecture/
│  └─ decisions/
├─ apps/
│  ├─ orchestrator/
│  ├─ browser-runner/
│  └─ video-renderer/
├─ packages/
│  ├─ scenario-schema/
│  ├─ telemetry-schema/
│  ├─ narration-engine/
│  ├─ subtitle-engine/
│  ├─ edit-planner/
│  └─ shared/
├─ assets/
│  ├─ audio/
│  ├─ branding/
│  ├─ fonts/
│  └─ sfx/
├─ scenarios/
│  ├─ examples/
│  └─ fixtures/
├─ runs/
├─ configs/
├─ scripts/
└─ tmp/
```

## 4. 各目录职责

### 4.1 `apps/orchestrator`
负责端到端工作流调度。

职责包括：
- 读取输入 scenario
- 调用浏览器执行层
- 调用旁白与字幕生成层
- 调用剪辑规划层
- 调用 Remotion 渲染层
- 生成最终 run 产物目录

### 4.2 `apps/browser-runner`
负责浏览器自动化执行与采集。

职责包括：
- 对接 Agent Browser / Browser Use
- 执行步骤清单
- 记录日志、截图、录屏、页面摘要
- 输出执行事件

### 4.3 `apps/video-renderer`
负责 Remotion 视频渲染。

职责包括：
- 维护 Composition
- 实现字幕、步骤条、标题、转场、高亮等视觉组件
- 接收 Edit Spec 并输出视频

### 4.4 `packages/scenario-schema`
保存 scenario、step 等核心输入模型定义。

### 4.5 `packages/telemetry-schema`
保存 execution event、capture metadata 等执行轨迹模型定义。

### 4.6 `packages/narration-engine`
保存旁白骨架生成与 LLM 润色逻辑。

### 4.7 `packages/subtitle-engine`
保存 TTS 对齐与字幕时间轴生成逻辑。

### 4.8 `packages/edit-planner`
保存从执行轨迹到 Edit Spec 的自动剪辑规划逻辑。

### 4.9 `packages/shared`
放通用工具、常量、辅助函数、路径工具等共享能力。

### 4.10 `runs/`
保存每次视频生成任务的完整输出。

建议目录示例：

```text
runs/2026-04-14-demo-001/
├─ input/
├─ logs/
├─ screenshots/
├─ recording/
├─ narration/
├─ subtitles/
├─ edit-spec/
└─ output/
```

这是后续排障、复盘、重渲染的关键目录。

## 5. 与 `remotion-app` 的关系

当前已有 `remotion-app` 可作为 Remotion 验证原型使用，但正式实现建议逐步迁移到：

```text
auto-video/apps/video-renderer
```

迁移前的短期策略：
- 在 `remotion-app` 内快速验证视觉模板
- 在 `auto-video` 中搭建整体工作流结构
- 待渲染接口稳定后，将模板与渲染逻辑收敛到正式目录

## 6. 文档保存建议

与 `auto-video` 直接相关的设计与架构文档，建议双存：

1. 仓库根目录 `docs/` 中保存主规格文档
2. `auto-video/docs/` 中保存产品内视角文档与决策记录

这样做的好处是：
- 仓库级文档便于统一查看
- 产品目录内文档便于后续单独抽离或独立演进

## 7. 结论

`auto-video` 应作为后续自动化演示视频系统的正式主工作目录，承载执行、采集、旁白、字幕、剪辑规划与 Remotion 成片全链路能力。

当前建议：
- 先保留 `remotion-app` 作为视觉模板原型
- 逐步把正式系统沉淀到 `auto-video`
- 所有新的系统性设计与实现都围绕 `auto-video` 展开
