# UniClaw 已有录屏转官网宣传视频实践复盘与工作流总结

- 项目 ID：`uniclaw-promo-v1`
- 项目目录：`A:/study/AI/LLM/browser-use-cli-test/auto-video/projects/uniclaw-promo-v1`
- Remotion 项目目录：`A:/study/AI/LLM/browser-use-cli-test/remotion-app`
- 输入素材：`A:/study/AI/LLM/browser-use-cli-test/UniClaw-Product.mp4`
- 当前 Composition：`UniClawWebsitePromoV1`
- 当前画布：`1920x1080`
- 当前帧率：`30fps`
- 当前总时长：`1986` 帧，约 `66.2s`
- 文档定位：实践复盘 + 工作流总结
- 主要读者：未来复盘者、团队成员、后续对外复用该流程的人

## 1. 本次实践的目标

本次实践的目标，是验证一条新的产品宣传视频生成路线：

> 不再依赖 browser-use / Playwright 实时操作产品并录屏，而是直接使用一条已有产品演示录屏作为输入素材，再通过结构化分镜、真实切片、Remotion 合成，生成适合官网使用的产品宣传视频。

这个目标背后有几个具体诉求：

1. **从已有录屏中提炼宣传片素材**
   - 原始录屏是一条完整产品操作视频，时长较长，不能直接作为官网宣传片使用。
   - 需要从中选取能代表产品价值的画面片段。

2. **从“操作记录”转成“产品叙事”**
   - 原始视频按真实操作顺序展开，包含等待、重复、试错、页面切换等内容。
   - 宣传片需要围绕产品价值重新组织，而不是简单裁短原视频。

3. **验证结构化中间产物的价值**
   - 通过 `storyboard.json`、`edit-spec.json` 等中间文件承载分镜、时间线、素材切片和旁白信息。
   - 让后续 Remotion 实现、人工审阅和迭代修改都有明确依据。

4. **打通 Remotion 最小可运行链路**
   - 在 `remotion-app` 中注册正式 composition。
   - 使用原视频作为背景素材。
   - 通过 `Sequence`、`Video`、`trimBefore`、`trimAfter`、`playbackRate` 拼接出真实成片时间线。

## 2. 当前产物概览

本次实践已经形成以下主要产物。

### 2.1 剪辑执行稿

文件：`uniclaw-website-promo-edit-script-v1.md`

用途：

- 定义官网宣传视频的定位、受众、风格和叙事结构；
- 将成片拆为 A-F 六个 Segment；
- 为每段提供目标、建议画面、屏幕文案、中文旁白和 Remotion 对接建议。

最初目标时长为 60 秒，后续由于 D 段新增完整 PPT 展示片段，当前实际成片时长扩展为约 66.2 秒。

### 2.2 Storyboard

文件：`storyboard.json`

用途：

- 承载内容策划层的分镜结构；
- 描述每段的目标、建议视觉、屏幕文案、旁白文案和剪辑备注；
- 适合作为人工审阅和后续自动化生成 edit spec 的输入。

注意：当前 `storyboard.json` 仍保留最初 60 秒结构，其内容层仍有效，但时间层已经落后于最新 Remotion 实现。后续需要同步为 66.2 秒版本。

### 2.3 Edit Spec

文件：`edit-spec.json`

用途：

- 承载渲染执行层的核心契约；
- 明确 composition、fps、画布、源视频、每段 timeline、真实素材区间、播放速度、屏幕文案、旁白和 overlay 设想；
- 当前已经同步到 `1986` 帧版本。

当前关键配置：

- `compositionId`: `UniClawWebsitePromoV1`
- `fps`: `30`
- `durationInFrames`: `1986`
- `canvas`: `1920x1080`
- `sourceVideo.path`: `A:/study/AI/LLM/browser-use-cli-test/UniClaw-Product.mp4`

### 2.4 Remotion 实现

关键文件：

- `remotion-app/src/Root.tsx`
- `remotion-app/src/Composition.tsx`
- `remotion-app/public/UniClaw-Product.mp4`

当前实现特点：

- 已注册 `UniClawWebsitePromoV1`；
- 使用 `@remotion/media` 的 `Video` 播放源素材；
- 使用 `Sequence` 组织 A-F 段；
- 使用 `trimBefore` / `trimAfter` 进行真实切片；
- 使用 `playbackRate` 对长等待、长执行过程做快进；
- 使用 `Img` + `#t=` 实现 CTA 固定帧；
- 当前已经通过 `npm run lint` 校验。

## 3. 从“占位版”到“真实切片版”的关键转变

最初 Remotion 骨架只是验证 composition 能运行：

- A-F 每段都播放同一条完整视频；
- 只有上层文案在变化；
- 还没有真实切片、字幕、配音和 BGM。

用户预览后指出关键问题：

1. 每段都在播放同一整段视频，只是文字不同；
2. 文字层遮挡产品界面；
3. 没有字幕、配音、BGM；
4. 缺少真实切片。

这次反馈推动实践进入真正的剪辑阶段。核心转变是：

> 不再把原视频当作统一背景，而是把原视频看作素材库，为每个 Segment 精确选择源时间段，并在 Remotion 中按片段重组。

实际实现上，使用了以下 Remotion 参数：

```tsx
<Video
  src={videoSrc}
  muted
  trimBefore={trimBeforeFrames}
  trimAfter={trimAfterFrames}
  playbackRate={playbackRate}
  objectFit="cover"
  style={{ width: "100%", height: "100%" }}
/>
```

其中：

- `trimBefore`：源视频开始帧；
- `trimAfter`：源视频结束帧；
- `playbackRate`：播放速度；
- `Sequence`：控制该片段在成片时间线中的位置和可见时长。

一个重要经验是：

> Remotion 中片段能否完整显示，不只取决于 `trimBefore` / `trimAfter` 和 `playbackRate`，还取决于外层 `Sequence durationInFrames` 是否足够长。

这也是后来 D4b 被截断问题的根因。

## 4. 人工识别母视频时间段

