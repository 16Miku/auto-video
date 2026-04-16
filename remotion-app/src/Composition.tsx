import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";

type SegmentText = {
  eyebrow?: string;
  title: string;
  body?: string;
};

type PromoSegmentProps = {
  text: SegmentText;
  align?: "left" | "center";
  darkOverlay?: number;
  placement?: "top-bar" | "bottom-left" | "top-left" | "center";
};

const videoSrc = staticFile("UniClaw-Product.mp4");

type ClipSpec = {
  trimBeforeFrames: number;
  trimAfterFrames: number;
  playbackRate?: number;
};

type SubtitleCue = {
  cueId: string;
  segmentId: string;
  startFrame: number;
  endFrame: number;
  text: string;
};

const clip = (startSeconds: number, endSeconds: number, playbackRate = 1): ClipSpec => ({
  trimBeforeFrames: Math.round(startSeconds * 30),
  trimAfterFrames: Math.round(endSeconds * 30),
  playbackRate,
});

const introClip = clip(0, 5);
const valueClipA = clip(19 * 60 + 42, 19 * 60 + 59);
const valueClipB = clip(20 * 60 + 5, 20 * 60 + 27);
const chatClip = clip(5, 27, 1.6);
const pptTaskClip = clip(4 * 60 + 16, 5 * 60 + 23, 10);
const pptRunClip = clip(5 * 60 + 23, 13 * 60 + 1, 30);
const pptResultClip = clip(13 * 60 + 1, 14 * 60 + 5, 6.5);
const pptShowcaseFastClip = clip(13 * 60 + 40, 13 * 60 + 45, 4);
const pptShowcaseFinalClip = clip(13 * 60 + 58, 14 * 60 + 5, 1);
const pdfUploadClip = clip(16 * 60 + 45, 17 * 60 + 47, 7.2);
const pdfAnswerClip = clip(17 * 60 + 47, 18 * 60 + 52, 10.2);
const ctaFrame = 30;

const subtitleCues: SubtitleCue[] = [
  {
    cueId: "subtitle-segment-a",
    segmentId: "SegmentAIntro",
    startFrame: 0,
    endFrame: 150,
    text: "UniClaw，让 AI 以更高效、更可见的方式完成真实任务。",
  },
  {
    cueId: "subtitle-segment-b",
    segmentId: "SegmentBValue",
    startFrame: 150,
    endFrame: 420,
    text: "它不是只用来聊天的 AI 界面，而是把任务理解、能力调用和执行过程组织在同一个工作流里。",
  },
  {
    cueId: "subtitle-segment-c",
    segmentId: "SegmentCChat",
    startFrame: 420,
    endFrame: 840,
    text: "用户可以直接从自然语言输入开始，快速发起任务，并在统一界面中持续获得响应与后续推进。",
  },
  {
    cueId: "subtitle-segment-d",
    segmentId: "SegmentDModules",
    startFrame: 840,
    endFrame: 1446,
    text: "除了对话入口，UniClaw 还提供结构化能力模块和实例化组织方式，让复杂流程更容易管理，真实的业务反馈也能被直接呈现。",
  },
  {
    cueId: "subtitle-segment-e",
    segmentId: "SegmentEExecution",
    startFrame: 1446,
    endFrame: 1806,
    text: "在执行过程中，任务输入、子步骤和结果反馈都可以被直观查看，帮助团队真正理解 AI 完成了什么。",
  },
  {
    cueId: "subtitle-segment-f",
    segmentId: "SegmentFCTA",
    startFrame: 1806,
    endFrame: 1986,
    text: "UniClaw，帮助团队构建更高效、更可见的 AI 执行工作流。",
  },
];

const FullscreenVideo: React.FC<ClipSpec> = ({ trimBeforeFrames, trimAfterFrames, playbackRate = 1 }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050816" }}>
      <Video
        src={videoSrc}
        muted
        trimBefore={trimBeforeFrames}
        trimAfter={trimAfterFrames}
        playbackRate={playbackRate}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};

