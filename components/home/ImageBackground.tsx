interface ImageBackgroundProps {
  image: string;
  position?: string;
  size?: string;
  clipPath?: string;
}

export default function ImageBackground({
  image,
  position = "right",
  size = "40% 100dvh",
  clipPath = "polygon(60% 0, 100% 0, 100% 100%, 60% 100%)",
}: ImageBackgroundProps) {
  return (
    <div
      className="fixed inset-0 -z-20 invert-bg-color"
      style={{
        clipPath: clipPath,
      }}
    />
  );
}
