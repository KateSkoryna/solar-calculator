import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import englishMessages from "@/messages/en.json";

const TEST_LOCALE = "en";

export function renderWithIntl(component: ReactElement) {
  return render(
    <NextIntlClientProvider locale={TEST_LOCALE} messages={englishMessages}>
      {component}
    </NextIntlClientProvider>,
  );
}

export { englishMessages };
