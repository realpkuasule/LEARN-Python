import { DEFAULT_SFX_VOLUME, type GameState } from "./game-state.ts";
import { TITLES, unlockEarnedTitles } from "./titles.ts";

type JsonRecord = Record<string, unknown>;

const TOP_LEVEL_KEYS = ["version", "hero", "progress", "inventory", "achievements", "settings"] as const;
const LEGACY_TOP_LEVEL_KEYS = ["version", "hero", "progress", "inventory", "settings"] as const;
const HERO_KEYS = ["id", "name", "avatarId", "createdAt", "level", "totalExp", "coins", "baseStats", "title", "equipment"] as const;
const STATS_KEYS = ["maxHp", "maxMp", "atk", "def"] as const;
const EQUIPMENT_KEYS = ["weapon", "helmet", "armor", "shield", "accessory", "boots"] as const;
const PROGRESS_KEYS = ["currentChapter", "completedChapters", "attempts", "hintsRevealed"] as const;
const LEGACY_PROGRESS_KEYS = ["currentChapter", "completedChapters", "attempts"] as const;
const ACHIEVEMENT_KEYS = ["unlockedTitles", "aiRequests"] as const;
const SETTINGS_KEYS = ["soundEnabled", "sfxVolume", "reducedMotion"] as const;
const LEGACY_SETTINGS_KEYS = ["soundEnabled", "reducedMotion"] as const;
const INVENTORY_KEYS = ["itemId", "quantity"] as const;
const MAX_CHAPTER = 17;
const MAX_HINTS_PER_EXERCISE = 3;
const MAX_INVENTORY_ITEMS = 20;
const TITLE_NAMES = new Set(TITLES.map(({ name }) => name));

const isRecord = (value: unknown): value is JsonRecord => (
  typeof value === "object" && value !== null && !Array.isArray(value)
);

const hasExactKeys = (value: JsonRecord, keys: readonly string[]): boolean => {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => Object.hasOwn(value, key));
};

const isIntegerAtLeast = (value: unknown, minimum: number): value is number => (
  Number.isInteger(value) && Number(value) >= minimum
);

const isStats = (value: unknown): boolean => {
  if (!isRecord(value) || !hasExactKeys(value, STATS_KEYS)) return false;
  return isIntegerAtLeast(value.maxHp, 1)
    && isIntegerAtLeast(value.maxMp, 0)
    && isIntegerAtLeast(value.atk, 0)
    && isIntegerAtLeast(value.def, 0);
};

const isEquipment = (value: unknown): boolean => {
  if (!isRecord(value) || !hasExactKeys(value, EQUIPMENT_KEYS)) return false;
  return EQUIPMENT_KEYS.every((key) => value[key] === null || typeof value[key] === "string");
};

const isHero = (value: unknown): boolean => {
  if (!isRecord(value) || !hasExactKeys(value, HERO_KEYS)) return false;
  return typeof value.id === "string"
    && typeof value.name === "string"
    && value.name.length >= 1
    && value.name.length <= 16
    && isIntegerAtLeast(value.avatarId, 1)
    && Number(value.avatarId) <= 10
    && typeof value.createdAt === "string"
    && !Number.isNaN(Date.parse(value.createdAt))
    && isIntegerAtLeast(value.level, 1)
    && isIntegerAtLeast(value.totalExp, 0)
    && isIntegerAtLeast(value.coins, 0)
    && typeof value.title === "string"
    && isStats(value.baseStats)
    && isEquipment(value.equipment);
};

const hasValidProgressValues = (value: JsonRecord): boolean => {
  if (!isIntegerAtLeast(value.currentChapter, 1) || Number(value.currentChapter) > MAX_CHAPTER) return false;
  if (!Array.isArray(value.completedChapters)) return false;
  const chapters = value.completedChapters;
  if (!chapters.every((chapter) => isIntegerAtLeast(chapter, 1) && chapter <= MAX_CHAPTER)) return false;
  if (new Set(chapters).size !== chapters.length) return false;
  if (!isRecord(value.attempts)) return false;
  return Object.values(value.attempts).every((attempts) => isIntegerAtLeast(attempts, 0));
};

const isLegacyProgress = (value: unknown): value is JsonRecord => (
  isRecord(value) && hasExactKeys(value, LEGACY_PROGRESS_KEYS) && hasValidProgressValues(value)
);