真实切片的前提，是先知道原始 21 分钟左右的录屏中，哪些时间段对应哪些产品能力。

本次实践中，用户重新观看完整母视频后，先给出了一轮粗粒度内容识别：

| 原视频时间段 | 内容判断 |
|---|---|
| `0:00-0:53` | 输入“你好”，收到回复 |
| `0:57-4:15` | 输入查询新闻，生成回复 |
| `4:16-14:12` | 输入生成 PPT 的任务，Agent 长时间自动运行并生成 PPT |
| `16:45-19:25` | 上传本地 PDF，要求进行解读 |
| `19:42-20:41` | 翻看各个页面 |

这一步非常关键，因为它把长录屏从“不可直接使用的一整段素材”，转换成了“可以按业务能力索引的素材库”。

随后，用户进一步给出了更细的可剪辑时间点：

| 片段 | 原视频时间段 | 用途 |
|---|---:|---|
| A | `0:00-0:05` | 片头背景 |
| B1 | `19:42-19:59` | 页面翻看 / 价值概览 |
| B2 | `20:05-20:27` | 页面翻看 / 价值概览补充 |
| C | `0:05-0:27` | 输入“你好”并看到回复 |
| D1 | `4:16-5:23` | 发起生成 PPT 任务 |
| D2 | `5:23-13:01` | Agent 执行 PPT 生成过程 |
| D3 | `13:01-14:05` | 下载生成的 PPT 并展示效果 |
| D4a | `13:40-13:45` | 补充展示生成好的 PPT，需快进 |
| D4b | `13:58-14:05` | 补充展示生成好的 PPT，正常速度完整展示 |
| E1 | `16:45-17:47` | 上传本地 PDF，发起提问 |
| E2 | `17:47-18:52` | Agent 运行并生成回答 |
| F | `0:01` 固定帧 | 结尾 CTA 背景 |

后续所有 Remotion 真实切片，都是围绕这张人工识别表展开。

### 4.1 经验：人工识别仍然非常有价值

虽然长期目标可以是自动分析录屏、自动抽帧、自动 OCR、自动生成分镜，但在 MVP 阶段，人工识别母视频时间点非常有效：

- 速度快，不需要先实现完整视频理解系统；
- 用户能直接判断哪些画面对产品表达最有价值；
- 可以快速验证 Remotion 合成链路；
- 后续再把人工经验沉淀成自动分析规则。

在本次实践中，如果没有用户重新观看母视频并给出时间点，系统只能停留在“每段都播放同一整条视频”的占位阶段。

## 5. 当前最终时间线

经过多轮预览和调整后，当前成片从原计划的 60 秒扩展到约 66.2 秒。

### 5.1 总时间线

| Segment | 起始帧 | 时长帧 | 起始秒 | 时长秒 | 说明 |
|---|---:|---:|---:|---:|---|
| A Intro | `0` | `150` | `0.0s` | `5.0s` | 片头引入 |
| B Value | `150` | `270` | `5.0s` | `9.0s` | 核心价值概述 |
| C Chat | `420` | `420` | `14.0s` | `14.0s` | 聊天与统一入口展示 |
| D Modules | `840` | `606` | `28.0s` | `20.2s` | PPT 任务与结果展示 |
| E Execution | `1446` | `360` | `48.2s` | `12.0s` | PDF 上传与回答生成 |
| F CTA | `1806` | `180` | `60.2s` | `6.0s` | 收尾总结与 CTA |
| Total | `0` | `1986` | `0.0s` | `66.2s` | 当前总时长 |

对应文件：

- `remotion-app/src/Root.tsx`
- `remotion-app/src/Composition.tsx`
- `auto-video/projects/uniclaw-promo-v1/edit-spec.json`

### 5.2 D 段内部时间线

D 段是本次实践中调整最多的部分，因为它要在较短时间内同时表达：

1. 用户发起生成 PPT 任务；
2. Agent 长时间自动执行；
3. PPT 生成结果出现；
4. 最终 PPT 展示效果。

当前 D 段内部配置如下：

| 子片段 | 原视频时间段 | D 段内起始帧 | D 段内时长帧 | 播放速度 | 用途 |
|---|---:|---:|---:|---:|---|
| D1 / `pptTaskClip` | `4:16-5:23` | `0` | `75` | `10x` | 发起生成 PPT 任务 |
| D2 / `pptRunClip` | `5:23-13:01` | `75` | `135` | `30x` | Agent 执行过程快进 |
| D3 / `pptResultClip` | `13:01-14:05` | `210` | `120` | `6.5x` | 下载并展示 PPT 结果 |
| D4a / `pptShowcaseFastClip` | `13:40-13:45` | `330` | `36` | `4x` | 快速补充 PPT 展示 |
| D4b / `pptShowcaseFinalClip` | `13:58-14:05` | `366` | `240` | `1x` | 正常速度完整展示 PPT |

D 段总时长为：

```text
75 + 135 + 120 + 36 + 240 = 606 帧
606 / 30 = 20.2 秒
```

### 5.3 E 段内部时间线

E 段用于展示 PDF 上传、提问、Agent 生成回答的链路。

当前 E 段内部配置如下：

| 子片段 | 原视频时间段 | E 段内起始帧 | E 段内时长帧 | 播放速度 | 用途 |
|---|---:|---:|---:|---:|---|
| E1 / `pdfUploadClip` | `16:45-17:47` | `0` | `150` | `7.2x` | 上传 PDF 并发起提问 |
| E2 / `pdfAnswerClip` | `17:47-18:52` | `150` | `210` | `10.2x` | Agent 运行并生成回答 |

用户已确认：E 段顺延后节奏可以接受。

## 6. 关键迭代过程复盘

### 6.1 C 段：从看不到回复到能看到回复

C 段最初使用 `0:05-0:25`，后来用户修正为 `0:05-0:27`，以便包含最后回复出现的画面。

之后用户反馈：

> C 段仍然看不到最后回答出现就切到下一视频段了，需要改进切片的快进速度。

最终通过将 C 段播放速度调整为 `1.6x`，用户确认：

> C 段加速后，可以看到最后的回复了。

