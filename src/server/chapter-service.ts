import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { CHAPTERS, getChapter, type Chapter, type Exercise } from "../domain/chapter-catalog.ts";

export type ChapterSummary = Omit<Chapter, "sourcePath" | "exercise">;
export type PublicExercise = Exercise;
export type ChapterDetail = ChapterSummary & {
  readonly contentMarkdown: string;
  readonly exercise: PublicExercise;
};

const summarizeChapter = (chapter: Chapter): ChapterSummary => ({
  number: chapter.number,
  title: chapter.title,
  location: chapter.location,
  region: chapter.region,
  isBoss: chapter.isBoss,
  bossName: chapter.bossName,
  rewardExp: chapter.rewardExp,
  rewardCoins: chapter.rewardCoins,
  titleReward: chapter.titleReward,
});

export const listChapterSummaries = (): readonly ChapterSummary[] => CHAPTERS.map(summarizeChapter);

export const readChapterDetail = async (chapterNumber: number): Promise<ChapterDetail | undefined> => {
  const chapter = getChapter(chapterNumber);
  if (!chapter) return undefined;

  const contentMarkdown = await readFile(
    resolve(process.cwd(), "docs", "Python-DragonQuest", basename(chapter.sourcePath)),
    "utf8",
  );
  const exercise: PublicExercise = {
    id: chapter.exercise.id,
    chapterNumber: chapter.exercise.chapterNumber,
    title: chapter.exercise.title,
    instructions: chapter.exercise.instructions,
    starterCode: chapter.exercise.starterCode,
    testCount: chapter.exercise.testCount,
  };
  return { ...summarizeChapter(chapter), contentMarkdown, exercise };
};
