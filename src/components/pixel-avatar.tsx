import { portraitSpriteAsset } from "@/lib/game-art-assets";

import { PixelSprite } from "./pixel-sprite";

const AVATAR_SIZE = 96;
const COMPACT_AVATAR_SIZE = 36;

interface PixelAvatarProps {
  readonly avatarId: number;
  readonly compact?: boolean;
}

export const PixelAvatar = ({ avatarId, compact = false }: PixelAvatarProps): React.ReactNode => {
  return (
    <PixelSprite
      alt={`像素勇者头像 ${avatarId}`}
      className={`avatar-pixels${compact ? " compact" : ""}`}
      size={compact ? COMPACT_AVATAR_SIZE : AVATAR_SIZE}
      sprite={portraitSpriteAsset(avatarId)}
    />
  );
};