这个过程说明：

- 源视频时间段选对，不等于成片一定能看到目标画面；
- 还要考虑目标片段在成片中实际分配的时长；
- 对话类片段需要优先确保“输入 -> 发送 -> 回复出现”的因果链完整。

### 6.2 D 段：从纯快进到增加结果展示补片

D 段最初只是把 `4:16-14:05` 这段 PPT 生成过程压进一个 Segment。

用户多次反馈：

- D 段看不完整；
- D 段速度仍需大幅增加；
- 需要在 D3 后增加一个片段展示生成好的 PPT。

因此，D 段逐步演进为：

1. D1：任务发起；
2. D2：执行过程快进；
3. D3：下载并展示结果；
4. D4a：PPT 展示快进补片；
5. D4b：PPT 展示正常速度完整补片。

这说明，对长任务演示来说，单纯调高 `playbackRate` 不一定足够。更好的方式是：

> 将长过程拆成“发起 / 执行 / 结果 / 成果展示”几个叙事节点，再分别决定正常播放、快进或补片。

### 6.3 D4b 截断问题：外层 Sequence 限制比内部片段更关键

D4b 的目标是完整展示 `13:58-14:05`，用户希望原本约 8 秒的内容完整显示。

一开始只把 D4b 子片段自身 `durationInFrames` 改到 `240` 帧，但用户仍看到它没有完整展示。

排查后发现：

- D4b 子片段已经是 `240` 帧；
- 但外层 D 段仍然只有 `420` 帧；
- D 段内部子片段总和已经达到 `606` 帧；
- 外层 `SegmentModules` 在 420 帧结束时，会直接截断后面的内部 Sequence。

根因是：

> 内部 Sequence 的时长增加后，外层 Segment 的 `durationInFrames` 也必须同步增加，否则后面的内部片段仍然会被父级时间线截断。

最终采用方案 B：允许总片长变长。

调整结果：

- D 段从 `420` 帧扩展到 `606` 帧；
- E 段起始帧从 `1260` 顺延到 `1446`；
- F 段起始帧从 `1620` 顺延到 `1806`；
- 总时长从 `1800` 帧扩展到 `1986` 帧。

用户最终确认：

1. D4b 已经完整显示 8 秒；
2. E 段顺延后节奏可以接受；
3. 整体成片约 66.2 秒可以接受。

## 7. 本次实践沉淀出的可复用工作流

从这次实践看，“已有录屏 -> 官网宣传视频”的流程可以沉淀为一个可复用工作流。

### 7.1 阶段一：明确目标与约束

首先要明确以下问题：

1. 输入是什么：已有录屏、直播录屏、剪辑素材包，还是多段演示视频；
2. 输出是什么：官网宣传片、产品介绍片、销售演示片，还是社媒短视频；
3. 时长目标是什么：严格 60 秒、可浮动到 70 秒，还是优先完整表达；
4. 优先表达什么：产品价值、操作流程、结果展示，还是品牌感；
5. 哪些内容可后置：字幕、配音、BGM、视觉包装是否放到第二阶段。

如果这些约束不先说清楚，后面很容易在“要不要保留完整结果展示”“能不能接受总时长变长”这类问题上反复拉扯。

### 7.2 阶段二：先写执行稿，再写结构化中间产物

推荐顺序是：

1. 先写剪辑执行稿；
2. 再整理 storyboard；
3. 再生成 edit spec；
4. 最后进入 Remotion 实现。

原因是：

- 执行稿更适合先讨论“这条视频要表达什么”；
- storyboard 更适合承载每段目标、文案、画面建议；
- edit spec 更适合承载帧级时间线、真实切片、速度、实现参数；
- Remotion 代码应该尽量消费前面这些结构化结果，而不是一开始就在代码里硬编码所有决定。

本次实践说明，这条链路是有效的，只是 `storyboard.json` 后续没有及时同步到最新版时间线，需要补上这一步。

### 7.3 阶段三：优先做“最小可运行预览”

不要一开始就追求：

- 真实切片；
- 字幕；
- 配音；
- BGM；
- 精细排版；
- 动效包装；
- 局部放大和 callout。

更高效的方式是先做一个最小可运行版：

- composition 能正常注册；
- Remotion Studio 能打开；
- 视频能正常播放；
- A-F 段能按时间线切换；
- 上层文案能叠上去。

有了这个骨架后，才能快速暴露真正的问题，比如：

- 每段都在播同一整条视频；
- 文案遮挡严重；
- 某些段没有看到结果；
- 某些段被切得太快；
- 某些段需要补片。

### 7.4 阶段四：由用户人工识别母视频，再进入真实切片

如果没有现成的自动视频分析能力，推荐直接请用户人工识别母视频区间。

推荐做法：

1. 先让用户粗粒度标注能力区间；
2. 再把高价值区间细化到可剪辑时间点；
3. 按业务叙事而不是按原操作顺序组织片段；
4. 用结构化表格记录所有切片。

这一步是从“录屏素材库”到“宣传片叙事素材”的关键桥梁。

### 7.5 阶段五：先调切片与节奏，再做包装层

这次实践一个非常明确的经验是：

> 在切片、速度、段落结构还没稳定之前，不要急着做字幕、配音、BGM 和复杂包装。

因为这些内容都强依赖时间线。

例如：

- 只要 D 段长度还没定，字幕时间轴就会变；
- 只要 D4b 还没确定要不要完整 8 秒，配音文案长度就不稳定；
- 只要 E 段还在调速，BGM 节拍点也很难定。

因此，推荐顺序是：

1. 先锁定素材区间；
2. 再锁定段落内部结构；
3. 再锁定总时间线；
4. 最后叠加字幕、配音、BGM、callout、动效。

## 8. 实施检查清单

下面这份清单可以作为后续同类项目的通用检查项。

### 8.1 内容策划层

- [ ] 是否明确成片目标、目标受众、风格和时长约束
- [ ] 是否先有逐段执行稿，而不是直接写代码
- [ ] 是否把视频拆成可讨论的 Segment
- [ ] 每个 Segment 是否都明确“目标 / 画面 / 文案 / 旁白 / Remotion 对接建议”

