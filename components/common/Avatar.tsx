import Image from "next/image";

export const AVATAR_TONES = ["lime", "neutral"] as const;

type AvatarTone = (typeof AVATAR_TONES)[number];

const AVATAR_TONE_CLASSES: Record<AvatarTone, string> = {
  lime: "border-transparent bg-lime text-on-lime",
  neutral: "border-line bg-soft text-ink",
};

const AVATAR_SIZE_IN_PIXELS = 40;
const MAX_INITIALS = 2;

function buildInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map((word) => Array.from(word)[0].toUpperCase())
    .join("");
}

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  tone?: AvatarTone;
}

export default function Avatar({ name, imageUrl, tone = "lime" }: AvatarProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={AVATAR_SIZE_IN_PIXELS}
        height={AVATAR_SIZE_IN_PIXELS}
        unoptimized
        className="size-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${AVATAR_TONE_CLASSES[tone]}`}
    >
      {buildInitials(name)}
    </span>
  );
}
