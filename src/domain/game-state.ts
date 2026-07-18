import { getChapter } from "./chapter-catalog.ts";
import { addInventoryItem, inventoryQuantity } from "./inventory.ts";
import { unlockEarnedTitles } from "./titles.ts";

export const GAME_STATE_VERSION = 4;
export const DEFAULT_SFX_VOLUME = 0.55;
export const BOSS_EXP_BONUS = 200;
export const BOSS_COIN_BONUS = 300;
const MAX_CHAPTER = 17;
const MAX_STORY_CHECKPOINTS_PER_CHAPTER = 5;
const MAX_HERO_NAME_LENGTH = 16;
const STARTING_ATTACK = 15;

export interface Stats {
  readonly maxHp: number;
  readonly maxMp: number;
  readonly atk: number;
  readonly def: number;
}

export interface EquipmentSlots {
  readonly weapon: string | null;
  readonly helmet: string | null;
  readonly armor: string | null;
  readonly shield: string | null;
  readonly accessory: string | null;
  readonly boots: string | null;
}

export interface GameState {
  readonly version: 4;
  readonly hero: {
    readonly id: string;
    readonly name: string;
    readonly avatarId: number;
    readonly createdAt: string;
    readonly level: number;
    readonly totalExp: number;
    readonly coins: number;
    readonly baseStats: Stats;
    readonly title: string;
    readonly equipment: EquipmentSlots;
  };
  readonly progress: {
    readonly currentChapter: number;
    readonly completedChapters: readonly number[];
    readonly attempts: Readonly<Record<string, number>>;
    readonly hintsRevealed: Readonly<Record<string, number>>;
    readonly storyCheckpoints: Readonly<Record<string, readonly string[]>>;
  };
  readonly inventory: readonly { readonly itemId: string; readonly quantity: number }[];
  readonly achievements: {
    readonly unlockedTitles: readonly string[];
    readonly aiRequests: number;
  };
  readonly settings: {
    readonly soundEnabled: boolean;
    readonly sfxVolume: number;
    readonly reducedMotion: boolean;
  };
}

export type AudioSettings = Pick<GameState["settings"], "soundEnabled" | "sfxVolume">;

const levelForExp = (totalExp: number): number => {
  let level = 1;
  let remaining = totalExp;
  while (remaining >= level * 200) {
    remaining -= level * 200;
    level += 1;
  }
  return level;
};

const statsForLevel = (level: number): Stats => {
  const upgrades = level - 1;
  return {
    maxHp: 100 + upgrades * 20,
    maxMp: 50 + upgrades * 10,
    atk: STARTING_ATTACK + upgrades * 3,
    def: 5 + upgrades * 2,
  };
};

export const createGameState = (
  rawName: string,
  avatarId: number,
  createdAt = new Date().toISOString(),
  id = crypto.randomUUID(),
): GameState => {
  const name = rawName.trim();
  if (!name || name.length > MAX_HERO_NAME_LENGTH) throw new Error("角色名需要 1-16 个字符");
  if (!Number.isInteger(avatarId) || avatarId < 1 || avatarId > 10) throw new Error("头像不存在");

  return {
    version: GAME_STATE_VERSION,
    hero: {
      id,
      name,
      avatarId,
      createdAt,
      level: 1,
      totalExp: 0,
      coins: 0,
      baseStats: statsForLevel(1),
      title: "",
      equipment: {
        weapon: "wood-sword",
        helmet: null,
        armor: "cloth-armor",
        shield: null,
        accessory: null,
        boots: null,
      },
    },
    progress: { currentChapter: 1, completedChapters: [], attempts: {}, hintsRevealed: {}, storyCheckpoints: {} },
    inventory: [
      { itemId: "wood-sword", quantity: 1 },
      { itemId: "cloth-armor", quantity: 1 },
    ],
    achievements: { unlockedTitles: [], aiRequests: 0 },
    settings: { soundEnabled: true, sfxVolume: DEFAULT_SFX_VOLUME, reducedMotion: false },
  };
};

export const updateAudioSettings = (state: GameState, settings: AudioSettings): GameState => {
  if (!Number.isFinite(settings.sfxVolume) || settings.sfxVolume < 0 || settings.sfxVolume > 1) {
    throw new RangeError("音效音量需要在 0 到 1 之间");
  }

  return { ...state, settings: { ...state.settings, ...settings } };
};

export const updateReducedMotion = (state: GameState, reducedMotion: boolean): GameState => ({
  ...state,
  settings: { ...state.settings, reducedMotion },
});

export const canAccessChapter = (state: GameState, chapterNumber: number): boolean => (
  chapterNumber === 1 || chapterNumber <= state.progress.currentChapter
);

export const completeChapter = (state: GameState, chapterNumber: number): GameState => {
  if (state.progress.completedChapters.includes(chapterNumber)) return state;
  if (!canAccessChapter(state, chapterNumber)) throw new Error("该章节尚未解锁");

  const chapter = getChapter(chapterNumber);
  if (!chapter) throw new Error("章节不存在");

  const totalExp = state.hero.totalExp + chapter.rewardExp + (chapter.isBoss ? BOSS_EXP_BONUS : 0);
  const level = levelForExp(totalExp);
  const completedChapters = [...state.progress.completedChapters, chapterNumber].sort((a, b) => a - b);

  let completedState: GameState = {
    ...state,
    hero: {
      ...state.hero,
      totalExp,
      level,
      baseStats: statsForLevel(level),
      coins: state.hero.coins + chapter.rewardCoins + (chapter.isBoss ? BOSS_COIN_BONUS : 0),
      title: chapter.titleReward ?? state.hero.title,
    },
    progress: {
      ...state.progress,
      currentChapter: Math.min(MAX_CHAPTER, Math.max(state.progress.currentChapter, chapterNumber + 1)),
      completedChapters,
    },
  };

  for (const itemId of chapter.dropItemIds ?? []) {
    if (inventoryQuantity(completedState, itemId) === 0) completedState = addInventoryItem(completedState, itemId);
  }
  return unlockEarnedTitles(completedState);
};

export const recordAttempt = (state: GameState, exerciseId: string): GameState => ({
  ...state,
  progress: {
    ...state.progress,
    attempts: {
      ...state.progress.attempts,
      [exerciseId]: (state.progress.attempts[exerciseId] ?? 0) + 1,
    },
  },
});

export const recordStoryCheckpoint = (
  state: GameState,
  chapterNumber: number,
  checkpointId: string,
): GameState => {
  if (!canAccessChapter(state, chapterNumber)) throw new Error("该章节尚未解锁");
  if (!/^[a-z0-9-]{1,64}$/.test(checkpointId)) throw new Error("实践检查点不存在");
  const chapterKey = String(chapterNumber);
  const completed = state.progress.storyCheckpoints[chapterKey] ?? [];
  if (completed.includes(checkpointId)) return state;
  if (completed.length >= MAX_STORY_CHECKPOINTS_PER_CHAPTER) throw new Error("实践检查点数量超过限制");

  return {
    ...state,
    progress: {
      ...state.progress,
      storyCheckpoints: {
        ...state.progress.storyCheckpoints,
        [chapterKey]: [...completed, checkpointId],
      },
    },
  };
};

export const recordAiRequest = (state: GameState): GameState => unlockEarnedTitles({
  ...state,
  achievements: { ...state.achievements, aiRequests: state.achievements.aiRequests + 1 },
});
