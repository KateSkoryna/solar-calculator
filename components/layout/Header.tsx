import NavLink from "./NavLink";
import ClientMenu from "./ClientMenu";
import { useTranslations } from "next-intl";
import Container from "./Container";

export default function Header() {
  const t = useTranslations("header");

  return (
    <header className="relative z-50 border-b-1 border-[var(--border)]">
      <Container>
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <ul className="hidden md:flex items-center gap-6">
              <li>
                <NavLink href="/">{t("home")}</NavLink>
              </li>
              <li>
                <NavLink href="/calculator">{t("calculator")}</NavLink>
              </li>
            </ul>
          </div>

          <ClientMenu />
        </nav>
      </Container>
    </header>
  );
}
