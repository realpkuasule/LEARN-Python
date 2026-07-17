"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  buildChapterStory,
  storyMessageText,
  storyMessageUsesTypewriter,
  type StoryMessage,
  type StoryRole,
} from "@/domain/chapter-story";
import type { SpriteAsset } from "@/lib/game-art-assets";
import type { ChapterDetail } from "@/server/chapter-service";

import { EnvironmentBackdrop } from "./environment-backdrop";
import { StageSpeakerPortrait, StoryPortrait } from "./story-speaker-portrait";

interface StoryCourseProperties {
  readonly battleState: "idle" | "running" | "passed" | "failed";
  readonly bossSprite?: SpriteAsset;
  readonly chapter: ChapterDetail;
  readonly completed: boolean;
  readonly heroAvatarId: number;
  readonly heroName: string;
  readonly onRequestChallenge: () => void;
  readonly reducedMotion: boolean;
  readonly sceneAsset: string;
}

interface TypingState {
  readonly messageId: string;
  readonly length: number;
}

const ROLE_LABEL: Readonly<Record<StoryRole, string>> = {
  narrator: "旁白",
  hero: "英雄",
  friendly: "友善 NPC",
  neutral: "中立 NPC",
  hostile: "敌对 NPC",
};

const TYPING_INTERVAL_MS = 16;
const INTRO_HOLD_MS = 2_200;
const TRANSITION_MS = 380;
const SCROLL_CHARACTER_INTERVAL = 24;

