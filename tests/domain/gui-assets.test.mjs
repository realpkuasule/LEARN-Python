import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

import {
  chapterNodeAsset,
  equipmentSlotAsset,
  guiAsset,
} from "../../src/lib/gui-assets.ts";

test("the confirmed European-fantasy skin exposes stable UI asset paths", () => {
  assert.equal(guiAsset("icon-python-rune"), "/assets/ui/icon-python-rune.png");
  assert.equal(chapterNodeAsset("current"), "/assets/ui/map-node-current.png");
  assert.equal(chapterNodeAsset("available"), "/assets/ui/map-node-current.png");
  assert.equal(equipmentSlotAsset("weapon"), "/assets/ui/slot-weapon.png");
});

test("every asset used by the Phase 1 GUI exists", async () => {
  const paths = [
    guiAsset("icon-python-rune"),
    guiAsset("icon-quest"),
    guiAsset("icon-coin"),
    guiAsset("icon-dragon"),
    chapterNodeAsset("completed"),
    chapterNodeAsset("current"),
    chapterNodeAsset("available"),
    chapterNodeAsset("locked"),
    equipmentSlotAsset("weapon"),
    equipmentSlotAsset("helmet"),
    equipmentSlotAsset("armor"),
    equipmentSlotAsset("shield"),
    equipmentSlotAsset("accessory"),
    equipmentSlotAsset("boots"),
  ];

  await Promise.all(paths.map((path) => access(new URL(`../../public${path}`, import.meta.url))));
});
