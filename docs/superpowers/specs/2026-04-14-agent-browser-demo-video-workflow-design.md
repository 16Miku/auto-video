# Agent 浏览器自动化产品演示视频工作流设计

- 日期：2026-04-14
- 主工作目录：`A:/study/AI/LLM/browser-use-cli-test/auto-video`
- 仓库根目录：`A:/study/AI/LLM/browser-use-cli-test`
- 当前 Remotion 原型：`A:/study/AI/LLM/browser-use-cli-test/remotion-app`

## 1. 背景与目标

本项目的目标是打造一套面向软件产品、在线网站与 Web SaaS 的自动化视频生产工作流。系统通过 Agent 控制浏览器自动完成真实操作流程，并将操作过程转换为可交付的产品功能演示视频。

首版目标明确如下：

1. 视频类型聚焦“产品功能演示视频”。
2. 自动化程度以“全自动优先”为原则，人工仅做抽检。
3. 对外可逐步支持三类输入：自然语言任务、结构化步骤清单、录制回放脚本。
4. 首版内核统一收敛为结构化步骤清单执行。
5. 旁白采用“规则生成骨架 + LLM 润色”的混合模式。
6. 字幕时间轴以 TTS 音频结果为准进行强制对齐。
7. 视频成片层统一由 Remotion 负责。

本设计聚焦于可产品化、可复用、可追踪、可批量化的工作流，而不是一次性的录屏脚本或单次视频生成任务。

## 2. 设计原则

### 2.1 事件驱动优先

浏览器执行过程不能只产出一个录屏文件，必须产出结构化执行事件。后续的旁白、字幕、镜头规划与 Remotion 合成都基于这些事件进行推导。

### 2.2 录屏只是素材，不是最终真相

首版允许保留整段录屏作为保底素材，但系统不应围绕“录完再剪”来设计，而应围绕“执行事件驱动成片”来设计。录屏、截图、DOM 摘要和时序日志都属于素材来源。

### 2.3 Remotion 作为统一成片引擎

最终视频风格、字幕、转场、高亮、包装、片头片尾、步骤条和品牌元素，都应在 Remotion 中统一表达，避免后期逻辑散落在多个脚本中。

### 2.4 浏览器执行器可替换

当前环境已安装 Agent Browser 与 Browser Use，因此执行层需要抽象统一接口。后续如接入 Playwright、CDP 或其他 Agent 工具，不应影响上层数据结构与成片层。

### 2.5 每次运行必须可回放、可审计、可调试

任意一条视频生成任务都应落盘保存完整 run 目录，包含输入、执行日志、截图、录屏、旁白、字幕、编辑决策和最终视频，便于排障与重复渲染。

## 3. 推荐总体方案

推荐采用三层组合策略：

- 主架构采用“事件驱动型流水线”。
- 首版采集层保留“录屏优先型流水线”作为保底素材来源。
- 后续增强层逐步演进到“镜头脚本型流水线”。

这意味着首版不会只做录屏后处理工具，也不会一开始就做全量镜头重建系统，而是构建一个标准化、可扩展的自动演示视频工作流。

## 4. 总体架构

系统拆分为 6 个核心子系统。

### 4.1 Scenario Ingestor

负责接收外部输入并统一转为内部标准任务。

输入来源包括：
- 自然语言任务
- 结构化步骤清单
- 录制回放脚本

首版内部标准任务至少应包含：
- `scenarioId`
- `target`
- `environment`
- `goal`
- `steps[]`
- `outputProfile`
- `brandProfile`
- `voiceProfile`

该层不负责执行浏览器，只负责把用户需求转换为稳定的内部结构。

### 4.2 Browser Execution Engine

负责驱动浏览器完成任务步骤。

能力范围包括：
- 打开页面
- 点击、输入、滚动、悬停
- 等待条件成立
- 断言页面状态
- 执行失败重试或终止
- 记录步骤起止时间

实现上建议定义统一执行接口，再分别封装 Agent Browser 与 Browser Use 适配器。

### 4.3 Capture & Telemetry Layer

负责采集可用于视频生产的结构化证据和素材。

建议采集内容包括：
- 步骤开始时间、结束时间、耗时
- 页面 URL、标题、关键文案
- DOM 或 a11y 摘要
- 关键动作截图
- 步骤级状态截图
- 鼠标点击点、输入事件摘要
- 可选整段录屏
- 错误截图与错误上下文

