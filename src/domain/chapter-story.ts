import type { ExecutionResult } from "./execution";

export const STORY_ROLES = ["narrator", "hero", "friendly", "neutral", "hostile"] as const;

export type StoryRole = (typeof STORY_ROLES)[number];
export type StoryMessageKind = "intro" | "section" | "narration" | "dialogue" | "list" | "code" | "table" | "callout" | "checkpoint" | "recap";
export type StoryCheckpointRequirement = "confirm" | "run" | "success" | "output" | "error" | "pass";
export type StoryRunMode = "locked" | "practice" | "formal";

export interface StoryCheckpoint {
  readonly id: string;
  readonly requirement: StoryCheckpointRequirement;
  readonly instruction: string;
  readonly starterCode?: string;
}

export interface StoryMessage {
  readonly id: string;
  readonly role: StoryRole;
  readonly speaker: string;
  readonly kind: StoryMessageKind;
  readonly markdown: string;
  readonly section: "body" | "recap";
  readonly checkpoint?: StoryCheckpoint;
}

export interface ChapterStory {
  readonly displayTitle: string;
  readonly messages: readonly StoryMessage[];
  readonly recapMarkdown: string;
}

interface BuildChapterStoryInput {
  readonly number: number;
  readonly title: string;
  readonly markdown: string;
  readonly bossName?: string;
  readonly heroName?: string;
}

interface SpeakerMatch {
  readonly index: number;
  readonly role: StoryRole;
  readonly speaker: string;
}

const CHINESE_CHAPTER_NUMBERS = [
  "零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七",
] as const;

const DEFAULT_SPEAKERS: Readonly<Record<StoryRole, string>> = {
  narrator: "冒险主持人",
  hero: "勇者",
  friendly: "友善 NPC",
  neutral: "中立 NPC",
  hostile: "敌对 NPC",
};

const DEFAULT_HERO_NAME = "刘老三";
const CHECKPOINT_PATTERN = /^\[实践检查点:\s*([a-z0-9-]+)\/(confirm|run|success|output|error|pass)\]\s*\n?([\s\S]+)$/;
const EXERCISE_SECTION_PATTERN = /^(?:#{2,6}\s+|\*\*)?(?:练习\s*[一二三123]|本章终局挑战|网站 Boss 终局判定|Boss 终局挑战|最终 Boss 挑战)/i;

const EXPLICIT_ROLE: Readonly<Record<string, StoryRole>> = {
  旁白: "narrator",
  英雄: "hero",
  友善NPC: "friendly",
  中立NPC: "neutral",
  敌对NPC: "hostile",
};

const escapeRegularExpression = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const splitMarkdownBlocks = (markdown: string): readonly string[] => {
  const blocks: string[] = [];
  let current: string[] = [];
  let fence = "";

  const flush = (): void => {
    const block = current.join("\n").trim();
    if (block && !/^[-*_]{3,}$/.test(block)) blocks.push(block);
    current = [];
  };

  for (const line of markdown.replaceAll("\r\n", "\n").split("\n")) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1] ?? "";
      if (!fence) fence = marker[0] ?? "";
      else if (marker.startsWith(fence)) fence = "";
      current.push(line);
      continue;
    }

    if (!fence && line.trim() === "") {
      flush();
      continue;
    }
    current.push(line);
  }
  flush();
  return blocks;
};

const pythonCodeFromFence = (block: string): string | undefined => {
  const match = block.match(/^(```+|~~~+)(?:python|py)?\s*\n([\s\S]*?)\n\1\s*$/i);
  const code = match?.[2]?.trimEnd();
  return code ? `${code}\n` : undefined;
};

const titleFromMarkdown = (markdown: string, fallback: string): string => {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!heading) return fallback;
  return heading.replace(/^第[一二三四五六七八九十百\d]+课\s*[:：]\s*/, "").trim() || fallback;
};

const chapterDisplayTitle = (number: number, title: string): string => {
  const numeral = CHINESE_CHAPTER_NUMBERS[number] ?? String(number);
  return `第${numeral}章：${title}`;
};

const personalizeHeroName = (markdown: string, heroName: string): string => {
  if (heroName === DEFAULT_HERO_NAME || !markdown.includes(DEFAULT_HERO_NAME)) return markdown;
  const titledHeroName = heroName.includes("勇者") ? heroName : `勇者${heroName}`;
  return markdown
    .split(/(`[^`\n]+`)/g)
    .map((part) => part.startsWith("`") ? part : part
      .replaceAll(`勇者${DEFAULT_HERO_NAME}`, () => titledHeroName)
      .replaceAll(DEFAULT_HERO_NAME, () => heroName))
    .join("");
};

const explicitMessage = (
  block: string,
  heroName: string,
): Pick<StoryMessage, "role" | "speaker" | "kind" | "markdown"> | undefined => {
  const match = block.match(/^(?:\[|【)(旁白|英雄|友善NPC|中立NPC|敌对NPC)(?:(?:\s*[:：]\s*)([^\]】]+))?(?:\]|】)\s*/);
  if (!match) return undefined;

  const role = EXPLICIT_ROLE[match[1] ?? ""];
  if (!role) return undefined;
  const markdown = block.slice(match[0].length).trim();
  if (!markdown) return undefined;
  return {
    role,
    speaker: role === "hero" ? heroName : match[2]?.trim() || DEFAULT_SPEAKERS[role],
    kind: role === "narrator" ? "narration" : "dialogue",
    markdown,
  };
};