### 8.2 素材识别层

- [ ] 是否完成母视频粗粒度能力识别
- [ ] 是否完成细粒度切片时间点标注
- [ ] 是否区分“价值展示片段”和“过程等待片段”
- [ ] 是否把时间点整理为结构化表格或 JSON

### 8.3 Remotion 骨架层

- [ ] 是否已注册正式 composition
- [ ] 是否能在 Studio 中稳定预览
- [ ] 是否把源素材放入 `public/`
- [ ] 是否通过 `npm run lint`

### 8.4 真实切片层

- [ ] 是否使用 `trimBefore` / `trimAfter`
- [ ] 是否为长过程片段设置合适的 `playbackRate`
- [ ] 是否把长过程拆成多个叙事节点，而不是只靠单段快进
- [ ] 是否检查父级 `Sequence durationInFrames` 足够容纳所有子片段

### 8.5 包装与完成层

- [x] 是否优化文字遮挡（顶部栏单列居中布局）
- [x] 是否补齐字幕轨（6 段整句级字幕）
- [x] 是否接入中文配音（edge-tts XiaoxiaoNeural）
- [x] 是否接入 BGM（inspiring technology corporate 风格，动态音量）
- [x] 是否把 `storyboard.json`、`edit-spec.json`、代码实现同步到同一版本

### 8.6 字幕轨实现要点

字幕轨是"静音可读"的关键保障。本次实现经验如下：

#### 数据层：subtitle-track.json

字幕文件按 Segment 组织为 cue 数组，每个 cue 包含：

```json
{
  "cueId": "subtitle-segment-a",
  "segmentId": "SegmentAIntro",
  "startFrame": 0,
  "endFrame": 150,
  "text": "UniClaw，让 AI 以更高效、更可见的方式完成真实任务。"
}
```

`startFrame` 和 `endFrame` 与 Remotion 中的 Sequence 时间线严格对应，后续无论怎么调整 Segment 时长，都以这个文件为准。

#### 渲染层：SubtitleTrack 组件

```tsx
const SubtitleTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const activeCue = subtitleCues.find(
    (cue) => frame >= cue.startFrame && frame < cue.endFrame
  );
  if (!activeCue) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 140, right: 140, bottom: 42,
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          maxWidth: 1080, padding: "16px 24px", borderRadius: 22,
          background: "rgba(5, 8, 22, 0.72)", color: "white",
          fontSize: 28, lineHeight: 1.45, fontWeight: 600,
          textAlign: "center",
          boxShadow: "0 16px 42px rgba(0, 0, 0, 0.24)",
          backdropFilter: "blur(10px)",
        }}>
          {activeCue.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

#### 两个关键实现细节

1. **`pointerEvents: "none"` 必须放在 `style` 里**，不能作为 `AbsoluteFill` 的 props 传递，否则 TypeScript 报错 `Property 'pointerEvents' does not exist`。

2. **字幕 cue 的时间区间用左闭右开 `[startFrame, endFrame)`**，查找时 `frame >= startFrame && frame < endFrame`，避免相邻 cue 在边界帧都匹配的问题。

#### 为什么用整句级而非逐词高亮

当前字幕是 Segment 级别的整句字幕，理由是：
- 实现最简单，调试成本最低；
- 配音和字幕同步的最小粒度就是整句；
- 逐词高亮需要配音时间轴对齐，增加复杂度和维护成本。

后续如需逐词高亮，可基于 `voiceover-script.json` 的每句时长在 Remotion 中做更细粒度的拆分。

### 8.7 关键设计决策框架：Option A vs Option B

本次实践中出现了多次"压缩 vs 接受更长时长"的二选一决策：

| 场景 | Option A（压缩） | Option B（接受更长） | 本次选择 |
|------|----------------|-------------------|---------|
| D4b 片段太长 | 压缩 D4b 到 4 秒以内 | 接受 D4b 完整 8 秒，D 段延长到 606 帧 | B |
| 总时长超 60 秒 | 强行压缩各段 | 接受 66.2 秒完整叙事 | B |

**决策框架**：

> 当某个 Segment 的时长问题无法通过调速解决时，优先考虑"让叙事完整"，而不是"让总时长符合最初目标"。
>
> 原因：官网宣传片的核心目标是"把产品价值讲清楚"，而非"严格卡在 60 秒"。压缩到不完整，反而失去意义。
>
> 但如果甲方明确要求 60 秒以内，则 Option A 是唯一选择，需提前对齐预期。

### 8.8 文字遮挡布局的迭代经验

顶部栏文案布局经历了 4 轮迭代：

1. **top-left 信息卡**：初期在左下角放置半透明卡片，对产品界面遮挡最少，但用户反馈"和产品界面割裂感强"
2. **顶部栏（top-bar）**：移到顶部居中，减少对中央画面的遮挡
3. **顶部栏居中文字**：从 left-align 改为 center-align，但发现左中右三块内容距离太远
4. **顶部栏单列居中**：eyebrow + title + body 纵向排列，居中于顶部，听起来最合理

**经验总结**：
- 顶部栏的文案安全区很窄（左右 48px、上下 26-64px），字号和 padding 过大会直接遮挡产品界面
- 遇到遮挡问题时，优先从"布局位置"想办法，而不是从"降低透明度"（会丢失文字可读性）
- 背景渐变 + backdrop-filter blur 是兼顾"不遮挡画面"和"文字可读"的有效手段

### 8.9 Studio 预览与渲染出片的区别

Remotion Studio 实时预览和最终渲染出片存在显著差异：

| 方面 | Studio 实时预览 | 最终渲染出片 |
|------|---------------|------------|
| playbackRate > 10x | 可能卡顿、音画不同步 | 流畅，ffmpeg 硬解码 |
| 多 Sequence 嵌套 | 帧率不稳 | 稳定输出 |
| 音频同步 | 可能偏差几帧 | 精确到帧 |
| 文字动效 | 可能掉帧 | 逐帧渲染 |

**本次实践中发现的典型问题**：D 段用 30x 快进时，Studio 预览明显卡顿，但渲染出视频后画面流畅。

**建议**：Studio 预览只做"节奏大致正确"的判断，最终质量验证必须以渲染出片为准。

## 9. 当前遗留问题与下一阶段待办

虽然当前时间线已经稳定，但项目仍有明显未完成项。

### 9.1 遗留问题

1. **文字遮挡已通过顶部栏布局改善** ✅
   - 通过将文案从"左下角信息卡"迁移到"顶部单列居中栏"，大幅减少了中央画面遮挡；
   - 后续如需进一步优化，可调整字号、安全区和蒙版强度。

2. **字幕轨已接入** ✅
   - 整句级字幕轨已接入，6 个 Segment 全部有对应字幕 cue；
   - 字幕显示在底部居中，带半透明背景和圆角。

3. **中文配音已接入** ✅
   - 使用 edge-tts（XiaoxiaoNeural）生成第一版中文配音；
   - 配音文件：`remotion-app/public/uniclaw-voiceover-v1.mp3`；
   - 通过 `<Audio src={staticFile("uniclaw-voiceover-v1.mp3")} />` 在 Composition 顶层接入；
   - 配音时长约 66 秒，与视频总时长基本对齐。

4. **BGM 已接入** ✅
   - 使用 `inspiring technology corporate` 风格 BGM（66 秒）；
   - BGM 文件：`remotion-app/public/uniclaw-bgm-v1.mp3`；
   - 通过 Remotion 动态音量控制：淡入 0-3s → 正常段 0.2 → 淡出 63.2-66.2s；
   - 峰值 0.4，确保配音清晰可辨、BGM 作为氛围底层。

5. **结构化产物已同步** ✅
   - `edit-spec.json`、`storyboard.json`、`subtitle-track.json`、`voiceover-script.json` 均已更新到最新版本并提交。

### 9.2 推荐下一步

视频核心层（切片+字幕+配音+BGM）已基本完成，下一步建议：

1. **优化配音与时间线匹配**
   - 检查每段配音是否在对应 Segment 时间内说完；
   - 如有句子过长或过短，通过微调语速（`rate` 参数）修正；
   - 极端情况才修改 Segment 时长。
2. **字幕精细化（可选）**
   - 如果需要逐词高亮型字幕，再基于配音做音素级时间对齐。
3. **渲染出片验证**
   - 用 `npm run build` 渲染完整视频，验证 Studio 预览与最终出片的一致性。

## 10. 中文配音接入：edge-tts 实践

### 10.1 整体流程

本次接入中文配音采用 edge-tts 路线，完整流程如下：

```
voiceover-script.json（结构化旁白文本）
    → edge-tts 生成各段 MP3
    → ffmpeg 合并为单条音轨
    → 放入 remotion-app/public/
    → <Audio src={staticFile("uniclaw-voiceover-v1.mp3")} /> 接入 Composition