const StoryBubble = ({
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
        <small>{ROLE_LABEL[message.role]}</small>
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

export const StoryCourse = ({
  battleState,
  bossSprite,
  chapter,
  completed,
  heroAvatarId,
  heroName,
  onRequestChallenge,
  reducedMotion,
  sceneAsset,
}: StoryCourseProperties): React.ReactNode => {
  const story = useMemo(() => buildChapterStory({
    number: chapter.number,
    title: chapter.title,
    bossName: chapter.bossName,
    heroName,
    markdown: chapter.contentMarkdown,
  }), [chapter, heroName]);
  const [introPhase, setIntroPhase] = useState<"opening" | "closing" | "hidden">("opening");
  const [completedCount, setCompletedCount] = useState(1);
  const [typing, setTyping] = useState<TypingState>({ messageId: "", length: 0 });
  const [outroOpen, setOutroOpen] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const introTimer = useRef<number | undefined>(undefined);
  const nextHref = chapter.number < 17 ? `/chapter/${chapter.number + 1}` : "/hero";
  const nextLabel = chapter.number < 17 ? "前往下一章" : "查看通关角色卡";
  const currentMessage = story.messages[completedCount];
  const currentText = currentMessage ? storyMessageText(currentMessage.markdown) : "";
  const typewriterEnabled = Boolean(currentMessage && !reducedMotion && storyMessageUsesTypewriter(currentMessage));
  const typedLength = typewriterEnabled
    ? currentMessage && typing.messageId === currentMessage.id ? typing.length : 0
    : currentText.length;
  const isTyping = typewriterEnabled && typedLength < currentText.length;
  const storyComplete = completedCount >= story.messages.length;
  const scrollStep = Math.floor(typedLength / SCROLL_CHARACTER_INTERVAL);

  useEffect(() => {
    const delay = reducedMotion ? 1 : introPhase === "opening" ? INTRO_HOLD_MS : TRANSITION_MS;
    if (introPhase === "hidden") return undefined;
    introTimer.current = window.setTimeout(() => {
      setIntroPhase((phase) => phase === "opening" ? "closing" : "hidden");
    }, delay);
    return () => window.clearTimeout(introTimer.current);
  }, [introPhase, reducedMotion]);

  useEffect(() => {
    if (!currentMessage || introPhase !== "hidden" || typedLength >= currentText.length) return undefined;
    const timer = window.setTimeout(() => {
      setTyping({ messageId: currentMessage.id, length: typedLength + 1 });
    }, reducedMotion ? 1 : TYPING_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [currentMessage, currentText.length, introPhase, reducedMotion, typedLength]);

  useEffect(() => {
    feed.current?.scrollTo({
      behavior: reducedMotion || scrollStep > 0 ? "auto" : "smooth",
      top: feed.current.scrollHeight,
    });
  }, [completedCount, reducedMotion, scrollStep]);

  const dismissIntro = (): void => {
    window.clearTimeout(introTimer.current);
    setIntroPhase((phase) => phase === "hidden" ? phase : "closing");
  };

  const advance = (): void => {
    if (introPhase !== "hidden") {
      dismissIntro();
      return;
    }
    if (!currentMessage) return;
    if (isTyping) {
      setTyping({ messageId: currentMessage.id, length: currentText.length });
      return;
    }

    const nextCount = completedCount + 1;
    setCompletedCount(nextCount);
    if (nextCount >= story.messages.length) setOutroOpen(true);
  };

  const revealAll = (): void => {
    setIntroPhase("hidden");
    setCompletedCount(story.messages.length);
    setOutroOpen(true);
  };

  const requestChallenge = (): void => {
    setOutroOpen(false);
    onRequestChallenge();
  };

  return (
    <section
      aria-label={`${story.displayTitle} 叙事课程`}
      className="story-course"
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        advance();
      }}
      tabIndex={0}
    >
      <div className={`story-stage ${currentMessage?.kind === "dialogue" ? "is-dialogue" : ""} ${chapter.isBoss ? `battle-${completed ? "passed" : battleState}` : ""}`}>
        <EnvironmentBackdrop
          alt={`第 ${chapter.number} 章地点：${chapter.location}`}
          priority
          sizes="(max-width: 1023px) calc(100vw - 32px), 42vw"
          src={sceneAsset}
        />
        {currentMessage && (
          <div
            className="story-stage-portrait"
            data-role={currentMessage.role}
            data-side={currentMessage.role === "hero" ? "right" : "left"}
            key={`${currentMessage.role}-${currentMessage.speaker}`}
          >
            <StageSpeakerPortrait bossSprite={bossSprite} message={currentMessage} />
          </div>
        )}
        <header className="story-stage-header">
          <span>第 {chapter.number} 章 · {chapter.location}</span>
          <Link className="story-map-link" href="/map">返回地图</Link>
        </header>
        <div
          className="story-stage-speaker"
          data-role={currentMessage?.role ?? "narrator"}
          data-side={currentMessage?.role === "hero" ? "right" : "left"}
        >
          <span>{ROLE_LABEL[currentMessage?.role ?? "narrator"]}</span>
          <strong>{currentMessage?.speaker ?? "冒险主持人"}</strong>
          <small>{storyComplete ? "故事段落已读完" : `${Math.min(completedCount + 1, story.messages.length)} / ${story.messages.length}`}</small>
        </div>
        {introPhase !== "hidden" && (
          <section aria-label="章节开场" className={`story-title-card ${introPhase}`}>
            <div className="story-title-frame pixel-panel">
              <p>PYTHON DRAGONQUEST</p>
              <h1>{story.displayTitle}</h1>
              <span>{chapter.location}</span>
            </div>
          </section>
        )}
      </div>

      <div className="story-feed" aria-label="课程故事信息流">
        <div className="story-feed-scroll" ref={feed}>
          <div className="story-feed-toolbar">
            <p><strong>冒险记录</strong><span>逐段推进 · 点击可补全当前文字</span></p>
            {!storyComplete && <button className="story-text-button" onClick={revealAll} type="button">显示全部</button>}
          </div>
          <ol className="story-message-list">
            {story.messages.slice(0, completedCount).map((message) => (
              <StoryBubble avatarId={heroAvatarId} bossSprite={bossSprite} key={message.id} message={message} />
            ))}
            {currentMessage && (
              <StoryBubble
                avatarId={heroAvatarId}
                bossSprite={bossSprite}
                message={currentMessage}
                typingText={isTyping ? currentText.slice(0, typedLength) : undefined}
              />
            )}
          </ol>
          {!currentMessage && (
            <footer className="story-feed-ending">
              <p>本章故事已写入冒险记录。完成右侧代码挑战后，即可解锁下一段旅程。</p>
              {completed ? (
                <Link className="pixel-button" href={nextHref}>{nextLabel}</Link>
              ) : (
                <button aria-describedby="next-chapter-lock" className="pixel-button" disabled type="button">{nextLabel}</button>
              )}
              {!completed && <small id="next-chapter-lock">完成代码挑战后解锁</small>}
              {!completed && <button className="pixel-button secondary" onClick={requestChallenge} type="button">前往代码挑战</button>}
            </footer>
          )}
        </div>
        {currentMessage && (
          <button className="story-advance" onClick={advance} type="button">
            <span>{isTyping ? "立即显示本段" : "继续"}</span>
            <kbd>{isTyping ? "CLICK" : "ENTER"}</kbd>
          </button>
        )}
      </div>

      {outroOpen && (
        <section aria-label="本章回顾" className="story-outro">
          <div className="story-outro-card pixel-panel">
            <p className="eyebrow">冒险记录 · 本章结算</p>
            <div className="story-outro-copy course-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{story.recapMarkdown}</ReactMarkdown>
            </div>
            <div className="story-outro-actions">
              <button className="pixel-button secondary" onClick={() => setOutroOpen(false)} type="button">关闭回顾</button>
              {completed ? (
                <Link className="pixel-button" href={nextHref}>{nextLabel}</Link>
              ) : (
                <button className="pixel-button" onClick={requestChallenge} type="button">前往代码挑战</button>
              )}
            </div>
          </div>
        </section>
      )}
      <p aria-live="polite" className="sr-only">
        {storyComplete ? "本章故事已读完" : isTyping ? "正在显示新段落" : "当前段落显示完毕，可以继续"}
      </p>
    </section>
  );
};
