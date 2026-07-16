import type { EquipmentSlot } from "../domain/equipment.ts";
import type { ChapterViewState } from "../domain/map-view.ts";

export type ArtTheme = "european" | "chinese";

export type GuiSpriteName = "coin" | "quest" | "dragon" | "python-rune";

export interface SpriteAsset {
  readonly src: string;
  readonly sheetWidth: number;
  readonly sheetHeight: number;
  readonly columns: number;
  readonly rows: number;
  readonly index: number;
}

interface SpriteSheet {
  readonly group: "game-art" | "gui";
  readonly name: "portraits" | "bosses" | "items" | "gui-icons" | "gui-controls";
  readonly width: number;
  readonly height: number;
  readonly columns: number;
  readonly rows: number;
}

const DEFAULT_THEME: ArtTheme = "european";

const SHEETS = {
  portraits: { group: "game-art", name: "portraits", width: 1672, height: 941, columns: 5, rows: 2 },
  bosses: { group: "game-art", name: "bosses", width: 1672, height: 941, columns: 5, rows: 2 },
  items: { group: "game-art", name: "items", width: 1254, height: 1254, columns: 4, rows: 4 },
  icons: { group: "gui", name: "gui-icons", width: 1254, height: 1254, columns: 4, rows: 4 },
  controls: { group: "gui", name: "gui-controls", width: 1254, height: 1254, columns: 4, rows: 4 },
} as const satisfies Readonly<Record<string, SpriteSheet>>;

const ITEM_INDEX: Readonly<Record<string, number>> = {
  "wood-sword": 1,
  "cloth-armor": 2,
  "true-sword": 3,
  "false-shield": 4,
  "for-spear": 5,
  "indentation-helmet": 6,
  "while-charm": 7,
  "ordered-dict-boots": 8,
  "unique-set-helmet": 9,
  "list-sword": 10,
  "string-staff": 11,
  "json-boots": 12,
  "import-armor": 13,
  "try-except-bracers": 14,
  "second-run-proof": 15,
};

const BOSS_INDEX: Readonly<Record<number, number>> = {
  5: 0,
  6: 1,
  7: 2,
  9: 3,
  10: 4,
  11: 5,
  12: 6,
  14: 7,
  15: 8,
  17: 9,
};

const GUI_ICON_INDEX: Readonly<Record<GuiSpriteName, number>> = {
  coin: 0,
  quest: 1,
  dragon: 2,
  "python-rune": 3,
};

const CHAPTER_NODE_INDEX: Readonly<Record<ChapterViewState, number>> = {
  completed: 8,
  current: 9,
  locked: 10,
  available: 11,
};

const EQUIPMENT_SLOT_INDEX: Readonly<Record<EquipmentSlot, number>> = {
  weapon: 4,
  helmet: 5,
  armor: 6,
  shield: 7,
  accessory: 8,
  boots: 9,
};

const spriteAsset = (
  sheet: SpriteSheet,
  index: number,
  theme: ArtTheme,
): SpriteAsset => {
  if (!Number.isInteger(index) || index < 0 || index >= sheet.columns * sheet.rows) {
    throw new RangeError(`Sprite index ${index} is outside ${sheet.name}`);
  }

  return {
    src: `/assets/art-v2/${sheet.group}/${theme}/${theme}-${sheet.name}-v2.png`,
    sheetWidth: sheet.width,
    sheetHeight: sheet.height,
    columns: sheet.columns,
    rows: sheet.rows,
    index,
  };
};

export const portraitSpriteAsset = (
  avatarId: number,
  theme: ArtTheme = DEFAULT_THEME,
): SpriteAsset => spriteAsset(SHEETS.portraits, avatarId - 1, theme);

export const itemSpriteAsset = (
  itemId: string,
  theme: ArtTheme = DEFAULT_THEME,
): SpriteAsset => {
  const index = ITEM_INDEX[itemId];
  if (index === undefined) throw new RangeError(`Unknown equipment item: ${itemId}`);
  return spriteAsset(SHEETS.items, index, theme);
};

export const bossSpriteAsset = (
  chapterNumber: number,
  theme: ArtTheme = DEFAULT_THEME,
): SpriteAsset | undefined => {
  const index = BOSS_INDEX[chapterNumber];
  if (index === undefined) return undefined;
  return spriteAsset(SHEETS.bosses, index, theme);
};

export const guiSpriteAsset = (
  name: GuiSpriteName,
  theme: ArtTheme = DEFAULT_THEME,
): SpriteAsset => spriteAsset(SHEETS.icons, GUI_ICON_INDEX[name], theme);

export const chapterNodeSpriteAsset = (
  state: ChapterViewState,
  theme: ArtTheme = DEFAULT_THEME,
): SpriteAsset => spriteAsset(SHEETS.controls, CHAPTER_NODE_INDEX[state], theme);

export const equipmentSlotSpriteAsset = (
  slot: EquipmentSlot,
  theme: ArtTheme = DEFAULT_THEME,
): SpriteAsset => spriteAsset(SHEETS.icons, EQUIPMENT_SLOT_INDEX[slot], theme);