这层的产出是一组结构化执行事件与媒体素材，而不是成片。

### 4.4 Narrative Generator

负责根据执行轨迹生成旁白与讲解文本。

建议拆成两级：

1. 规则层：根据动作类型、目标元素、执行结果生成稳定骨架。
2. LLM 层：将骨架润色成自然、连贯、适合产品演示的视频话术。

输出内容至少包括：
- 分句旁白列表
- 每句关联的步骤或步骤区间
- 强调词
- 可选屏幕文案摘要

### 4.5 Timing & Edit Planner

负责把执行轨迹转换为剪辑决策。

主要职责包括：
- 删除无意义等待时间
- 压缩重复性动作
- 识别需要停留展示的关键页面
- 决定是否冻结画面或插入截图镜头
- 生成缩放、高亮、转场建议
- 对齐旁白、字幕和画面段落

产出为标准化的 `Edit Spec`，相当于自动导演层。

### 4.6 Remotion Render Engine

负责根据 `Edit Spec` 统一生成成片。

职责包括：
- 导入录屏片段和截图素材
- 渲染标题、步骤说明、品牌包装
- 叠加字幕
- 根据剪辑规划进行缩放、平移、高亮与转场
- 混入 TTS 音频与 BGM
- 输出最终 MP4

浏览器执行系统负责“做操作”，Remotion 负责“做成片”。

## 5. 关键数据流

推荐的主数据流如下：

`输入任务 -> 标准步骤 -> 浏览器执行 -> 执行轨迹/采集素材 -> 旁白生成 -> TTS -> 字幕对齐 -> 剪辑规划 -> Remotion 合成 -> 输出视频`

首版应避免将“录屏视频”作为唯一中间产物。更合理的中间层是：
- `scenario spec`
- `execution trace`
- `narration spec`
- `subtitle spec`
- `edit spec`

## 6. 核心数据模型设计

### 6.1 ScenarioSpec

用于描述待执行的产品演示任务。

建议字段：
- `scenarioId`
- `name`
- `description`
- `target.baseUrl`
- `authProfile`
- `environment`
- `steps[]`
- `narrationStyle`
- `outputProfile`
- `brandProfile`

### 6.2 StepSpec

用于描述结构化步骤清单中的单个步骤。

建议字段：
- `stepId`
- `kind`：`goto | click | type | select | waitFor | assert | hover | scroll | screenshot | custom`
- `selector` 或元素定位描述
- `inputValue`
- `goal`
- `successCriteria`
- `timeoutMs`
- `retryPolicy`
- `captureHints`
- `narrationHints`

### 6.3 ExecutionEvent

用于记录浏览器执行时产生的关键事件。

建议字段：
- `eventId`
- `stepId`
- `timestamp`
- `eventType`
- `page.url`
- `page.title`
- `elementSummary`
- `actionSummary`
- `screenshotPath`
- `recordingOffsetMs`
- `status`
- `error`

### 6.4 NarrationSegment

用于描述旁白分句。

建议字段：
- `segmentId`
- `stepIds[]`
- `draftText`
- `finalText`
- `emphasisWords[]`
- `voiceStyle`
- `estimatedDurationMs`
- `ttsAudioPath`

### 6.5 SubtitleCue

用于描述字幕片段。

建议字段：
- `cueId`
- `text`
- `startMs`
- `endMs`
- `wordTimings[]`
- `sourceNarrationSegmentId`

### 6.6 EditSpec

用于描述最终视频的镜头与时间线规划。

建议字段：
- `timelineSegments[]`
- `videoClips[]`
- `freezeFrames[]`
- `zooms[]`
- `highlights[]`
- `transitions[]`
- `subtitleTrack`
- `voiceTrack`
- `musicTrack`
- `overlayTrack`
- `outputConfig`

## 7. 首版工作目录建议

用户已指定主工作目录为：

`A:/study/AI/LLM/browser-use-cli-test/auto-video`

建议在该目录下采用如下结构：

```text
auto-video/
├─ docs/
│  ├─ product/
│  └─ architecture/
├─ apps/
│  ├─ orchestrator/
│  ├─ browser-runner/
│  └─ video-renderer/
├─ packages/
│  ├─ scenario-schema/
│  ├─ telemetry-schema/
│  ├─ narration-engine/
│  ├─ edit-planner/
│  └─ shared/
├─ assets/
│  ├─ audio/
│  ├─ fonts/
│  ├─ branding/
│  └─ sfx/
├─ scenarios/
├─ runs/
├─ configs/
└─ scripts/
```