```

### 10.2 voiceover-script.json

结构化旁白脚本文件，核心字段：

```json
{
  "compositionId": "UniClawWebsitePromoV1",
  "language": "zh-CN",
  "ttsEngine": "edge-tts",
  "voice": "zh-CN-XiaoxiaoNeural",
  "segments": [
    {
      "segmentId": "SegmentAIntro",
      "startFrame": 0,
      "endFrame": 150,
      "durationFrames": 150,
      "text": "UniClaw，让 AI 以更高效、更可见的方式完成真实任务。"
    }
  ]
}
```

这个文件是配音文本的单一数据源，后续无论用 edge-tts 还是 ElevenLabs 或人工录音，都复用同一份契约。

### 10.3 edge-tts 中文语音选项

edge-tts 内置多个中文 voice，推荐按场景选用：

| Voice | 特点 | 适用场景 |
|---|---|---|
| `zh-CN-XiaoxiaoNeural` | 专业女声，清晰流畅 | 产品介绍、官网宣传片（本次选用） |
| `zh-CN-YunxiNeural` | 年轻男声，有点活泼 | 科技产品演示、年轻化品牌 |
| `zh-CN-YunjianNeural` | 阳刚男声 | 强技术感、专业工具类 |
| `zh-CN-XiaoyiNeural` | 温柔女声 | 情感类、教育类内容 |
| `zh-CN-YunyangNeural` | 新闻播报风格 | 资讯类内容 |

常用参数：
- `rate`：语速，如 `"+10%"` 加快，`"-10%"` 减慢
- `pitch`：音高，如 `"+5Hz"` 略升高

### 10.4 ffmpeg 路径经验

在 Windows 环境下，ffmpeg 不一定已全局安装。本次发现 Remotion 依赖包中自带 ffmpeg：

```
remotion-app/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe
```

可用于音频合并等操作，无需额外安装。Linux/macOS 下 Remotion 也有对应版本。

### 10.5 配音生成的 Python 脚本

参考 `generate_voiceover.py`，核心逻辑：

```python
from edge_tts import Communicate

async def generate_segment(text: str, output_path: str):
    voice = "zh-CN-XiaoxiaoNeural"
    communicate = Communicate(text, voice, rate="+0%", pitch="+0Hz")
    await communicate.save(output_path)

# 合并所有段
subprocess.run([
    FFMPEG, "-y",
    "-f", "concat", "-safe", "0",
    "-i", concat_list,  # 每行 "file 'xxx.mp3'"
    "-acodec", "libmp3lame", "-q:a", "2",
    "uniclaw-voiceover-v1.mp3"
])
```

### 10.6 Remotion Audio 层接入

在 `Composition.tsx` 的根 composition 中加入：

```tsx
import { Audio, staticFile } from "remotion";

