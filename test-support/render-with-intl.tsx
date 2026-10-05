import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { DISPLAY_TIME_ZONE } from "@/i18n";
import englishMessages from "@/messages/en.json";

const TEST_LOCALE = "en";

export function renderWithIntl(component: ReactElement) {
  return render(
    <NextIntlClientProvider
      locale={TEST_LOCALE}
      timeZone={DISPLAY_TIME_ZONE}
      messages={englishMessages}
    >
      {component}
    </NextIntlClientProvider>,
  );
}

export { englishMessages };
