import type { Metadata } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import "../globals.css";

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

export const metadata: Metadata = {
  title: "Admin — Munchly",
  robots: { index: false, follow: false },
};

// Internal-only admin area, kept outside the localized [locale] tree (it's
// for the site owner, not visitors, so it doesn't need translation or a
// locale-prefixed URL). It needs its own root layout since it no longer
// shares one with the public app - reusing the same fonts/theme-init so it
// looks and feels consistent with the rest of the site.
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <script
        id="theme-init"
        dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
      />
      <body
        className={`${fredoka.variable} ${dmSans.variable}`}
        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
