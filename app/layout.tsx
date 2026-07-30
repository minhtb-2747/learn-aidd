import type { Metadata } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { cn } from "@/lib/utils/cn.utils";
import KudosModalsProvider from "@/components/kudos/kudos-modals-provider";
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

// "Digital Numbers" — the Figma countdown digit face. Not on Google Fonts, so
// bundled locally (OFL) and exposed as a CSS variable for the countdown tiles.
const digitalNumbers = localFont({
  src: "../public/fonts/Digital_Numbers.woff2",
  variable: "--font-digital-numbers",
  display: "swap",
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
      className={cn(
        montserrat.variable,
        montserratAlternates.variable,
        digitalNumbers.variable,
        "h-full antialiased",
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* Route-change progress bar. App Router navigations are streamed, so
            a slow server component leaves the old page on screen with no
            feedback at all — this is the only signal that a click landed.
            Spinner off: the bar alone matches the reference implementation and
            a corner spinner competes with the floating WidgetButton. */}
        <NextTopLoader color="var(--color-gold)" showSpinner={false} />
        <NextIntlClientProvider>
          {/* App-wide so the floating WidgetButton opens the Write/Rules
              modals on any page that renders it. */}
          <KudosModalsProvider>{children}</KudosModalsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
