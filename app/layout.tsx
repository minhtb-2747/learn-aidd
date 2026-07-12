import type { Metadata } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";

// Global brand fonts (Montserrat), applied on <html> so every route inherits
// them via the CSS variables consumed in globals.css.
const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  variable: "--font-montserrat-alternates",
});

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: "Root Further — Sun* Annual Awards 2025",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cookie-mode i18n: the active locale comes from the NEXT_LOCALE cookie via
  // i18n/request.ts. NextIntlClientProvider inherits locale + messages from it.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${montserratAlternates.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
