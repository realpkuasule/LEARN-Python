import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { StoryCheckpoint } from "@/domain/chapter-story";

const CHECKPOINT_LABEL: Readonly<Record<StoryCheckpoint["requirement"], string>> = {
  confirm: "完成任务后确认",
  run: "运行代码后继续",
  success: "运行成功后继续",
  output: "观察输出后继续",
  error: "观察 Python 报错后继续",
  pass: "通过最终挑战后继续",
};

export const storyCheckpointLabel = ({ requirement }: StoryCheckpoint): string => CHECKPOINT_LABEL[requirement];

export const storyProgressAnnouncement = (
  storyComplete: boolean,
  practiceBlocked: boolean,
  checkpoint: StoryCheckpoint | undefined,
  isTyping: boolean,
): string => {
  if (storyComplete) return "本章故事已读完";
  if (checkpoint) return `实践检查点：${storyCheckpointLabel(checkpoint)}`;
  if (practiceBlocked) return "实践检查点：运行一次代码并收到反馈后继续";
  return isTyping ? "正在显示新段落" : "当前段落显示完毕，可以继续";
};

export const StoryPracticeGate = ({
  blocked,
  checkpoint,
  markdown,
  onConfirm,
  onRequestChallenge,
}: {
  readonly blocked: boolean;
  readonly checkpoint?: StoryCheckpoint;
  readonly markdown: string;
  readonly onConfirm: () => void;
  readonly onRequestChallenge: () => void;
}): React.ReactNode => (
  <li className="story-practice-gate" role="status">
    <p className="eyebrow">实践检查点 · {checkpoint ? storyCheckpointLabel(checkpoint) : "运行代码后继续"}</p>
    {checkpoint
      ? <div className="course-prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown></div>
      : <><strong>先运行一次代码，再进入本章回顾</strong><p>成功、失败或报错都算有效尝试。收到右侧「冒险日志」反馈后，即可继续阅读。</p></>}
    {blocked
      ? checkpoint?.requirement === "confirm"
        ? <button className="pixel-button" onClick={onConfirm} type="button">我已完成本节任务</button>
        : <button className="pixel-button" onClick={onRequestChallenge} type="button">前往代码挑战</button>
      : <strong className="status-success">检查点已完成，可以继续</strong>}
  </li>
);
