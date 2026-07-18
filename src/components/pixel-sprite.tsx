import {
  spriteViewBox,
  type SpriteAsset,
  type SpriteCrop,
} from "@/lib/game-art-assets";

const DEFAULT_SPRITE_SIZE = 48;

interface PixelSpriteProperties {
  readonly alt?: string;
  readonly className?: string;
  readonly crop?: SpriteCrop;
  readonly size?: number;
  readonly sprite: SpriteAsset;
}

export const PixelSprite = ({
  alt = "",
  className = "",
  crop,
  size = DEFAULT_SPRITE_SIZE,
  sprite,
}: PixelSpriteProperties): React.ReactNode => {
  return (
    <svg
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
      className={`pixel-sprite ${className}`}
      focusable="false"
      height={size}
      role={alt ? "img" : undefined}
      shapeRendering="crispEdges"
      viewBox={spriteViewBox(sprite, crop)}
      width={size}
    >
      <image height={sprite.sheetHeight} href={sprite.src} width={sprite.sheetWidth} />
    </svg>
  );
};
