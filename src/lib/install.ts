// "Install Munchly" logic shared by the popup card and bottom bar
// (src/components/InstallPrompts.tsx) and the /download page. Nothing offers
// an install that can't happen:
//   - Chrome / Edge / Android: only once the browser has fired
//     `beforeinstallprompt` (it does that when the site is installable and
//     not already installed). Installing opens the native install dialog.
//   - iOS Safari: there's no such event, so installing shows the manual
//     "Share -> Add to Home Screen" steps instead.
//   - In-app browsers (Instagram, Facebook, TikTok, ...): installing is
//     impossible inside them, so the prompts send people to /download, which
//     helps them get into a real browser.
//   - Anything else (desktop Firefox/Safari, ...): nothing.
// The popup and bar are phone-width only (see isPhoneViewport). Once Munchly
// is installed - seen via `appinstalled`, an accepted prompt, or running in
// standalone mode - all of it is hidden for good on this browser.

// The event can fire before React has hydrated, so a tiny inline script in
// app/layout.tsx (INSTALL_CAPTURE_SCRIPT) catches it first and parks it on
// window.__mlyInstall. Keep the names in that script in sync with these.
export const INSTALL_CAPTURE_SCRIPT = `(function(){var w=window;w.__mlyInstall=w.__mlyInstall||{event:null,installed:false};w.addEventListener('beforeinstallprompt',function(e){e.preventDefault();w.__mlyInstall.event=e;w.dispatchEvent(new Event('mly-install-change'));});w.addEventListener('appinstalled',function(){w.__mlyInstall.event=null;w.__mlyInstall.installed=true;try{localStorage.setItem('munchly_installed_v1','1');}catch(e){}w.dispatchEvent(new Event('mly-install-change'));});})();`;

const INSTALLED_KEY = "munchly_installed_v1";
const CHANGE_EVENT = "mly-install-change";

// Phone widths: below Tailwind's `sm` breakpoint (640px), the same split
// SiteMenu uses between its full-width phone menu and the desktop dropdown.
const PHONE_QUERY = "(max-width: 639.98px)";

// Chrome's BeforeInstallPromptEvent - not in TypeScript's DOM types.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Captured = { event: BeforeInstallPromptEvent | null; installed: boolean };

declare global {
  interface Window {
    __mlyInstall?: Captured;
  }
}

// What installing looks like on this browser right now:
//   "prompt"    - the native install dialog is available
//   "ios"       - iOS Safari: show the manual steps
//   "inapp"     - inside an app's built-in browser: send them to /download
//   "installed" - already installed (or running as the installed app)
//   "none"      - not possible here
export type InstallCapability = "prompt" | "ios" | "inapp" | "installed" | "none";

// What the popup and bottom bar should do: one of the actionable modes, or
// "none" to stay hidden.
export type InstallMode = "prompt" | "ios" | "inapp" | "none";

function captured(): Captured {
  if (!window.__mlyInstall) window.__mlyInstall = { event: null, installed: false };
  return window.__mlyInstall;
}

