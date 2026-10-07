import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "../globals.css";
import { PAGE_TOP_ID } from "@/lib/public-paths";
import { isValidLocale } from "@/lib/utils";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800"],
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Solar Calculator for Commercial Vehicles",
  description: "Calculate your solar panel ROI and environmental impact",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <body
        id={PAGE_TOP_ID}
        className={`${bricolageGrotesque.variable} ${instrumentSans.variable} flex min-h-dvh flex-col`}
      >
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="data-theme"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange={false}
            >
              <NextIntlClientProvider messages={messages}>
                {children}
              </NextIntlClientProvider>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
