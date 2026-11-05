import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

/**
 * Builds root document metadata from the message catalog.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("App");
  return {
    title: t("title"),
    description: t("tagline"),
  };
}

/**
 * Root App Router layout: intl provider + shared header.
 */
export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <AppHeader />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