export const UniClawWebsitePromo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050816" }}>
      {/* 顶层统一音频层 */}
      <Audio src={staticFile("uniclaw-voiceover-v1.mp3")} />
      <Sequence durationInFrames={150}><SegmentIntro /></Sequence>
      {/* ... 其他 Segments */}
    </AbsoluteFill>
  );
};
```

当前采用统一单条音轨方式（不分段），原因是字幕和文案都是整句级，简化实现复杂度。

### 10.7 配音与时间线匹配策略

edge-tts 按自然语速生成，实际时长不一定精确对齐目标帧数。推荐处理策略：

1. **先按目标时长生成首版**：每段配音应该说的内容对应目标帧数，如 150 帧 ≈ 5 秒
2. **检查实际生成时长**：如某段配音明显短于/长于目标时间
3. **微调顺序**：先调文字内容长度 → 次调语速（rate） → 最后才改 Segment 时长
4. **不要频繁修改 Segment 时长**：因为它会影响所有子片段的时间基准

### 10.8 playbackRate 对音频的影响

在 Remotion 中使用 `playbackRate` 对视频片段做倍速播放时：
- 视频和音频都会同步变速
- 高倍速（如 30x）会给浏览器解码带来很大压力
- **建议对高倍速片段同时设置为 `muted: true`**，只保留配音音轨，避免同时处理两套音频

D 段经验值参考：
- 10x 以内：音频仍可接受，muted 视频可保证画面流畅
- 20x 以上：强烈建议 `muted: true`，否则 Studio 预览会卡顿

## 11. BGM 接入实践

### 11.1 整体流程

BGM 接入采用"Remotion 动态音量控制"路线，完整流程如下：

```
选择 BGM 风格（Pixabay Music：轻科技感、Corporate）
    → 下载 MP3 放入 public/
    → 在 Composition 顶层加入 <Audio>，带 volume 回调函数
    → Studio 预览调试音量
    → 满意后用 process_bgm.py 做 FFmpeg 预混合出最终版（可选）
```

### 11.2 BGM 文件获取

**来源**：Pixabay Music（商用免费，无需署名）
**推荐关键词**：`"light technology"`、`"corporate tech"`、`"upbeat corporate"`
**时长选择**：优先选 60-90 秒，接近或略长于视频时长，避免循环接缝

本次选用：`inspiring technology corporate` 风格，时长约 66 秒，与视频等长无需循环。

### 11.3 Remotion 动态音量实现

在 `Composition.tsx` 的 `UniClawWebsitePromo` 顶层加入两条 Audio：

```tsx
{/* 配音：固定音量 */}
<Audio src={staticFile("uniclaw-voiceover-v1.mp3")} />

{/* BGM：动态音量 */}
<Audio
  src={staticFile("uniclaw-bgm-v1.mp3")}
  volume={(frame) => {
    const t = frame / 30;
    if (t < 3) return (t / 3) * 0.4;        // 淡入 0→0.4
    if (t > 63.2) return ((66.2 - t) / 3) * 0.4; // 淡出 0.4→0
    return 0.2;                                   // 配音密集段 0.2
  }}
/>
```

**音量决策依据**：

| 段落 | 时长 | BGM 音量 | 理由 |
|------|------|---------|------|
| 淡入段 | 0-3s | 0→0.4 | 片头无配音，BGM 可略高 |
| 正常段 | 3-63.2s | 0.2 | 配音密集，压低 BGM 确保人声清晰 |
| 淡出段 | 63.2-66.2s | 0.4→0 | 配音渐少，BGM 可渐强再淡出 |

### 11.4 process_bgm.py 脚本

当 Studio 预览音量满意后，可用 `process_bgm.py` 做 FFmpeg 预混合，生成单一音频文件用于最终渲染：

```bash
python process_bgm.py \
  --bgm uniclaw-bgm-v1.mp3 \
  --voiceover uniclaw-voiceover-v1.mp3 \
  --output final-audio.mp3
```

脚本功能：aloop 循环 BGM → afade 淡入淡出 → amix 与配音混合 → loudnorm 音量标准化。

### 11.5 调试与迭代

**Studio 预览阶段**（当前）：用 Remotion 动态音量直接调试，改参数后刷新即可听到效果，改动成本低。

**最终出片阶段**：Studio 预览满意后，再用 FFmpeg 出单一混合音频，渲染速度更快、音质更稳定。

## 12. Remotion 实现模式总结

本节总结本次实践中实际用到的 Remotion 核心模式，可作为后续同类项目的参考模板。

### 12.1 项目结构约定

```
remotion-app/
├── public/               ← 所有源素材放这里（视频、音频、图片）
│   ├── UniClaw-Product.mp4
│   ├── uniclaw-voiceover-v1.mp3
│   └── uniclaw-bgm-v1.mp3
├── src/
│   ├── Composition.tsx   ← 主 composition（含所有 Segment 组件）
│   └── Root.tsx         ← composition 注册（durationInFrames、fps、dimensions）
└── package.json
```

**关键原则**：
- 源素材必须放 `public/`，不能放 `src/` 或其他目录
- 代码中通过 `staticFile("文件名")` 引用，`public/` 会被 Remotion 打包识别

### 12.2 素材引用：`staticFile()`

```tsx
import { staticFile } from "remotion";
import { Audio } from "@remotion/media";

// 视频/音频/图片统一用 staticFile
const videoSrc = staticFile("UniClaw-Product.mp4");
<Audio src={staticFile("uniclaw-voiceover-v1.mp3")} />
```

`staticFile()` 会返回正确编码的 URL，支持部署到子目录时路径仍有效。文件名中的特殊字符（`#`、`?`、`&`）会自动编码。

### 12.3 视频切片工具函数：`clip()`

封装 `trimBefore` / `trimAfter` / `playbackRate` 为一个语义清晰的函数：

```tsx
type ClipSpec = {
  trimBeforeFrames: number;
  trimAfterFrames: number;
  playbackRate: number;
};

const clip = (
  startSeconds: number,
  endSeconds: number,
  playbackRate = 1
): ClipSpec => ({
  trimBeforeFrames: Math.round(startSeconds * 30),
  trimAfterFrames: Math.round(endSeconds * 30),
  playbackRate,
});

// 使用示例
const pptRunClip = clip(5 * 60 + 23, 13 * 60 + 1, 30); // 5:23-13:01, 30x速

// 在 FullscreenVideo 中使用
<Video
  src={videoSrc}
  muted
  trimBefore={trimBeforeFrames}
  trimAfter={trimAfterFrames}
  playbackRate={playbackRate}
  style={{ width: "100%", height: "100%", objectFit: "cover" }}
/>
```

