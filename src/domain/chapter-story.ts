export const STORY_ROLES = ["narrator", "hero", "friendly", "neutral", "hostile"] as const;

export type StoryRole = (typeof STORY_ROLES)[number];
export type StoryMessageKind = "intro" | "section" | "narration" | "dialogue" | "list" | "code" | "recap";

export interface StoryMessage {
  readonly id: string;
  readonly role: StoryRole;
  readonly speaker: string;
  readonly kind: StoryMessageKind;
  readonly markdown: string;
  readonly section: "body" | "recap";
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

const titleFromMarkdown = (markdown: string, fallback: string): string => {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!heading) return fallback;
  return heading.replace(/^第[一二三四五六七八九十百\d]+课\s*[:：]\s*/, "").trim() || fallback;
};

const chapterDisplayTitle = (number: number, title: string): string => {
  const numeral = CHINESE_CHAPTER_NUMBERS[number] ?? String(number);
  return `第${numeral}章：${title}`;
};

const explicitMessage = (block: string): Pick<StoryMessage, "role" | "speaker" | "kind" | "markdown"> | undefined => {
  const match = block.match(/^(?:\[|【)(旁白|英雄|友善NPC|中立NPC|敌对NPC)(?:(?:\s*[:：]\s*)([^\]】]+))?(?:\]|】)\s*/);
  if (!match) return undefined;

  const role = EXPLICIT_ROLE[match[1] ?? ""];
  if (!role) return undefined;
  const markdown = block.slice(match[0].length).trim();
  if (!markdown) return undefined;
  return {
    role,
    speaker: match[2]?.trim() || DEFAULT_SPEAKERS[role],
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

  const candidates = [
    speakerCandidate(block, "hostile", [
      bossName ?? "", "哥布林队长", "哥布林", "史莱姆", "恶龙", "骷髅", "魔王", "守护者", "地狱犬", "妖精",
    ]),
    speakerCandidate(block, "friendly", [
      "公会会长", "会长", "导师", "铁匠老头", "矮人老板", "老板", "店主", "教授", "学者", "吟游诗人", "药剂师", "牧师", "守卫", "村民",
    ]),
    speakerCandidate(block, "hero", [heroName, "刘老三", "勇者"]),
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
  if (/^#{2,6}\s+/.test(block)) return inRecap ? "recap" : "section";
  if (/^(?:```|~~~)/.test(block)) return "code";
  if (/^(?:[-+*]\s|\d+[.)]\s)/.test(block)) return "list";
  return inRecap ? "recap" : "narration";
};

export const buildChapterStory = ({
  number,
  title,
  markdown,
  bossName,
  heroName = "刘老三",
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

  for (const block of splitMarkdownBlocks(markdown)) {
    if (/^#\s+/.test(block)) continue;
    if (/^##\s+本章回顾\s*$/.test(block)) inRecap = true;

    const kind = blockKind(block, inRecap);
    const explicit = explicitMessage(block);
    const canInferDialogue = kind === "narration" || kind === "recap";
    const dialogue = explicit ?? (canInferDialogue ? inferredDialogue(block, heroName, bossName) : undefined);
    const index = messages.length;
    messages.push({
      id: `chapter-${number}-story-${index}`,
      role: dialogue?.role ?? "narrator",
      speaker: dialogue?.speaker ?? DEFAULT_SPEAKERS.narrator,
      kind: dialogue?.kind ?? kind,
      markdown: dialogue?.markdown ?? block,
      section: inRecap ? "recap" : "body",
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
