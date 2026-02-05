"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CgProfile } from "react-icons/cg";
import { IoMdLogOut } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";

export default function UserProfileButton() {
  const router = useRouter();
  const t = useTranslations("clientmenu");
  const [isDropdownOpen, setisDropdownOpen] = useState(false);

  const userSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navigateToAccount = () => {
    router.push("/user");
    setisDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setisDropdownOpen(!isDropdownOpen)}
        className="p-2 rounded-lg font-bold font-[family:var(--font-inter)] transition-colors hover:opacity-80 flex items-center gap-2 bg-[var(--card)] text-[var(--text-heading)] border-2 border-[var(--border)] focus:border-[var(--accent)] focus:outline-none"
        aria-label={t("userProfile")}
      >
        <FaUserCircle size={18} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md shadow-lg py-1 z-9999">
          <button
            onClick={navigateToAccount}
            className="w-full text-left px-4 py-2 text-[var(--text-heading)] hover:bg-[var(--accent-hover)] flex items-center gap-2"
          >
            <CgProfile size={18} /> {t("myAccount")}
          </button>
          <button
            onClick={userSignOut}
            className="w-full text-left px-4 py-2 text-[var(--text-heading)] hover:bg-[var(--accent-hover)] flex items-center gap-2"
          >
            <IoMdLogOut size={18} /> {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
