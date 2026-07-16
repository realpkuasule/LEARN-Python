import type { GameState } from "./game-state.ts";

type JsonRecord = Record<string, unknown>;

const TOP_LEVEL_KEYS = ["version", "hero", "progress", "inventory", "settings"] as const;
const HERO_KEYS = ["id", "name", "avatarId", "createdAt", "level", "totalExp", "coins", "baseStats", "title", "equipment"] as const;
const STATS_KEYS = ["maxHp", "maxMp", "atk", "def"] as const;
const EQUIPMENT_KEYS = ["weapon", "helmet", "armor", "shield", "accessory", "boots"] as const;
const PROGRESS_KEYS = ["currentChapter", "completedChapters", "attempts"] as const;
const SETTINGS_KEYS = ["soundEnabled", "reducedMotion"] as const;
const INVENTORY_KEYS = ["itemId", "quantity"] as const;
const MAX_CHAPTER = 17;

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

const isProgress = (value: unknown): boolean => {
  if (!isRecord(value) || !hasExactKeys(value, PROGRESS_KEYS)) return false;
  if (!isIntegerAtLeast(value.currentChapter, 1) || Number(value.currentChapter) > MAX_CHAPTER) return false;
  if (!Array.isArray(value.completedChapters)) return false;
  const chapters = value.completedChapters;
  if (!chapters.every((chapter) => isIntegerAtLeast(chapter, 1) && chapter <= MAX_CHAPTER)) return false;
  if (new Set(chapters).size !== chapters.length) return false;
  if (!isRecord(value.attempts)) return false;
  return Object.values(value.attempts).every((attempts) => isIntegerAtLeast(attempts, 0));
};

const isInventory = (value: unknown): boolean => (
  Array.isArray(value) && value.every((entry) => (
    isRecord(entry)
    && hasExactKeys(entry, INVENTORY_KEYS)
    && typeof entry.itemId === "string"
    && entry.itemId.length > 0
    && isIntegerAtLeast(entry.quantity, 1)
  ))
);

const isSettings = (value: unknown): boolean => (
  isRecord(value)
  && hasExactKeys(value, SETTINGS_KEYS)
  && typeof value.soundEnabled === "boolean"
  && typeof value.reducedMotion === "boolean"
);

export const parseGameState = (json: string): GameState => {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch (error) {
    throw new Error("存档不是有效的 JSON 文件。", { cause: error });
  }

  if (isRecord(value) && value.version !== 1) throw new Error("存档版本不受支持。");
  if (!isRecord(value)
    || !hasExactKeys(value, TOP_LEVEL_KEYS)
    || !isHero(value.hero)
    || !isProgress(value.progress)
    || !isInventory(value.inventory)
    || !isSettings(value.settings)) {
    throw new Error("存档内容不符合当前契约。");
  }
  return value as unknown as GameState;
};

export const serializeGameState = (state: GameState): string => JSON.stringify(state, null, 2);
