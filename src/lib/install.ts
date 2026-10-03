// "Install Munchly" logic shared by the popup card and the bottom bar
// (src/components/InstallPrompts.tsx). Nothing is shown unless installing is
// actually possible right now:
//   - Chrome / Edge / Android: only once the browser has fired
//     `beforeinstallprompt` (it does that when the site is installable and
//     not already installed). Tapping a prompt opens the native install dialog.
//   - iOS Safari: there's no such event, so tapping a prompt shows the manual
//     "Share -> Add to Home Screen" steps instead.
//   - Anything else (desktop Firefox/Safari, in-app browsers, ...): nothing.
// Once Munchly is installed - seen via `appinstalled`, or by running in
// standalone mode - both prompts are hidden for good on this browser.

// The event can fire before React has hydrated, so a tiny inline script in
// app/layout.tsx (INSTALL_CAPTURE_SCRIPT) catches it first and parks it on
// window.__mlyInstall. Keep the names in that script in sync with these.
export const INSTALL_CAPTURE_SCRIPT = `(function(){var w=window;w.__mlyInstall=w.__mlyInstall||{event:null,installed:false};w.addEventListener('beforeinstallprompt',function(e){e.preventDefault();w.__mlyInstall.event=e;w.dispatchEvent(new Event('mly-install-change'));});w.addEventListener('appinstalled',function(){w.__mlyInstall.event=null;w.__mlyInstall.installed=true;try{localStorage.setItem('munchly_installed_v1','1');}catch(e){}w.dispatchEvent(new Event('mly-install-change'));});})();`;

const INSTALLED_KEY = "munchly_installed_v1";
const POPUP_KEY = "munchly_install_popup_v1";
const CHANGE_EVENT = "mly-install-change";

// After the popup has been shown (or dismissed with "Not Now"), wait this long
// before showing it again. The bottom bar is unaffected.
export const POPUP_SNOOZE_DAYS = 21;
const POPUP_SNOOZE_MS = POPUP_SNOOZE_DAYS * 24 * 60 * 60 * 1000;

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

// "prompt": the native install dialog is available. "ios": show the manual
// steps. "none": don't show anything.
export type InstallMode = "prompt" | "ios" | "none";

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

export function getInstallMode(): InstallMode {
  if (isInstalled()) return "none";
  if (captured().event) return "prompt";
  if (isIosSafari()) return "ios";
  return "none";
}

export function subscribeInstall(onChange: () => void): () => void {
  captured();
  const media = window.matchMedia("(display-mode: standalone)");
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    media.removeEventListener("change", onChange);
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

// --- Popup card timing ---------------------------------------------------------

export function popupDue(): boolean {
  const last = Number(readFlag(POPUP_KEY));
  return !Number.isFinite(last) || last <= 0 || Date.now() - last >= POPUP_SNOOZE_MS;
}

// Called when the popup is shown and again when it's dismissed, so it waits
// POPUP_SNOOZE_DAYS before coming back either way.
export function snoozePopup() {
  writeFlag(POPUP_KEY, String(Date.now()));
}
