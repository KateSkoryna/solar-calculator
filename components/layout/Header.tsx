import NavLink from "./NavLink";
import ClientMenu from "./ClientMenu";
import { getTranslations } from "next-intl/server";
import Container from "./Container";
import { auth } from "@/auth";

export default async function Header() {
  const [t, session] = await Promise.all([getTranslations("header"), auth()]);

  return (
    <header className="relative z-50 border-b-1 border-[var(--border)]">
      <Container>
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4 md:gap-8 flex-shrink min-w-0">
            <ul className="hidden md:flex items-center gap-4 lg:gap-6">
              <li>
                <NavLink href="/">{t("home")}</NavLink>
              </li>
              <li>
                <NavLink href="/calculator">{t("calculator")}</NavLink>
              </li>
            </ul>
          </div>

          <div className="flex-shrink-0">
            <ClientMenu session={session} />
          </div>
        </nav>
      </Container>
    </header>
  );
}
