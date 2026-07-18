import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { storyMessageText, type StoryMessage, type StoryRole } from "@/domain/chapter-story";
import type { SpriteAsset } from "@/lib/game-art-assets";

import { StoryPortrait } from "./story-speaker-portrait";

export const STORY_ROLE_LABEL: Readonly<Record<StoryRole, string>> = {
  narrator: "旁白",
  hero: "英雄",
  friendly: "友善 NPC",
  neutral: "中立 NPC",
  hostile: "敌对 NPC",
};

export const StoryBubble = ({
  avatarId,
  bossSprite,
  message,
  typingText,
}: {
  readonly avatarId: number;
  readonly bossSprite?: SpriteAsset;
  readonly message: StoryMessage;
  readonly typingText?: string;
}): React.ReactNode => (
  <li className={`story-message story-message-${message.kind}`} data-role={message.role}>
    <div className="story-speaker">
      <StoryPortrait avatarId={avatarId} bossSprite={bossSprite} role={message.role} speaker={message.speaker} />
      <span>
        <small>{STORY_ROLE_LABEL[message.role]}</small>
        <strong>{message.speaker}</strong>
      </span>
    </div>
    <div className="story-bubble-body course-prose">
      {typingText === undefined ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.markdown}</ReactMarkdown>
      ) : (
        <>
          <span className="sr-only">{storyMessageText(message.markdown)}</span>
          <span aria-hidden="true" className="story-typing-text">{typingText}<i className="story-cursor" /></span>
        </>
      )}
    </div>
  </li>
);
