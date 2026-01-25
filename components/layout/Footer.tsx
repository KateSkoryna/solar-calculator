import { useTranslations } from "next-intl";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { BiLogoGmail } from "react-icons/bi";
import Container from "./Container";

const socials = [
  {
    href: "https://github.com/kate-skoryna",
    label: "Github",
    Icon: FaGithub,
  },
  {
    href: "https://linkedin.com/in/katsiaryna-skoryna/",
    label: "LinkedIn",
    Icon: FaLinkedinIn,
  },
  {
    href: "mailto:k.skoryna@gmail.com",
    label: "Email",
    Icon: BiLogoGmail,
  },
];

export default function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="lg:max-w-xs">
            <h4 className="text-lg font-bold mb-4 text-[var(--accent)]">
              {t("title")}
            </h4>
            <p className="text-[var(--text-body)]">{t("description")}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 !text-white text-right">
              {t("followUs")}
            </h4>
            <div className="flex space-x-4 justify-end">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-white text-white hover:text-[var(--accent)] hover:border-[var(--accent)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>
      <div className="py-4 border-t border-[var(--border)]">
        <p className="text-center text-[var(--text-body)]">
          {t("copyright", { currentYear })}
        </p>
      </div>
    </footer>
  );
}
