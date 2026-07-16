import type { ChapterViewState } from "../domain/map-view.ts";
import type { EquipmentSlot } from "../domain/equipment.ts";

const GUI_ASSET_ROOT = "/assets/ui";

export type GuiAssetName =
  | "icon-coin"
  | "icon-dragon"
  | "icon-python-rune"
  | "icon-quest"
  | "map-node-completed"
  | "map-node-current"
  | "map-node-locked"
  | "slot-accessory"
  | "slot-armor"
  | "slot-boots"
  | "slot-helmet"
  | "slot-shield"
  | "slot-weapon";

const CHAPTER_NODE_ASSETS: Readonly<Record<ChapterViewState, GuiAssetName>> = {
  completed: "map-node-completed",
  current: "map-node-current",
  available: "map-node-current",
  locked: "map-node-locked",
};

const EQUIPMENT_SLOT_ASSETS: Readonly<Record<EquipmentSlot, GuiAssetName>> = {
  weapon: "slot-weapon",
  helmet: "slot-helmet",
  armor: "slot-armor",
  shield: "slot-shield",
  accessory: "slot-accessory",
  boots: "slot-boots",
};

export const guiAsset = (name: GuiAssetName): string => `${GUI_ASSET_ROOT}/${name}.png`;

export const chapterNodeAsset = (state: ChapterViewState): string => (
  guiAsset(CHAPTER_NODE_ASSETS[state])
);

export const equipmentSlotAsset = (slot: EquipmentSlot): string => (
  guiAsset(EQUIPMENT_SLOT_ASSETS[slot])
);
