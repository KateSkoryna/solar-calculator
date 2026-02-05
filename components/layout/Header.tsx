import NavLink from "./NavLink";
import ClientMenu from "./ClientMenu";
import { useTranslations } from "next-intl";
import Container from "./Container";
import { auth } from "@/auth";

export default async function Header() {
  const t = useTranslations("header");
  const session = await auth();

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
