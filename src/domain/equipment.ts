import type { EquipmentSlots, GameState, Stats } from "./game-state.ts";
import { addInventoryItem, inventoryQuantity, removeInventoryItem } from "./inventory.ts";
import { unlockEarnedTitles } from "./titles.ts";

export type EquipmentSlot = keyof EquipmentSlots;
export const HINT_POTION_ID = "hint-potion";
export const HINT_POTION_PRICE = 1;
const MAX_HINTS_PER_EXERCISE = 3;

export interface EquipmentItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly slot: EquipmentSlot;
  readonly price: number;
  readonly unlockChapter: number;
  readonly stats: Partial<Stats>;
}

export const EQUIPMENT: readonly EquipmentItem[] = [
  { id: "wood-sword", name: "木剑", description: "一根削尖的木棍。至少它是一根棍子。", slot: "weapon", price: 0, unlockChapter: 1, stats: { atk: 1 } },
  { id: "cloth-armor", name: "布衣", description: "穿着它站在恶龙面前，需要勇气和治疗药水。", slot: "armor", price: 0, unlockChapter: 1, stats: { def: 1 } },
  { id: "true-sword", name: "TRUE之剑", description: "不是所有的 True 都对，但这把剑砍下去真的疼。", slot: "weapon", price: 80, unlockChapter: 4, stats: { atk: 10 } },
  { id: "false-shield", name: "FALSE之盾", description: "它会问怪物：这伤害是真的吗？False。", slot: "shield", price: 120, unlockChapter: 4, stats: { def: 8 } },
  { id: "for-spear", name: "FOR循环长矛", description: "每次攻击自动重复三次。这不是 Bug。", slot: "weapon", price: 300, unlockChapter: 6, stats: { atk: 18 } },
  { id: "indentation-helmet", name: "缩进头盔", description: "戴上它，你的代码自动缩进四格。", slot: "helmet", price: 200, unlockChapter: 6, stats: { def: 10 } },
  { id: "while-charm", name: "WHILE真言护符", description: "戴上前先默念：我有 break。", slot: "accessory", price: 500, unlockChapter: 7, stats: { atk: 5, def: 5 } },
  { id: "list-sword", name: "列表之剑", description: "可以攻击切片范围内的所有敌人。", slot: "weapon", price: 2_000, unlockChapter: 10, stats: { atk: 15 } },
  { id: "ordered-dict-boots", name: "有序之DICT", description: "左脚 key，右脚 value，每一步都有记录。", slot: "boots", price: 5_000, unlockChapter: 11, stats: { atk: 50 } },
  { id: "unique-set-helmet", name: "元素唯一之SET", description: "飞来的石头会自动去重，但还是会疼。", slot: "helmet", price: 3_000, unlockChapter: 11, stats: { def: 25 } },
  { id: "string-staff", name: "字符串法杖", description: "把恶龙替换成小可爱，也许就没那么可怕了。", slot: "accessory", price: 1_500, unlockChapter: 12, stats: { atk: 20 } },
  { id: "json-boots", name: "JSON拓荒者长靴", description: "穿越 UTF-8 河流和各种编码沼泽。", slot: "boots", price: 800, unlockChapter: 13, stats: { def: 15 } },
  { id: "import-armor", name: "IMPORT之甲", description: "从 module.py 大陆进口的坚固铠甲。", slot: "armor", price: 4_000, unlockChapter: 14, stats: { def: 30 } },
  { id: "try-except-bracers", name: "TryExcept护臂", description: "攻击命中时，except 会优雅地接住异常。", slot: "accessory", price: 600, unlockChapter: 15, stats: { def: 12 } },
  { id: "second-run-proof", name: "已经通关了再买的装备有什么用又没有二周目之勇者之证", description: "金色徽章：恭喜通关，现在可以戴着它重新玩一遍了。", slot: "accessory", price: 10_000, unlockChapter: 17, stats: { maxHp: 15, maxMp: 15, atk: 15, def: 15 } },
];

export const getEquipment = (itemId: string): EquipmentItem | undefined => (
  EQUIPMENT.find(({ id }) => id === itemId)
);

export const purchaseItem = (state: GameState, itemId: string): GameState => {
  const item = getEquipment(itemId);
  if (!item) throw new Error("装备不存在");
  if (state.progress.currentChapter < item.unlockChapter) {
    throw new Error(`当前章节尚未解锁这件装备（完成第 ${item.unlockChapter - 1} 章后开放）`);
  }
  if (state.hero.coins < item.price) throw new Error("金币不足");

  return unlockEarnedTitles(addInventoryItem({
    ...state,
    hero: { ...state.hero, coins: state.hero.coins - item.price },
  }, itemId));
};

export const purchaseHintPotion = (state: GameState): GameState => {
  if (state.hero.coins < HINT_POTION_PRICE) throw new Error("金币不足");
  return addInventoryItem({
    ...state,
    hero: { ...state.hero, coins: state.hero.coins - HINT_POTION_PRICE },
  }, HINT_POTION_ID);
};

export const useHintPotion = (state: GameState, exerciseId: string): GameState => {
  const revealed = state.progress.hintsRevealed[exerciseId] ?? 0;
  if (revealed >= MAX_HINTS_PER_EXERCISE) throw new Error("本章三级提示已经全部解锁");
  if (inventoryQuantity(state, HINT_POTION_ID) === 0) throw new Error("背包中没有提示药水");

  const consumed = removeInventoryItem(state, HINT_POTION_ID);
  return unlockEarnedTitles({
    ...consumed,
    progress: {
      ...consumed.progress,
      hintsRevealed: { ...consumed.progress.hintsRevealed, [exerciseId]: revealed + 1 },
    },
  });
};

export const equipItem = (state: GameState, itemId: string): GameState => {
  const item = getEquipment(itemId);
  if (!item) throw new Error("装备不存在");
  if (!state.inventory.some((entry) => entry.itemId === itemId)) throw new Error("背包中没有这件装备");

  return {
    ...state,
    hero: {
      ...state.hero,
      equipment: { ...state.hero.equipment, [item.slot]: item.id },
    },
  };
};

export const getEffectiveStats = (state: GameState): Stats => {
  const equippedItems = Object.values(state.hero.equipment)
    .filter((itemId): itemId is string => Boolean(itemId))
    .map(getEquipment)
    .filter((item): item is EquipmentItem => Boolean(item));

  return equippedItems.reduce<Stats>((stats, item) => ({
    maxHp: stats.maxHp + (item.stats.maxHp ?? 0),
    maxMp: stats.maxMp + (item.stats.maxMp ?? 0),
    atk: stats.atk + (item.stats.atk ?? 0),
    def: stats.def + (item.stats.def ?? 0),
  }), state.hero.baseStats);
};
