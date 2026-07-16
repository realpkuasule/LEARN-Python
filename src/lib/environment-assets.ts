const ENVIRONMENT_ROOT = "/assets/environments/european/scenes";

const CHAPTER_SCENE_IDS = [
  "chapter-01-guild-hall",
  "chapter-02-training-yard",
  "chapter-03-character-shrine",
  "chapter-04-weapon-shop",
  "chapter-05-trial-cave",
  "chapter-06-treasure-vault",
  "chapter-07-arena",
  "chapter-08-magic-academy",
  "chapter-09-guild-headquarters",
  "chapter-10-great-warehouse",
  "chapter-11-wisdom-temple",
  "chapter-12-bard-tavern",
  "chapter-13-ancient-library",
  "chapter-14-cathedral-save-hall",
  "chapter-15-abyss-rift",
  "chapter-16-alchemy-workshop",
  "chapter-17-dragon-nest",
] as const;

const environmentAsset = (sceneId: string): string => `${ENVIRONMENT_ROOT}/${sceneId}.png`;

export const worldMapEnvironmentAsset = (): string => environmentAsset("world-map");
export const dragonBattleEnvironmentAsset = (): string => environmentAsset("dragon-battle-arena");
export const victoryCampEnvironmentAsset = (): string => environmentAsset("victory-camp");

export const chapterEnvironmentAsset = (chapterNumber: number): string => {
  const sceneId = Number.isInteger(chapterNumber) ? CHAPTER_SCENE_IDS[chapterNumber - 1] : undefined;
  if (!sceneId) throw new RangeError(`Unknown chapter environment: ${chapterNumber}`);
  return environmentAsset(sceneId);
};
