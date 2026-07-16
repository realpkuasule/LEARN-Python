import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { CHAPTERS } from "../../src/domain/chapter-catalog.ts";
import {
  chapterEnvironmentAsset,
  dragonBattleEnvironmentAsset,
  victoryCampEnvironmentAsset,
  worldMapEnvironmentAsset,
} from "../../src/lib/environment-assets.ts";

const ENVIRONMENT_MANIFEST = new URL("../../public/assets/environments/environment-manifest.json", import.meta.url);

const readPngDimensions = async (assetPath) => {
  const bytes = await readFile(new URL(`../../public${assetPath}`, import.meta.url));
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

test("the confirmed European environment skin exposes stable scene paths", () => {
  assert.equal(worldMapEnvironmentAsset(), "/assets/environments/european/scenes/world-map.png");
  assert.equal(
    chapterEnvironmentAsset(1),
    "/assets/environments/european/scenes/chapter-01-guild-hall.png",
  );
  assert.equal(
    chapterEnvironmentAsset(17),
    "/assets/environments/european/scenes/chapter-17-dragon-nest.png",
  );
  assert.equal(dragonBattleEnvironmentAsset(), "/assets/environments/european/scenes/dragon-battle-arena.png");
  assert.equal(victoryCampEnvironmentAsset(), "/assets/environments/european/scenes/victory-camp.png");
  assert.throws(() => chapterEnvironmentAsset(0), RangeError);
  assert.throws(() => chapterEnvironmentAsset(18), RangeError);
});

test("every chapter environment used by the GUI is a 640 by 360 PNG", async () => {
  const paths = [
    worldMapEnvironmentAsset(),
    dragonBattleEnvironmentAsset(),
    victoryCampEnvironmentAsset(),
    ...CHAPTERS.map(({ number }) => chapterEnvironmentAsset(number)),
  ];
  const dimensions = await Promise.all(paths.map(readPngDimensions));
  assert.ok(dimensions.every(({ width, height }) => width === 640 && height === 360));
});

test("both planned environment themes include all twenty committed scenes", async () => {
  const manifest = JSON.parse(await readFile(ENVIRONMENT_MANIFEST, "utf8"));
  assert.deepEqual(manifest.availableThemes, ["european", "chinese"]);

  for (const theme of manifest.availableThemes) {
    const scenes = manifest.scenesByTheme[theme];
    assert.equal(scenes.length, 20);
    const dimensions = await Promise.all(scenes.map(({ path }) => readPngDimensions(path)));
    assert.ok(dimensions.every(({ width, height }) => width === 640 && height === 360));
  }
});
