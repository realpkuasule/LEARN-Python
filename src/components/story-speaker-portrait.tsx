import type { StoryMessage, StoryRole } from "@/domain/chapter-story";
import {
  npcMonsterSpriteAsset,
  portraitSpriteAsset,
  type NpcMonsterSpriteName,
  type SpriteAsset,
} from "@/lib/game-art-assets";

import { PixelAvatar } from "./pixel-avatar";
import { PixelSprite } from "./pixel-sprite";

const STAGE_HERO_CROP = { left: 44, right: 44, bottom: 140 } as const;

const npcMonsterName = (role: StoryRole, speaker: string): NpcMonsterSpriteName => {
  if (role === "friendly") {
    if (/铁匠|矮人/.test(speaker)) return "blacksmith";
    if (/吟游/.test(speaker)) return "bard";
    if (/药剂|仓库/.test(speaker)) return "alchemist";
    if (/导师|教授|学者/.test(speaker)) return "scholar";
    if (/牧师/.test(speaker)) return "sage";
    if (/守卫|村民/.test(speaker)) return "veteran";
    return "guild-master";
  }
  if (role === "neutral") {
    if (/商人/.test(speaker)) return "alchemist";
    if (/裁判/.test(speaker)) return "veteran";
    return "scholar";
  }
  if (/冰|霜/.test(speaker)) return "ice-slime";
  if (/史莱姆/.test(speaker)) return "slime";
  if (/哥布林/.test(speaker)) return "goblin";
  if (/骷髅/.test(speaker)) return "skeleton";
  if (/狼|犬/.test(speaker)) return "wolf";
  if (/龙/.test(speaker)) return "rune-dragon";
  return "goblin";
};

const storyActorSprite = (
  role: StoryRole,
  speaker: string,
  bossSprite?: SpriteAsset,
): SpriteAsset | undefined => role === "hero" || role === "narrator"
  ? undefined
  : role === "hostile" && bossSprite
    ? bossSprite
    : npcMonsterSpriteAsset(npcMonsterName(role, speaker));

export const StoryPortrait = ({
  avatarId,
  bossSprite,
  role,
  speaker,
}: {
  readonly avatarId: number;
  readonly bossSprite?: SpriteAsset;
  readonly role: StoryRole;
  readonly speaker: string;
}): React.ReactNode => {
  if (role === "hero") return <PixelAvatar avatarId={avatarId} compact />;
  const sprite = storyActorSprite(role, speaker, bossSprite);
  return sprite
    ? <PixelSprite alt={`${speaker} 像素头像`} className="story-role-sprite" size={40} sprite={sprite} />
    : null;
};

export const StageSpeakerPortrait = ({
  avatarId,
  bossSprite,
  message,
}: {
  readonly avatarId: number;
  readonly bossSprite?: SpriteAsset;
  readonly message: StoryMessage;
}): React.ReactNode => {
  if (message.role === "hero") {
    return (
      <PixelSprite
        alt={`${message.speaker} 像素立绘`}
        className="story-stage-character story-stage-hero"
        crop={STAGE_HERO_CROP}
        size={176}
        sprite={portraitSpriteAsset(avatarId)}
      />
    );
  }
  const sprite = storyActorSprite(message.role, message.speaker, bossSprite);
  return sprite ? (
    <PixelSprite
      alt={`${message.speaker} 像素立绘`}
      className={message.role === "hostile" && bossSprite ? "chapter-boss-sprite" : "story-stage-character"}
      size={176}
      sprite={sprite}
    />
  ) : null;
};