function readFlag(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeFlag(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked - the state still holds for this visit.
  }
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Running as the installed app (Android/desktop standalone window, or an iOS
// home-screen web app).
export function isStandalone(): boolean {
  const modes = ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"];
  if (modes.some((m) => window.matchMedia(`(display-mode: ${m})`).matches)) return true;
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

// iOS / iPadOS Safari - the one browser where the manual steps apply. iPadOS
// reports itself as a Mac, so it's told apart by having a touch screen. Other
// iOS browsers and in-app browsers (Chrome, Firefox, the Google app,
// Instagram, ...) are left out: their Share button lives somewhere else, or
// they can't add to the home screen at all.
export function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!iOS) return false;
  return /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|FBAN|FBAV|Instagram|Line\/|Twitter|DuckDuckGo|YaBrowser/.test(ua);
}

// Built-in browsers of other apps, which can't install web apps at all. User
// agent markers: Instagram, Facebook / Messenger (FBAN, FBAV, FB_IAB, FBIOS),
// TikTok (musical_ly, Bytedance, TikTok, trill), Snapchat, X / Twitter,
// LinkedIn, Pinterest, Threads (Barcelona), LINE, WeChat (MicroMessenger),
// KakaoTalk, plus any Android WebView (marked "; wv)"), which is what
// in-app browsers on Android are built on.
const IN_APP_PATTERNS: [string, RegExp][] = [
  ["Instagram", /Instagram/i],
  ["Facebook", /FBAN|FBAV|FB_IAB|FBIOS|FB4A|MessengerForiOS/i],
  ["TikTok", /musical_ly|Bytedance|TikTok|trill_/i],
  ["Snapchat", /Snapchat/i],
  ["X", /Twitter/i],
  ["LinkedIn", /LinkedInApp/i],
  ["Pinterest", /Pinterest/i],
  ["Threads", /Barcelona/i],
  ["LINE", /\bLine\//],
  ["WeChat", /MicroMessenger/i],
  ["KakaoTalk", /KAKAOTALK/i],
];

// The app's name if this is a known in-app browser ("Instagram", ...), "app"
// for an unidentified Android WebView, or null for a real browser.
export function inAppBrowserName(): string | null {
  const ua = navigator.userAgent;
  for (const [name, pattern] of IN_APP_PATTERNS) if (pattern.test(ua)) return name;
  if (/Android/.test(ua) && /; wv\)/.test(ua)) return "app";
  return null;
}

export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

export function isPhoneViewport(): boolean {
  return window.matchMedia(PHONE_QUERY).matches;
}

export function isInstalled(): boolean {
  if (captured().installed || readFlag(INSTALLED_KEY) === "1") return true;
  if (isStandalone()) {
    // Remember it, so the prompts stay hidden when they're back in a normal
    // browser tab too.
    writeFlag(INSTALLED_KEY, "1");
    return true;
  }
  return false;
}

export function getInstallCapability(): InstallCapability {
  if (isInstalled()) return "installed";
  if (inAppBrowserName()) return "inapp";
  if (captured().event) return "prompt";
  if (isIosSafari()) return "ios";
  return "none";
}

// For the popup and bar: phones only - desktop Chrome/Edge can install too,
// but these nudges are meant for phones.
export function getInstallMode(): InstallMode {
  if (!isPhoneViewport()) return "none";
  const capability = getInstallCapability();
  return capability === "installed" ? "none" : capability;
}

export function subscribeInstall(onChange: () => void): () => void {
  captured();
  const queries = [window.matchMedia("(display-mode: standalone)"), window.matchMedia(PHONE_QUERY)];
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  queries.forEach((q) => q.addEventListener("change", onChange));
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    queries.forEach((q) => q.removeEventListener("change", onChange));
  };
}

// Opens Chrome's native install dialog. The event can only be used once, so
// it's dropped either way; Chrome fires a fresh one on a later page load if
// the site is still installable.
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const state = captured();
  const event = state.event;
  if (!event) return "unavailable";
  state.event = null;
  notify();
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === "accepted") {
      // `appinstalled` normally follows; set the flag now in case it doesn't.
      state.installed = true;
      writeFlag(INSTALLED_KEY, "1");
      notify();
    }
    return outcome;
  } catch {
    return "unavailable";
  }
}

// --- Leaving an in-app browser ------------------------------------------------------

// Android: an intent:// link that opens `path` on this site in Chrome. If
// Chrome isn't installed, Android falls back to `fallbackPath` (in the same
// in-app browser). Best-effort - apps can block or change how they handle
// intent links at any time.
export function chromeIntentUrl(path: string, fallbackPath: string): string {
  const { protocol, host, origin } = window.location;
  const scheme = protocol.replace(":", "");
  const fallback = encodeURIComponent(origin + fallbackPath);
  return `intent://${host}${path}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}
