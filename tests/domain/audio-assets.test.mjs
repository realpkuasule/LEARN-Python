import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { DEFAULT_SFX_VOLUME } from "../../src/domain/game-state.ts";
import { playSound, soundAsset } from "../../src/lib/audio-assets.ts";

const THEMES = ["european", "chinese"];
const CUES = [
  "ui-move",
  "ui-confirm",
  "ui-cancel",
  "dialog-open",
  "quest-unlock",
  "code-run",
  "code-success",
  "code-error",
  "coin",
  "equip",
  "chest-open",
  "dragon-roar",
];
const MUSIC_FILES = ["world-map-loop.ogg", "region-explore-loop.ogg", "dungeon-loop.ogg", "boss-loop.ogg"];

test("audio cues expose stable theme-compatible paths", async () => {
  assert.equal(soundAsset("code-success"), "/assets/audio/european/sfx/code-success.ogg");
  assert.equal(soundAsset("equip", "chinese"), "/assets/audio/chinese/sfx/equip.ogg");

  await Promise.all(THEMES.flatMap((theme) => CUES.map(async (cue) => {
    const bytes = await readFile(new URL(`../../public${soundAsset(cue, theme)}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), "OggS");
  })));
});

test("the complete audio pack matches its manifest defaults", async () => {
  const manifest = JSON.parse(await readFile(
    new URL("../../public/assets/audio/audio-manifest.json", import.meta.url),
    "utf8",
  ));
  assert.equal(manifest.defaults.sfxVolume, DEFAULT_SFX_VOLUME);

  await Promise.all(THEMES.flatMap((theme) => MUSIC_FILES.map(async (file) => {
    const bytes = await readFile(new URL(`../../public/assets/audio/${theme}/bgm/${file}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), "OggS");
  })));
});

test("sound playback honors mute and volume preferences", () => {
  const originalAudio = globalThis.Audio;
  const instances = [];

  globalThis.Audio = class FakeAudio {
    constructor(src) {
      this.src = src;
      this.volume = 1;
      instances.push(this);
    }

    play() {
      this.played = true;
      return Promise.resolve();
    }
  };

  try {
    playSound("coin", { soundEnabled: false, sfxVolume: 0.25 });
    assert.equal(instances.length, 0);

    playSound("coin", { soundEnabled: true, sfxVolume: 0.25 });
    assert.equal(instances.length, 1);
    assert.equal(instances[0].src, "/assets/audio/european/sfx/coin.ogg");
    assert.equal(instances[0].volume, 0.25);
    assert.equal(instances[0].played, true);
  } finally {
    if (originalAudio) globalThis.Audio = originalAudio;
    else Reflect.deleteProperty(globalThis, "Audio");
  }
});