其中：
- `apps/orchestrator` 负责总流程调度。
- `apps/browser-runner` 负责浏览器执行与采集。
- `apps/video-renderer` 负责 Remotion 成片。
- `runs/` 保存每次任务的全量中间产物和结果。

## 8. 与现有 `remotion-app` 的关系

当前仓库中已有 `A:/study/AI/LLM/browser-use-cli-test/remotion-app`，其状态为：
- Remotion 已安装
- Tailwind 已安装
- 当前仅为最小原型
- 现有 `src/Composition.tsx` 为空实现

建议短期内将 `remotion-app` 视为 Remotion 原型实验场，用于快速验证：
- 视频模板结构
- 字幕渲染方式
- 步骤条与高亮动效
- 合成流程是否稳定

待整体工作流稳定后，再决定是否：
1. 将其迁移为 `auto-video/apps/video-renderer`，或
2. 保留为独立原型，再在 `auto-video` 中重建正式渲染器

首版更推荐第 1 种路线，以便形成统一代码库。

## 9. 首版 MVP 范围

首版不追求覆盖所有浏览器自动化场景，而是聚焦于“稳定产出一条高可读性的产品功能演示视频”。

MVP 建议范围：

1. 输入一份结构化步骤清单。
2. 调用单一浏览器执行器稳定跑通。
3. 记录步骤级截图和时间日志。
4. 保留整段录屏作为兜底素材。
5. 基于规则生成旁白骨架。
6. 使用 LLM 对旁白做轻量润色。
7. 生成 TTS 音频。
8. 按 TTS 输出生成字幕时间轴。
9. 用 Remotion 输出一条包含标题、步骤说明、字幕、旁白和简单高亮效果的 MP4。

MVP 明确不包含：
- 通用多浏览器并发调度
- 复杂营销镜头语言系统
- 多语言本地化整套流程
- 大规模批处理调度平台
- 完整 SaaS 化前后端产品

## 10. 失败处理与可观测性设计

为了保证全自动优先的目标，系统必须具备可诊断能力。

建议首版至少实现以下机制：

### 10.1 步骤级失败归因

任何失败都应能定位到：
- 哪个步骤失败
- 当前页面 URL 和标题
- 目标元素摘要
- 最近一次截图
- 最近一次执行事件

### 10.2 运行目录固化

每次运行都输出到独立目录，例如：

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

### 10.3 可重复渲染

当浏览器执行已完成后，旁白、字幕、剪辑和 Remotion 成片阶段应支持离线重跑，不必重新执行浏览器自动化。

## 11. 技术决策摘要

当前已明确的关键决策如下：

1. 工作目录采用 `A:/study/AI/LLM/browser-use-cli-test/auto-video`。
2. 视频目标聚焦“产品功能演示视频”。
3. 自动化程度以全自动优先。
4. 首版对外兼容三种输入，但内核统一为结构化步骤清单。
5. 旁白采用“规则骨架 + LLM 润色”。
6. 字幕以 TTS 音频时间轴为准。
7. 整体采用“事件驱动主架构 + 录屏保底采集 + 镜头脚本后续增强”的路线。
8. Remotion 作为最终统一成片引擎。

## 12. 分阶段演进建议

### Phase 1：稳定生成单条产品演示视频
- 固定结构化步骤输入
- 固定单浏览器执行器
- 固定单套 Remotion 模板
- 单语种旁白与字幕

### Phase 2：提升观感与智能化程度
- 自动删减等待时间
- 自动缩放与高亮
- 更好的镜头节奏规划
- 更自然的产品讲解语言

### Phase 3：面向产品化与批量化
- 多场景 scenario 模板
- 多产品配置
- 批量 runs 调度
- 输出质量分级
- 审核与回放工具

## 13. 当前结论

本项目最合适的方向，不是做一个简单的录屏工具，也不是先做一个重型视频工作站，而是建设一条“事件驱动的自动演示视频流水线”。

Agent 负责完成真实浏览器操作并采集结构化轨迹，Narrative 与 Edit Planner 负责把轨迹翻译成可观看的讲解视频语义，Remotion 负责将这一切统一渲染为稳定、可品牌化、可复用的产品功能演示视频。

这条路线最符合当前环境、现有安装基础以及未来产品化扩展需求。
