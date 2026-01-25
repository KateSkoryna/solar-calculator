interface ImageBackgroundProps {
  image: string;
  position?: string;
  size?: string;
  clipPath?: string;
}

export default function Background() {
  return (
    <div
      className="
        fixed inset-0 -z-20 invert-bg-color
        [clip-path:polygon(70%_0,_100%_0,_100%_100%,_70%_100%)]
      "
    />
  );
}
