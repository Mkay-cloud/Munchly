import type { MetadataRoute } from "next";

// Makes Munchly installable (Chrome/Edge/Android "Install app", and what the
// install prompts in components/InstallPrompts.tsx trigger). iOS uses
// app/apple-icon.png and the appleWebApp metadata in app/layout.tsx instead;
// browser tabs use app/favicon.ico and app/icon.png. All icons are cropped
// from public/munchly-logo.png.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Munchly",
    short_name: "Munchly",
    description: "A quick decision tool for when you can't figure out what to eat — pick a mood, spin, get an answer.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // --bg and --primary (light theme) from globals.css: the splash screen
    // background, and the installed app's title/status bar.
    background_color: "#fbf8f2",
    theme_color: "#641f2b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