const speakerCandidate = (
  text: string,
  role: StoryRole,
  aliases: readonly string[],
): SpeakerMatch | undefined => {
  const names = aliases.filter(Boolean).map(escapeRegularExpression).join("|");
  if (!names) return undefined;
  const attribution = new RegExp(`(${names}).{0,12}(?:说|问|喊|吼|咆哮|答|笑|道|嘀咕|低语|开口|叫|一愣|皱起眉|点头|冷笑|[:：])`);
  const afterQuote = new RegExp(`[\"”」』].{0,5}?(${names})`);
  const match = attribution.exec(text) ?? afterQuote.exec(text);
  if (!match) return undefined;
  return { index: match.index, role, speaker: match[1] ?? DEFAULT_SPEAKERS[role] };
};

const inferredDialogue = (
  block: string,
  heroName: string,
  bossName?: string,
): Pick<StoryMessage, "role" | "speaker" | "kind" | "markdown"> | undefined => {
  const hasQuotation = /[\"“「『][^\n\"”」』]{2,}[\"”」』]/.test(block);
  const hasSpeechVerb = /(?:说|问|喊|吼|咆哮|答|笑|道|嘀咕|低语|开口|叫|一愣|皱起眉|点头|冷笑)/.test(block);
  const hasDialogueColon = /[:：]\s*[\"“「『]/.test(block);
  if (!hasQuotation || (!hasSpeechVerb && !hasDialogueColon)) return undefined;
  const secondPersonSpeaks = /^你(?:一愣|愣|皱起眉|点头|点了点头|说|问|喊|吼|答|笑|道|嘀咕|低语|开口|叫)/.test(block)
    || /[\"”」』]你(?:说|问|喊|吼|答|笑|道|嘀咕|低语|开口|叫)/.test(block);
  if (secondPersonSpeaks) {
    return { role: "hero", speaker: heroName, kind: "dialogue", markdown: block };
  }

  const candidates = [
    speakerCandidate(block, "hostile", [
      bossName ?? "", "哥布林队长", "哥布林", "史莱姆", "恶龙", "骷髅", "魔王", "守护者", "地狱犬", "妖精",
    ]),
    speakerCandidate(block, "friendly", [
      "公会会长", "会长", "导师", "铁匠老头", "矮人老板", "老板", "店主", "教授", "学者", "吟游诗人", "药剂师", "牧师", "守卫", "村民",
    ]),
    speakerCandidate(block, "hero", [heroName, DEFAULT_HERO_NAME, "勇者"]),
    speakerCandidate(block, "neutral", ["裁判", "商人", "系统", "路人", "记录员"]),
  ].filter((candidate): candidate is SpeakerMatch => Boolean(candidate));

  const selected = candidates.sort((left, right) => left.index - right.index)[0];
  if (!selected) return undefined;
  return {
    role: selected.role,
    speaker: selected.speaker,
    kind: "dialogue",
    markdown: block,
  };
};

const blockKind = (block: string, inRecap: boolean): StoryMessageKind => {
  if (CHECKPOINT_PATTERN.test(block)) return "checkpoint";
  if (/^#{2,6}\s+/.test(block)) return inRecap ? "recap" : "section";
  if (/^(?:```|~~~)/.test(block)) return "code";
  if (/^>\s?/.test(block)) return "callout";
  if (/^(?:[-+*]\s|\d+[.)]\s)/.test(block)) return "list";
  if (/^\|?.+\|.+\n\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?/.test(block)) return "table";
  return inRecap ? "recap" : "narration";
};

export const storyMessageUsesTypewriter = ({ kind }: Pick<StoryMessage, "kind">): boolean =>
  kind === "narration" || kind === "dialogue" || kind === "recap";

export const storyProgressLimit = (
  messages: readonly StoryMessage[],
  completedCheckpoints: readonly string[],
  hasPracticeFeedback: boolean,
): number => {
  const authoredCheckpoints = messages.filter(({ checkpoint }) => checkpoint);
  if (authoredCheckpoints.length > 0) {
    const completed = new Set(completedCheckpoints);
    const pending = messages.findIndex(({ checkpoint }) => checkpoint && !completed.has(checkpoint.id));
    return pending < 0 ? messages.length : pending;
  }
  if (hasPracticeFeedback) return messages.length;
  const recapIndex = messages.findIndex(({ section }) => section === "recap");
  return recapIndex < 0 ? messages.length : recapIndex;
};

export const storyCheckpointSatisfied = (
  requirement: StoryCheckpointRequirement,
  result: Pick<ExecutionResult, "status" | "stdout">,
): boolean => {
  if (requirement === "confirm") return false;
  if (requirement === "run") return true;
  if (requirement === "success") return result.status === "passed";
  if (requirement === "output") return (result.status === "passed" || result.status === "failed") && result.stdout.trim().length > 0;
  if (requirement === "error") return result.status === "error";
  return result.status === "passed";
};

export const storyRunMode = (
  hasAuthoredCheckpoints: boolean,
  checkpoint?: StoryCheckpoint,
  completed = false,
): StoryRunMode => {
  if (!hasAuthoredCheckpoints || (completed && !checkpoint)) return "formal";
  if (!checkpoint) return "locked";
  if (checkpoint.requirement === "confirm") return "locked";
  return checkpoint.requirement === "pass" ? "formal" : "practice";
};

export const storyPracticeResultMessage = (
  result: Pick<ExecutionResult, "status" | "message">,
  checkpointComplete: boolean,
  formalChallenge: boolean,
  requirement?: StoryCheckpointRequirement,
): string => {
  if (formalChallenge) return result.message;
  if (checkpointComplete && requirement === "output") return "代码已产生输出，实践检查点已完成；请对照左侧目标自查结果。";
  if (checkpointComplete) return "本次练习符合当前运行要求，实践检查点已完成。";
  return result.status === "passed" ? "代码运行成功，但尚未满足当前实践要求。" : result.message;
};

export const buildChapterStory = ({
  number,
  title,
  markdown,
  bossName,
  heroName = DEFAULT_HERO_NAME,
}: BuildChapterStoryInput): ChapterStory => {
  const displayTitle = chapterDisplayTitle(number, titleFromMarkdown(markdown, title));
  const messages: StoryMessage[] = [{
    id: `chapter-${number}-story-0`,
    role: "narrator",
    speaker: DEFAULT_SPEAKERS.narrator,
    kind: "intro",
    markdown: displayTitle,
    section: "body",
  }];
  let inRecap = false;
  let checkpointStarterCode: string | undefined;

  for (const block of splitMarkdownBlocks(markdown)) {
    if (/^#\s+/.test(block)) continue;
    if (/^##\s+本章回顾\s*$/.test(block)) inRecap = true;
    if (EXERCISE_SECTION_PATTERN.test(block)) checkpointStarterCode = undefined;

    const kind = blockKind(block, inRecap);
    if (kind === "code") checkpointStarterCode = pythonCodeFromFence(block);
    const personalizedBlock = kind === "code" ? block : personalizeHeroName(block, heroName);
    const checkpointMatch = kind === "checkpoint" ? personalizedBlock.match(CHECKPOINT_PATTERN) : undefined;
    const checkpointMarkdown = checkpointMatch?.[3]?.trim();
    const checkpointRequirement = checkpointMatch?.[2] as StoryCheckpointRequirement | undefined;
    const checkpoint = checkpointMatch && checkpointMarkdown && checkpointRequirement ? {
      id: checkpointMatch[1] ?? "checkpoint",
      requirement: checkpointRequirement,
      instruction: checkpointMarkdown,
      ...(checkpointRequirement !== "confirm" && checkpointRequirement !== "pass" && checkpointStarterCode
        ? { starterCode: checkpointStarterCode }
        : {}),
    } : undefined;
    const explicit = checkpoint ? undefined : explicitMessage(personalizedBlock, heroName);
    const canInferDialogue = kind === "narration" || kind === "recap";
    const dialogue = explicit ?? (canInferDialogue ? inferredDialogue(personalizedBlock, heroName, bossName) : undefined);
    const index = messages.length;
    messages.push({
      id: `chapter-${number}-story-${index}`,
      role: dialogue?.role ?? "narrator",
      speaker: dialogue?.speaker ?? DEFAULT_SPEAKERS.narrator,
      kind: dialogue?.kind ?? kind,
      markdown: checkpointMarkdown ?? dialogue?.markdown ?? personalizedBlock,
      section: inRecap ? "recap" : "body",
      checkpoint,
    });
  }

  return {
    displayTitle,
    messages,
    recapMarkdown: messages.filter(({ section }) => section === "recap").map(({ markdown: content }) => content).join("\n\n"),
  };
};

export const storyMessageText = (markdown: string): string => markdown
  .replace(/^#{1,6}\s+/gm, "")
  .replace(/^>\s?/gm, "")
  .replace(/^```[^\n]*\n?|```$/gm, "")
  .replace(/^(?:[-+*]\s+|\d+[.)]\s+)/gm, "")
  .replace(/[*_~`]/g, "")
  .trim();
