import type { ReactNode } from "react";
import { LuMenu } from "react-icons/lu";
import Logo from "@/components/common/Logo";
import MockScreen from "@/components/home/showcase/MockScreen";

export const PHONE_SIZES = ["regular", "tall"] as const;

type PhoneSize = (typeof PHONE_SIZES)[number];

const PHONE_SIZE_CLASSES: Record<PhoneSize, string> = {
  regular: "h-[560px] w-[280px]",
  tall: "h-[640px] w-[300px]",
};

interface PhoneFrameProps {
  label: string;
  size?: PhoneSize;
  className?: string;
  children: ReactNode;
}

export default function PhoneFrame({
  label,
  size = "regular",
  className = "",
  children,
}: PhoneFrameProps) {
  return (
    <MockScreen
      label={label}
      className={`max-w-full shrink-0 rounded-t-[40px] bg-black px-2.5 pt-2.5 shadow-float ${PHONE_SIZE_CLASSES[size]} ${className}`}
    >
      <div className="flex h-full flex-col gap-3 overflow-hidden rounded-t-[31px] bg-ground px-3.5 pt-3 text-left text-ink">
        <div className="-mx-3.5 flex items-center justify-between border-b border-line px-3.5 pb-2.5">
          <Logo className="origin-left scale-[0.82]" />
          <span className="flex size-9 items-center justify-center rounded-full border border-line-strong bg-surface">
            <LuMenu className="size-4" />
          </span>
        </div>
        {children}
      </div>
    </MockScreen>
  );
}
