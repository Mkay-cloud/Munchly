import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fredoka, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "../globals.css";
import InstallPrompts from "@/components/InstallPrompts";
import { INSTALL_CAPTURE_SCRIPT } from "@/lib/install";
import { LOCALES, isLocale, isRtl, type Locale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { LocaleProvider } from "@/i18n/LocaleProvider";

// Applies the saved (or system) theme to <html> before hydration, so pages
// never flash the wrong theme then swap. Keep this string's storage key
// ("munchly_theme_v1") in sync by hand with src/lib/theme.ts - this has to
// run standalone, before any JS bundle loads, so it can't import that
// module.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('munchly_theme_v1');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = isLocale(locale) && locale !== "en" ? `/${locale}` : "/";

  return {
    metadataBase: new URL("https://munchly.online"),
    title: "Munchly",
    description:
      "A quick decision tool for when you can't figure out what to eat — pick a mood, spin, get an answer.",
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: "Munchly",
      description:
        "A quick decision tool for when you can't figure out what to eat — pick a mood, spin, get an answer.",
      url: `https://munchly.online${path}`,
      siteName: "Munchly",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Munchly" }],
      type: "website",
    },
    // iOS "Add to Home Screen": open full-screen like an app, named Munchly.
    appleWebApp: {
      capable: true,
      title: "Munchly",
      statusBarStyle: "default",
    },
    twitter: {
      card: "summary_large_image",
      title: "Munchly",
      description:
        "A quick decision tool for when you can't figure out what to eat — pick a mood, spin, get an answer.",
      images: ["/og-image.png"],
    },
  };
}

// Only set in Vercel's Production environment (not Preview or local dev) -
// see .env.example. That keeps preview-deployment and local testing traffic
// out of the real analytics, without needing to detect the domain at
// runtime.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const messages = getMessages(locale);
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      {/* Also catches the browser's install event, which can fire before React
          loads - see src/lib/install.ts. One script rather than two, since
          each beforeInteractive script here adds a dev-mode warning. */}
      <Script id="theme-init" strategy="beforeInteractive">
        {THEME_INIT_SCRIPT + INSTALL_CAPTURE_SCRIPT}
      </Script>
      <body
        className={`${fredoka.variable} ${dmSans.variable}`}
        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
      >
        <LocaleProvider locale={locale} messages={messages}>
          {children}
          <InstallPrompts />
        </LocaleProvider>
      </body>
      {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
    </html>
  );
}