const FreezeFrameVideo: React.FC<{frame: number}> = ({ frame }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050816" }}>
      <Img src={`${videoSrc}#t=${(frame / 30).toFixed(3)}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const TextOverlay: React.FC<PromoSegmentProps> = ({ text, align = "left", darkOverlay = 0.14, placement = "bottom-left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isCenter = align === "center" || placement === "center";
  const isTopBar = placement === "top-bar";
  const entrance = spring({
    fps,
    frame,
    durationInFrames: 24,
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const translateY = interpolate(entrance, [0, 1], [24, 0]);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isCenter
            ? `rgba(5, 8, 22, ${darkOverlay})`
            : isTopBar
              ? `linear-gradient(180deg, rgba(5, 8, 22, ${darkOverlay}) 0%, rgba(5, 8, 22, 0.02) 26%, rgba(5, 8, 22, 0) 48%)`
              : `linear-gradient(180deg, rgba(5, 8, 22, ${placement === "top-left" ? 0.42 : 0}) 0%, rgba(5, 8, 22, ${darkOverlay}) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: isCenter ? 120 : isTopBar ? 48 : 72,
          right: isCenter ? 120 : isTopBar ? 48 : "auto",
          top: isTopBar ? 26 : placement === "top-left" ? 64 : isCenter ? 0 : "auto",
          bottom: placement === "bottom-left" ? 64 : isCenter ? 0 : "auto",
          display: "flex",
          alignItems: isCenter ? "center" : "flex-start",
          justifyContent: isCenter ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: isCenter ? 1200 : isTopBar ? "100%" : 760,
            color: "white",
            textAlign: isCenter ? "center" : isTopBar ? "center" : align,
            opacity,
            transform: `translateY(${translateY}px)`,
            padding: isCenter ? 0 : isTopBar ? "12px 28px" : "24px 28px",
            borderRadius: isCenter ? 0 : isTopBar ? 18 : 24,
            background: isCenter ? "transparent" : isTopBar ? "rgba(5, 8, 22, 0.54)" : "rgba(5, 8, 22, 0.56)",
            boxShadow: isCenter ? "none" : isTopBar ? "0 14px 42px rgba(0, 0, 0, 0.22)" : "0 18px 60px rgba(0, 0, 0, 0.28)",
            backdropFilter: isCenter ? "none" : "blur(10px)",
            display: "block",
          }}
        >
          {text.eyebrow ? (
            <div
              style={{
                fontSize: isCenter ? 28 : isTopBar ? 16 : 22,
                letterSpacing: 2,
                textTransform: "uppercase",
                opacity: 0.78,
                marginBottom: isCenter ? 18 : isTopBar ? 8 : 12,
                fontWeight: 600,
                whiteSpace: isTopBar ? "normal" : "normal",
                textAlign: isTopBar ? "center" : undefined,
              }}
            >
              {text.eyebrow}
            </div>
          ) : null}
          <div style={{ flex: isTopBar ? undefined : undefined, textAlign: isTopBar ? "center" : undefined }}>
            <div
              style={{
                fontSize: isCenter ? 86 : isTopBar ? 26 : 46,
                lineHeight: 1.12,
                fontWeight: 800,
                marginBottom: text.body ? (isCenter ? 28 : isTopBar ? 4 : 16) : 0,
              }}
            >
              {text.title}
            </div>
            {text.body ? (
              <div
                style={{
                  fontSize: isCenter ? 34 : isTopBar ? 16 : 24,
                  lineHeight: isTopBar ? 1.35 : 1.5,
                  opacity: 0.9,
                  maxWidth: isCenter ? 1100 : isTopBar ? "100%" : 680,
                }}
              >
                {text.body}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SubtitleTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const activeCue = subtitleCues.find((cue) => frame >= cue.startFrame && frame < cue.endFrame);

  if (!activeCue) {
    return null;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          bottom: 42,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            padding: "16px 24px",
            borderRadius: 22,
            background: "rgba(5, 8, 22, 0.72)",
            color: "white",
            fontSize: 28,
            lineHeight: 1.45,
            fontWeight: 600,
            textAlign: "center",
            boxShadow: "0 16px 42px rgba(0, 0, 0, 0.24)",
            backdropFilter: "blur(10px)",
          }}
        >
          {activeCue.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SegmentIntro = () => {
  return (
    <AbsoluteFill>
      <FullscreenVideo {...introClip} />
      <TextOverlay
        align="center"
        placement="center"
        darkOverlay={0.4}
        text={{
          eyebrow: "UniClaw",
          title: "让 AI 执行流程更清晰、更高效",
          body: "面向官网场景的 60 秒产品宣传视频骨架",
        }}
      />
    </AbsoluteFill>
  );
};

const SegmentValue = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={120}>
        <FullscreenVideo {...valueClipA} />
      </Sequence>
      <Sequence from={120} durationInFrames={150}>
        <FullscreenVideo {...valueClipB} />
      </Sequence>
      <TextOverlay
        placement="top-bar"
        darkOverlay={0.16}
        text={{
          eyebrow: "核心价值",
          title: "统一入口承接任务",
          body: "把任务理解、能力调用和执行过程组织在同一个工作流里。",
        }}
      />
    </AbsoluteFill>
  );
};

const SegmentChat = () => {
  return (
    <AbsoluteFill>
      <FullscreenVideo {...chatClip} />
      <TextOverlay
        placement="top-bar"
        darkOverlay={0.16}
        text={{
          eyebrow: "自然语言入口",
          title: "从输入到响应，一条链路快速闭环",
          body: "用户可以直接发起任务，并在统一界面中持续获得响应与后续推进。",
        }}
      />
    </AbsoluteFill>
  );
};

const SegmentModules = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={75}>
        <FullscreenVideo {...pptTaskClip} />
      </Sequence>
      <Sequence from={75} durationInFrames={135}>
        <FullscreenVideo {...pptRunClip} />
      </Sequence>
      <Sequence from={210} durationInFrames={120}>
        <FullscreenVideo {...pptResultClip} />
      </Sequence>
      <Sequence from={330} durationInFrames={36}>
        <FullscreenVideo {...pptShowcaseFastClip} />
      </Sequence>
      <Sequence from={366} durationInFrames={240}>
        <FullscreenVideo {...pptShowcaseFinalClip} />
      </Sequence>
      <TextOverlay
        placement="top-bar"
        darkOverlay={0.14}
        text={{
          eyebrow: "复杂任务执行",
          title: "从任务发起到结果生成，Agent 持续推进",
          body: "以生成 PPT 为例，UniClaw 能承接复杂任务并在执行过程中持续推进结果。",
        }}
      />
    </AbsoluteFill>
  );
};

