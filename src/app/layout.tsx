import type { Metadata } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

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
  metadataBase: new URL("https://munchly.online"),
  title: "Munchly",
  description:
    "A quick decision tool for when you can't figure out what to eat — pick a mood, spin, get an answer.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Munchly",
    description:
      "A quick decision tool for when you can't figure out what to eat — pick a mood, spin, get an answer.",
    url: "https://munchly.online",
    siteName: "Munchly",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Munchly" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Munchly",
    description:
      "A quick decision tool for when you can't figure out what to eat — pick a mood, spin, get an answer.",
    images: ["/og-image.png"],
  },
};

// Only set in Vercel's Production environment (not Preview or local dev) -
// see .env.example. That keeps preview-deployment and local testing traffic
// out of the real analytics, without needing to detect the domain at
// runtime.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${dmSans.variable}`}
        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
      >
        {children}
      </body>
      {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
    </html>
  );
}
