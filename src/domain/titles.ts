import { CHAPTERS } from "./chapter-catalog.ts";
import type { GameState } from "./game-state.ts";

export interface TitleDefinition {
  readonly name: string;
  readonly condition: string;
  readonly description: string;
  readonly earned: (state: GameState) => boolean;
}

const completed = (state: GameState, chapter: number): boolean => state.progress.completedChapters.includes(chapter);
const LOOP_TITLE_CHAPTER = 7;
const FUNCTION_TITLE_CHAPTER = 9;
const DATA_TITLE_CHAPTER = 11;
const FILE_TITLE_CHAPTER = 14;
const ERROR_TITLE_CHAPTER = 15;
const CAPITALIST_COINS = 10_000;
const hintUses = (state: GameState): number => Object.values(state.progress.hintsRevealed).reduce((total, count) => total + count, 0);
const completedExerciseInOneAttempt = (state: GameState, chapter: number): boolean => {
  const exerciseId = CHAPTERS[chapter - 1]?.exercise.id;
  return completed(state, chapter) && Boolean(exerciseId) && state.progress.attempts[exerciseId] === 1;
};

export const TITLES: readonly TitleDefinition[] = [
  { name: "初出茅庐", condition: "完成第 1 章", description: "从冒险者公会正式启程。", earned: (state) => completed(state, 1) },
  { name: "史莱姆克星", condition: "完成第 3 章", description: "掌握变量，击败第一只史莱姆。", earned: (state) => completed(state, 3) },
  { name: "条件判断克星", condition: "完成第 5 章", description: "穿过哥布林队长的 if/else。", earned: (state) => completed(state, 5) },
  { name: "循环克星", condition: "完成第 7 章", description: "知道每个 while 都需要出口。", earned: (state) => completed(state, LOOP_TITLE_CHAPTER) },
  { name: "函数克星", condition: "完成第 9 章", description: "让每个函数都交出清晰返回值。", earned: (state) => completed(state, FUNCTION_TITLE_CHAPTER) },
  { name: "数据结构大师", condition: "完成第 11 章", description: "用字典和集合熄灭火元素。", earned: (state) => completed(state, DATA_TITLE_CHAPTER) },
  { name: "文件操作大师", condition: "完成第 14 章", description: "以 UTF-8 解开古代存档。", earned: (state) => completed(state, FILE_TITLE_CHAPTER) },
  { name: "错误处理大师", condition: "完成第 15 章", description: "让异常各归其位。", earned: (state) => completed(state, ERROR_TITLE_CHAPTER) },
  { name: "装备收藏家", condition: "拥有 5 种装备", description: "背包装满了可靠的冒险工具。", earned: (state) => state.inventory.filter(({ itemId }) => itemId !== "hint-potion").length >= 5 },
  { name: "提示药水品鉴师", condition: "使用 10 次提示药水", description: "第十瓶药水依然不呛嗓子。", earned: (state) => hintUses(state) >= 10 },
  { name: "所以你问的谁", condition: "不用提示药水通关", description: "十七章全部靠自己完成。", earned: (state) => completed(state, 17) && hintUses(state) === 0 },
  { name: "速通达人", condition: "任意一章一次通过", description: "第一次运行就通过了挑战。", earned: (state) => CHAPTERS.some((chapter) => completedExerciseInOneAttempt(state, chapter.number)) },
  { name: "赤帝之子", condition: "完成全部 17 章", description: "用十七章 Python 击败白帝之子。", earned: (state) => state.progress.completedChapters.length === 17 },
  { name: "资本家", condition: "金币曾达到 10000", description: "金币堆成山，但没有牛马。", earned: (state) => state.hero.coins >= CAPITALIST_COINS },
  { name: "这个称号有点难度", condition: "所有 Boss 一次通过", description: "十场 Boss 战全部首次提交获胜。", earned: (state) => CHAPTERS.filter(({ isBoss }) => isBoss).every((chapter) => completedExerciseInOneAttempt(state, chapter.number)) },
  { name: "人工智能", condition: "使用 AI 魔法书 50 次", description: "与魔法书的对话已经多到离谱。", earned: (state) => state.achievements.aiRequests >= 50 },
];

export const unlockEarnedTitles = (state: GameState): GameState => {
  const unlockedTitles = [...new Set([
    ...state.achievements.unlockedTitles,
    ...TITLES.filter(({ earned }) => earned(state)).map(({ name }) => name),
  ])];
  if (unlockedTitles.length === state.achievements.unlockedTitles.length) return state;
  return { ...state, achievements: { ...state.achievements, unlockedTitles } };
};

export const selectTitle = (state: GameState, title: string): GameState => {
  if (!state.achievements.unlockedTitles.includes(title)) throw new Error("称号尚未解锁");
  return { ...state, hero: { ...state.hero, title } };
};
