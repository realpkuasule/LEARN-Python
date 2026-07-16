import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { EQUIPMENT } from "../../src/domain/equipment.ts";
import {
  bossSpriteAsset,
  chapterNodeSpriteAsset,
  equipmentSlotSpriteAsset,
  guiSpriteAsset,
  itemSpriteAsset,
  portraitSpriteAsset,
} from "../../src/lib/game-art-assets.ts";

const THEMES = ["european", "chinese"];
const BOSS_CHAPTERS = [5, 6, 7, 9, 10, 11, 12, 14, 15, 17];
const GUI_ICONS = ["coin", "quest", "dragon", "python-rune"];
const CHAPTER_STATES = ["completed", "current", "available", "locked"];
const EQUIPMENT_SLOTS = ["weapon", "helmet", "armor", "shield", "accessory", "boots"];

const spriteCoordinates = (asset) => ({
  sheetWidth: asset.sheetWidth,
  sheetHeight: asset.sheetHeight,
  columns: asset.columns,
  rows: asset.rows,
  index: asset.index,
});

const pngMetadata = async (src) => {
  const bytes = await readFile(new URL(`../../public${src}`, import.meta.url));

  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colorType: bytes[25],
  };
};

test("v2 sprite mappings are stable and match the game domain", () => {
  assert.deepEqual(portraitSpriteAsset(1), {
    src: "/assets/art-v2/game-art/european/european-portraits-v2.png",
    sheetWidth: 1672,
    sheetHeight: 941,
    columns: 5,
    rows: 2,
    index: 0,
  });
  assert.equal(portraitSpriteAsset(10).index, 9);
  assert.throws(() => portraitSpriteAsset(0), RangeError);
  assert.throws(() => portraitSpriteAsset(1.5), RangeError);
  assert.throws(() => portraitSpriteAsset(11), RangeError);

  assert.equal(itemSpriteAsset("wood-sword").index, 1);
  assert.equal(itemSpriteAsset("list-sword").index, 10);
  assert.equal(itemSpriteAsset("second-run-proof").index, 15);
  assert.throws(() => itemSpriteAsset("unknown-item"), RangeError);

  assert.equal(bossSpriteAsset(5)?.index, 0);
  assert.equal(bossSpriteAsset(17)?.index, 9);
  assert.equal(bossSpriteAsset(1), undefined);

  assert.equal(guiSpriteAsset("coin").index, 0);
  assert.equal(guiSpriteAsset("python-rune").index, 3);
  assert.equal(chapterNodeSpriteAsset("completed").index, 8);
  assert.equal(chapterNodeSpriteAsset("current").index, 9);
  assert.equal(chapterNodeSpriteAsset("locked").index, 10);
  assert.equal(chapterNodeSpriteAsset("available").index, 11);
  assert.equal(equipmentSlotSpriteAsset("weapon").index, 4);
  assert.equal(equipmentSlotSpriteAsset("boots").index, 9);
});

test("both themes expose matching RGBA sprite sheets", async () => {
  const assetsByTheme = THEMES.map((theme) => [
    ...Array.from({ length: 10 }, (_, index) => portraitSpriteAsset(index + 1, theme)),
    ...EQUIPMENT.map(({ id }) => itemSpriteAsset(id, theme)),
    ...BOSS_CHAPTERS.map((chapter) => bossSpriteAsset(chapter, theme)),
    ...GUI_ICONS.map((name) => guiSpriteAsset(name, theme)),
    ...CHAPTER_STATES.map((state) => chapterNodeSpriteAsset(state, theme)),
    ...EQUIPMENT_SLOTS.map((slot) => equipmentSlotSpriteAsset(slot, theme)),
  ].filter(Boolean));

  assert.deepEqual(
    assetsByTheme[0].map(spriteCoordinates),
    assetsByTheme[1].map(spriteCoordinates),
  );

  const uniqueAssets = new Map(
    assetsByTheme.flat().map((asset) => [asset.src, asset]),
  );

  await Promise.all([...uniqueAssets.values()].map(async (asset) => {
    const metadata = await pngMetadata(asset.src);
    assert.deepEqual(metadata, {
      width: asset.sheetWidth,
      height: asset.sheetHeight,
      bitDepth: 8,
      colorType: 6,
    });
  }));
});