### 12.4 时间驱动：`useCurrentFrame()` + `useVideoConfig()`

所有动态逻辑（字幕激活判断、文字入场动画、BGM 音量回调）都基于这两个 Hook：

```tsx
const frame = useCurrentFrame();      // 当前帧号（从 0 开始）
const { fps } = useVideoConfig();    // 获取 fps（30）
const seconds = frame / fps;          // 转为秒

// 字幕激活判断
const activeCue = subtitleCues.find(
  (cue) => frame >= cue.startFrame && frame < cue.endFrame  // 左闭右开
);

// BGM 动态音量
<Audio src={staticFile("bgm.mp3")} volume={(f) => {
  const t = f / fps;
  if (t < 3) return (t / 3) * 0.4;  // 淡入
  if (t > 63.2) return ((66.2 - t) / 3) * 0.4;  // 淡出
  return 0.2;
}} />
```

### 12.5 文字入场动画：`spring()` + `interpolate()`

```tsx
import { spring, interpolate } from "remotion";

const entrance = spring({
  frame,           // 当前帧
 fps,             // 帧率
  config: { damping: 200, stiffness: 200 },  // 阻尼/刚度
});

const opacity = interpolate(frame, [0, 10], [0, 1], {
  extrapolateRight: "clamp",
});
const translateY = interpolate(entrance, [0, 1], [24, 0]);
```

`spring()` 用于有物理感的弹性入场，`interpolate()` 用于线性过渡（透明度、位移等）。

### 12.6 Sequence 嵌套与时长管理

```tsx
export const UniClawWebsitePromo = () => {
  return (
    <AbsoluteFill>
      {/* 顶层：按帧位置排列各 Segment */}
      <Sequence durationInFrames={150}>      <SegmentIntro />      </Sequence>
      <Sequence from={150} durationInFrames={270}>  <SegmentValue />  </Sequence>
      <Sequence from={420} durationInFrames={420}> <SegmentChat />   </Sequence>
      <Sequence from={840} durationInFrames={606}>  <SegmentModules /> </Sequence>
      <Sequence from={1446} durationInFrames={360}> <SegmentExecution /> </Sequence>
      <Sequence from={1806} durationInFrames={180}> <SegmentCta />     </Sequence>
      {/* 全局层：字幕和音频在最顶层 */}
      <SubtitleTrack />
    </AbsoluteFill>
  );
};
```

**重要原则**：父级 Sequence 的 `durationInFrames` 必须足够容纳所有子片段的总时长，否则子片段会被截断。本次 D4b 截断问题就是因此产生。

### 12.7 TypeScript 类型限制（踩坑清单）

| 错误写法 | 正确写法 | 原因 |
|---------|---------|------|
| `<AbsoluteFill pointerEvents="none">` | `<AbsoluteFill style={{ pointerEvents: "none" }}>` | `pointerEvents` 不是 AbsoluteFill 的 prop |
| `<Video style={{ objectFit: "cover" }}>` | `<Video objectFit="cover">` | `objectFit` 应作为 prop，而非 style |
| `playbackRate={0}` | 不支持，改为纯色背景 | Remotion 要求 playbackRate > 0 |
| `import ... from "subtitle-track.json"` | 内联为 TypeScript 常量数组 | tsconfig 缺少 `resolveJsonModule` |

### 12.8 多层 Audio 混合

配音和 BGM 各为独立音轨，由 Remotion 实时混合：

```tsx
{/* 配音：固定音量 */}
<Audio src={staticFile("uniclaw-voiceover-v1.mp3")} />

{/* BGM：动态音量 */}
<Audio
  src={staticFile("uniclaw-bgm-v1.mp3")}
  volume={(frame) => getDynamicVolume(frame, fps)}
/>
```

调试阶段用独立音轨更灵活；最终出片时可用 FFmpeg `amix` 预混合为单条音轨，提升渲染性能。

### 12.9 字幕 cue 的帧区间设计

字幕 cue 数据结构采用**左闭右开**区间：

```tsx
const activeCue = subtitleCues.find(
  (cue) => frame >= cue.startFrame && frame < cue.endFrame
);
```

这样设计是为了避免相邻 cue 在边界帧同时匹配。每条 cue 包含：

```tsx
type SubtitleCue = {
  cueId: string;
  segmentId: string;
  startFrame: number;
  endFrame: number;
  text: string;
};
```

### 12.10 Remotion 最佳实践规则中值得下次尝试的模式

以下 remotion-best-practices 中的能力本次未使用，但适合在更复杂的视频中引入：

**1. `TransitionSeries` / 过渡系统**（`@remotion/transitions`）
- 在 Segment 切换时添加 fade / slide / wipe 过渡效果
- 过渡会重叠相邻场景，实际总时长比各段相加更短

**2. `premountFor` 预加载优化**
```tsx
<Sequence premountFor={1 * fps}>
  <HeavyComponent />
</Sequence>
```
在 Sequence 实际播放前提前加载，避免首次出现时卡顿。

**3. `calculateMetadata` 动态时长**
- 从视频文件动态读取实际时长，替代手动指定 `durationInFrames`
- 适合素材时长不确定的场景

**4. `toneFrequency` 音高调整**
- 在不改变速度的情况下调整音高，适合配音需要微调音调时使用
- 仅在服务端渲染时生效

**5. FFmpeg 音频操作**
- `loudnorm` 音量标准化（本次用 `process_bgm.py` 的雏形）
- `silencedetect` 自动检测静音段，用于自动剪辑

## 13. 对后续自动化能力的启发

这次实践不仅是在做一条视频，也在暴露后续值得自动化的环节。

### 13.1 可以自动化的部分

1. **母视频分析**
   - 自动抽帧；
   - 自动 OCR；
   - 自动聚类页面切换；
   - 自动识别“结果出现”的关键时刻。

