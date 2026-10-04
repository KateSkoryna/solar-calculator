import { screen } from "@testing-library/react";
import LegalNoticePage from "@/app/[locale]/legal-notice/page";
import PrivacyPage from "@/app/[locale]/privacy/page";
import { SITE_OWNER_EMAIL, SITE_OWNER_NAME } from "@/lib/site-owner";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

describe("legal pages", () => {
  it("renders every privacy section with the contact address", () => {
    renderWithIntl(<PrivacyPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: englishMessages.privacyPage.title,
      }),
    ).toBeInTheDocument();
    Object.values(englishMessages.privacyPage.sections).forEach((section) =>
      expect(
        screen.getByRole("heading", { level: 2, name: section.title }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("article")).toHaveTextContent(SITE_OWNER_EMAIL);
  });

  it("renders the legal notice with the operator and contact", () => {
    renderWithIntl(<LegalNoticePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: englishMessages.legalNoticePage.title,
      }),
    ).toBeInTheDocument();
    Object.values(englishMessages.legalNoticePage.sections).forEach((section) =>
      expect(
        screen.getByRole("heading", { level: 2, name: section.title }),
      ).toBeInTheDocument(),
    );
    const article = screen.getByRole("article");
    expect(article).toHaveTextContent(SITE_OWNER_NAME);
    expect(article).toHaveTextContent(SITE_OWNER_EMAIL);
  });
});