const isProgress = (value: unknown): boolean => {
  if (!isRecord(value) || !hasExactKeys(value, PROGRESS_KEYS) || !hasValidProgressValues(value)) return false;
  if (!isRecord(value.hintsRevealed)) return false;
  return Object.values(value.hintsRevealed).every((count) => (
    isIntegerAtLeast(count, 0) && Number(count) <= MAX_HINTS_PER_EXERCISE
  ));
};

const isInventory = (value: unknown): boolean => (
  Array.isArray(value)
  && value.length <= MAX_INVENTORY_ITEMS
  && value.every((entry) => (
      isRecord(entry)
      && hasExactKeys(entry, INVENTORY_KEYS)
      && typeof entry.itemId === "string"
      && entry.itemId.length > 0
      && isIntegerAtLeast(entry.quantity, 1)
    ))
  && new Set(value.map((entry) => (entry as JsonRecord).itemId)).size === value.length
);

const isAchievements = (value: unknown): boolean => {
  if (!isRecord(value) || !hasExactKeys(value, ACHIEVEMENT_KEYS)) return false;
  if (!Array.isArray(value.unlockedTitles) || new Set(value.unlockedTitles).size !== value.unlockedTitles.length) return false;
  return value.unlockedTitles.every((title) => typeof title === "string" && TITLE_NAMES.has(title))
    && isIntegerAtLeast(value.aiRequests, 0);
};

const isSettings = (value: unknown): boolean => (
  isRecord(value)
  && hasExactKeys(value, SETTINGS_KEYS)
  && typeof value.soundEnabled === "boolean"
  && typeof value.sfxVolume === "number"
  && Number.isFinite(value.sfxVolume)
  && value.sfxVolume >= 0
  && value.sfxVolume <= 1
  && typeof value.reducedMotion === "boolean"
);

const isLegacySettings = (value: unknown): value is JsonRecord => (
  isRecord(value)
  && hasExactKeys(value, LEGACY_SETTINGS_KEYS)
  && typeof value.soundEnabled === "boolean"
  && typeof value.reducedMotion === "boolean"
);

const hasValidCurrentSections = (value: JsonRecord): boolean => (
  hasExactKeys(value, TOP_LEVEL_KEYS)
  && isHero(value.hero)
  && isProgress(value.progress)
  && isInventory(value.inventory)
  && isAchievements(value.achievements)
  && isSettings(value.settings)
);

const hasValidLegacySections = (value: JsonRecord): boolean => (
  hasExactKeys(value, LEGACY_TOP_LEVEL_KEYS)
  && isHero(value.hero)
  && isLegacyProgress(value.progress)
  && isInventory(value.inventory)
);

const validateSelectedTitle = (state: GameState): GameState => {
  const normalized = unlockEarnedTitles(state);
  if (normalized.hero.title && !normalized.achievements.unlockedTitles.includes(normalized.hero.title)) {
    throw new Error("存档内容不符合当前契约。");
  }
  return normalized;
};

export const parseGameState = (json: string): GameState => {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch (error) {
    throw new Error("存档不是有效的 JSON 文件。", { cause: error });
  }

  if (!isRecord(value)) throw new Error("存档内容不符合当前契约。");
  if (value.version !== 1 && value.version !== 2 && value.version !== 3) throw new Error("存档版本不受支持。");

  if (value.version === 1 || value.version === 2) {
    if (!hasValidLegacySections(value)) throw new Error("存档内容不符合当前契约。");
    if (value.version === 1 ? !isLegacySettings(value.settings) : !isSettings(value.settings)) {
      throw new Error("存档内容不符合当前契约。");
    }
    const legacyProgress = value.progress as JsonRecord;
    const legacySettings = value.settings as JsonRecord;
    return validateSelectedTitle({
      ...value,
      version: 3,
      progress: { ...legacyProgress, hintsRevealed: {} },
      achievements: { unlockedTitles: [], aiRequests: 0 },
      settings: value.version === 1
        ? { ...legacySettings, sfxVolume: DEFAULT_SFX_VOLUME }
        : legacySettings,
    } as unknown as GameState);
  }

  if (!hasValidCurrentSections(value)) throw new Error("存档内容不符合当前契约。");
  return validateSelectedTitle(value as unknown as GameState);
};

export const serializeGameState = (state: GameState): string => JSON.stringify(state, null, 2);
