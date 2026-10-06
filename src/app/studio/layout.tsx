import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio — Munchly",
  robots: { index: false, follow: false },
};

// Sanity Studio is a standalone admin tool that lives outside the
// localized app, so it gets its own minimal root layout (no fonts, theme
// script, install prompts, or analytics - none of that applies here).
export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
