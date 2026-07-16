import Image from "next/image";

const DEFAULT_ICON_SIZE = 48;

interface PixelIconProperties {
  readonly alt?: string;
  readonly className?: string;
  readonly size?: number;
  readonly src: string;
}

export const PixelIcon = ({
  alt = "",
  className = "",
  size = DEFAULT_ICON_SIZE,
  src,
}: PixelIconProperties): React.ReactNode => (
  <Image
    alt={alt}
    aria-hidden={alt ? undefined : "true"}
    className={`pixel-art ${className}`}
    height={size}
    src={src}
    unoptimized
    width={size}
  />
);
