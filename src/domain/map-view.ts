import { canAccessChapter, type GameState } from "./game-state.ts";

export type ChapterViewState = "completed" | "current" | "available" | "locked";

export const getChapterViewState = (
  game: GameState,
  chapterNumber: number,
): ChapterViewState => {
  if (game.progress.completedChapters.includes(chapterNumber)) return "completed";
  if (!canAccessChapter(game, chapterNumber)) return "locked";
  if (game.progress.currentChapter === chapterNumber) return "current";
  return "available";
};