2. **粗分镜生成**
   - 根据视频识别结果自动生成候选片段；
   - 再让用户只做筛选，而不是从零给时间点。

3. **结构化产物生成**
   - 从执行稿自动生成 storyboard；
   - 从 storyboard 自动生成 edit spec；
   - 从 edit spec 自动生成 Remotion 代码骨架。

4. **字幕与配音生成**
   - 从旁白稿直接生成字幕轨；
   - 自动估算句长与时间线匹配；
   - 自动挂接配音音频文件。

### 13.2 暂时不适合完全自动化的部分

1. **价值判断**
   - 哪个画面更能体现产品价值，仍需要用户或策划判断；
   - 自动系统可以给候选，但很难直接替代人工判断。

2. **节奏取舍**
   - 是保留 60 秒更紧凑，还是接受 66.2 秒以保留完整 PPT 展示，这属于传播策略，不只是技术问题。

3. **最终审美判断**
   - 文案是否遮挡、节奏是否舒适、结果展示是否足够清楚，最终仍需人工预览确认。

## 14. 渲染出片与关键技术问题

本次渲染阶段发现并解决了多个之前未暴露的技术问题。

### 14.1 配音时长必须与视频帧对齐

**问题**：第一版配音由 6 段 MP3 直接合并生成，总时长仅 51.72 秒，而视频需要 66.2 秒。E 段后半和 F 段全程没有配音，字幕和配音完全错位。

**根因**：edge-tts 按自然语速生成每句配音，合并后各段之间没有静音填充，导致整体比目标帧时长短很多。

**解决方案**：生成 v2 脚本，每段配音后自动测量实际朗读时长，再用 `anullsrc` 生成静音填充到目标秒数，最终配音总时长精确对齐 66.26 秒。

**经验**：配音脚本必须在每段后加入静音填充，不能假设各段配音时长等于目标帧时长。

### 14.2 FreezeFrameVideo 的渲染兼容性问题

**问题 1 - `#t=` 帧引用在 CLI 渲染时不可用**：`Img src="video.mp4#t=1.0"` 这种引用依赖 HTTP 服务器，CLI 渲染时失败。

**问题 2 - `playbackRate={0}` 不支持**：Remotion 的 `<Video>` 要求 playbackRate 必须是大于 0 的实数，设为 0 会抛出 `TypeError: Playback rate must be a real number above 0`。

**解决方案**：CTA 段改用纯色背景（`#050816`），设计上更简洁有力，且避免了对视频帧的依赖。

**经验**：在 Remotion 中实现"冻结帧"效果，不要用 `#t=` 或 `playbackRate=0`，直接用纯色背景或预渲染图片更可靠。

### 14.3 渲染帧范围约定

**问题**：执行 `remotion render --frames=0-1986` 报错：`frame range 0-1986 is not inbetween 0-1985`。

**原因**：Remotion 的帧编号从 0 开始，总帧数 1986 意味着最后一帧是 1985（第 1986 帧）。帧范围是左闭右开 `[start, end)`。

**正确写法**：`--frames=0-1985` 或 `--frames=0-1986`（后者会自动处理）。

### 14.4 Remotion 渲染的磁盘空间要求

**问题**：C 盘只剩 104MB，渲染时报 `ENOSPC: no space left on device`。

**原因**：Remotion 渲染时需要：
- webpack bundle 缓存（约 400MB/次）
- Chromium headless 浏览器（约 100MB）
- 临时帧文件

**经验**：渲染前确保 C 盘至少有 **5-10GB** 可用空间。临时文件目录为 `%TEMP%`，其中的 `remotion-webpack-bundle-*` 可在渲染前手动清理。

### 14.5 Studio 预览不等于最终渲染结果

**现象**：Studio 预览时 D 段 30x 快进明显卡顿，但最终渲染出片后画面流畅。

**原因**：Studio 实时预览受浏览器解码性能限制，而渲染使用 ffmpeg 硬解码，效率高得多。

**经验**：Studio 预览只做"节奏和布局是否正确"的判断，不要用 Studio 预览来评估最终画面质量。最终质量必须以渲染出片为准。

## 15. 小结

这次实践已经验证了如下结论：

1. **已有录屏完全可以作为官网宣传片的原始输入素材；**
2. **结构化中间产物能够有效连接策划与实现；**
3. **Remotion 非常适合承担”真实切片 + 时间线重组 + 文案叠加”的角色；**
4. **用户人工识别母视频时间点，是当前阶段非常高效的真实切片前置步骤；**
5. **长任务演示不应只靠整体快进，更适合拆成多个叙事节点分别处理；**
6. **父级 Sequence 时长必须和内部片段总时长一起设计，否则会出现”内部已改长、外层仍截断”的典型问题；**
7. **在切片与节奏收敛之前，不应过早投入字幕、配音、BGM 等包装层；**
8. **edge-tts 是快速生成中文配音的有效工具，XiaoxiaoNeural 适合产品介绍类视频；**
9. **Remotion 捆绑的 ffmpeg 可直接用于音频合并等操作，无需额外安装；**
10. **高倍速视频片段应设为 muted，只保留配音音轨，避免浏览器解码压力导致卡顿；**
11. **BGM 应以配音清晰可辨为前提，音量控制在 0.15-0.25 峰值（配音密集段更低）；**
12. **配音每段后必须加入静音填充对齐目标帧时长，不能假设自然语速等于目标时长；**
13. **Remotion 中实现冻结帧不要用 `#t=` 或 `playbackRate=0`，直接用纯色背景更可靠；**
14. **Remotion 渲染帧范围是左闭右开 [start, end)，总帧数 N 意味着最后一帧是 N-1；**
15. **渲染前确保 C 盘有 5-10GB 可用空间，Studio 预览不等于最终渲染质量。**

到当前为止，这条从”已有录屏”到”完整音视频合成”的最小可运行工作流已经跑通。

下一阶段的重点，不再是“能不能播出来”，而是：

> 如何把当前这版可运行时间线，继续提升到更适合正式发布的官网成片质量。