const SegmentExecution = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={150}>
        <FullscreenVideo {...pdfUploadClip} />
      </Sequence>
      <Sequence from={150} durationInFrames={210}>
        <FullscreenVideo {...pdfAnswerClip} />
      </Sequence>
      <TextOverlay
        placement="top-bar"
        darkOverlay={0.14}
        text={{
          eyebrow: "文件处理能力",
          title: "上传文档后，理解与回答过程清晰可见",
          body: "从 PDF 上传、发起提问到 Agent 生成回答，业务处理链路可以被直观看见。",
        }}
      />
    </AbsoluteFill>
  );
};

const SegmentCta = () => {
  return (
    <AbsoluteFill>
      <FreezeFrameVideo frame={ctaFrame} />
      <TextOverlay
        align="center"
        placement="center"
        darkOverlay={0.48}
        text={{
          eyebrow: "CTA",
          title: "更高效、更可见的 AI 执行工作流",
          body: "了解 UniClaw，开启更清晰的任务执行方式。",
        }}
      />
    </AbsoluteFill>
  );
};

export const UniClawWebsitePromo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050816", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Audio src={staticFile("uniclaw-voiceover-v1.mp3")} />
      {/* BGM: 淡入 3s -> 配音密集段 0.06 -> 片尾 3s 淡出 */}
      <Audio
        src={staticFile("uniclaw-bgm-v1.mp3")}
        volume={(frame) => {
          const t = frame / 30;
          if (t < 3) return (t / 3) * 0.12;
          if (t > 63.2) return ((66.2 - t) / 3) * 0.12;
          return 0.06;
        }}
      />
      <Sequence durationInFrames={150}>
        <SegmentIntro />
      </Sequence>
      <Sequence from={150} durationInFrames={270}>
        <SegmentValue />
      </Sequence>
      <Sequence from={420} durationInFrames={420}>
        <SegmentChat />
      </Sequence>
      <Sequence from={840} durationInFrames={606}>
        <SegmentModules />
      </Sequence>
      <Sequence from={1446} durationInFrames={360}>
        <SegmentExecution />
      </Sequence>
      <Sequence from={1806} durationInFrames={180}>
        <SegmentCta />
      </Sequence>
      <SubtitleTrack />
    </AbsoluteFill>
  );
};
