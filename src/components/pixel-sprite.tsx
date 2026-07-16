import type { SpriteAsset } from "@/lib/game-art-assets";

const DEFAULT_SPRITE_SIZE = 48;

interface PixelSpriteProperties {
  readonly alt?: string;
  readonly className?: string;
  readonly size?: number;
  readonly sprite: SpriteAsset;
}

export const PixelSprite = ({
  alt = "",
  className = "",
  size = DEFAULT_SPRITE_SIZE,
  sprite,
}: PixelSpriteProperties): React.ReactNode => {
  const cellWidth = sprite.sheetWidth / sprite.columns;
  const cellHeight = sprite.sheetHeight / sprite.rows;
  const column = sprite.index % sprite.columns;
  const row = Math.floor(sprite.index / sprite.columns);

  return (
    <svg
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
      className={`pixel-sprite ${className}`}
      focusable="false"
      height={size}
      role={alt ? "img" : undefined}
      shapeRendering="crispEdges"
      viewBox={`${column * cellWidth} ${row * cellHeight} ${cellWidth} ${cellHeight}`}
      width={size}
    >
      <image height={sprite.sheetHeight} href={sprite.src} width={sprite.sheetWidth} />
    </svg>
  );
};
