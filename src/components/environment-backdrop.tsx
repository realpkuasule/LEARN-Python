import Image from "next/image";

interface EnvironmentBackdropProperties {
  readonly alt?: string;
  readonly priority?: boolean;
  readonly sizes?: string;
  readonly src: string;
}

export const EnvironmentBackdrop = ({
  alt = "",
  priority = false,
  sizes = "(max-width: 1023px) 100vw, 50vw",
  src,
}: EnvironmentBackdropProperties): React.ReactNode => (
  <>
    <Image
      alt={alt}
      className="environment-backdrop"
      fill
      priority={priority}
      sizes={sizes}
      src={src}
      unoptimized
    />
    <span aria-hidden="true" className="environment-scrim" />
  </>
);
