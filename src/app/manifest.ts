import type { MetadataRoute } from "next";

// Used when Munchly is added to a phone's home screen (Android/Chrome). iOS
// uses app/apple-icon.png instead; browser tabs use app/favicon.ico and
// app/icon.png. All are cropped from public/munchly-logo.png.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Munchly",
    short_name: "Munchly",
    description: "A quick decision tool for when you can't figure out what to eat — pick a mood, spin, get an answer.",
    start_url: "/",
    display: "browser",
    background_color: "#fbf8f2",
    theme_color: "#641f2b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
