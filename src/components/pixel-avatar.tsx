const FACE = [
  "..hhhh..",
  ".hhhhhh.",
  ".hsssshh",
  ".seesse.",
  ".ssssss.",
  "..smm...",
  ".cccccc.",
  ".c.cc.c.",
] as const;

const PALETTES = [
  { h: "#3b2a22", s: "#d7a26e", e: "#0b1020", m: "#9b4f47", c: "#4f83c2" },
  { h: "#d6a84b", s: "#e8b982", e: "#17233a", m: "#a14c55", c: "#4e9f65" },
  { h: "#6c3f77", s: "#c88f68", e: "#07101d", m: "#8f3c46", c: "#c85b5b" },
  { h: "#233d4d", s: "#d5a074", e: "#07101d", m: "#a14c55", c: "#d6a84b" },
  { h: "#5b352d", s: "#8f5f46", e: "#f2ead3", m: "#d28b75", c: "#4f83c2" },
  { h: "#b8c1d1", s: "#dcb08b", e: "#17233a", m: "#9b4f47", c: "#6c3f77" },
  { h: "#2b1c30", s: "#c88463", e: "#f2ead3", m: "#8f3c46", c: "#4e9f65" },
  { h: "#8a4a36", s: "#efc39e", e: "#07101d", m: "#b85f59", c: "#c85b5b" },
  { h: "#304b35", s: "#b97c59", e: "#f2ead3", m: "#d28b75", c: "#d6a84b" },
  { h: "#17233a", s: "#d29872", e: "#f2ead3", m: "#9b4f47", c: "#53698b" },
] as const;

interface PixelAvatarProps {
  readonly avatarId: number;
  readonly compact?: boolean;
}

export const PixelAvatar = ({ avatarId, compact = false }: PixelAvatarProps): React.ReactNode => {
  const palette = PALETTES[(avatarId - 1) % PALETTES.length] ?? PALETTES[0];
  return (
    <span aria-label={`像素勇者头像 ${avatarId}`} className={`avatar-pixels${compact ? " compact" : ""}`} role="img">
      {FACE.join("").split("").map((pixel, index) => (
        <span
          className="avatar-pixel"
          key={`${pixel}-${index}`}
          style={{ "--pixel-color": pixel === "." ? "transparent" : palette[pixel as keyof typeof palette] } as React.CSSProperties}
        />
      ))}
    </span>
  );
};
