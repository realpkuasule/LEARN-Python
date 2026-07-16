import type { AudioSettings } from "../domain/game-state.ts";

export type AudioTheme = "european" | "chinese";

export type SoundCue =
  | "ui-move"
  | "ui-confirm"
  | "ui-cancel"
  | "dialog-open"
  | "quest-unlock"
  | "code-run"
  | "code-success"
  | "code-error"
  | "coin"
  | "equip"
  | "chest-open"
  | "dragon-roar";

export const soundAsset = (
  cue: SoundCue,
  theme: AudioTheme = "european",
): string => `/assets/audio/${theme}/sfx/${cue}.ogg`;

export const playSound = (cue: SoundCue, settings: AudioSettings): void => {
  if (!settings.soundEnabled || typeof Audio === "undefined") return;

  const audio = new Audio(soundAsset(cue));
  audio.volume = settings.sfxVolume;
  void audio.play().catch(() => undefined);
};
