"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { getInstallMode, popupDue, promptInstall, snoozePopup, subscribeInstall, type InstallMode } from "@/lib/install";

// "Install Munchly App" prompts, mounted once in app/layout.tsx:
//   - a popup card, a few seconds after the page opens, at most once every
//     POPUP_SNOOZE_DAYS (lib/install.ts);
//   - a thin bar fixed to the bottom of every page, always there while
//     installing is possible.
// Both run the same install action. When installing isn't possible (or
// Munchly is already installed) neither renders. See lib/install.ts.

const POPUP_DELAY_MS = 2500;

// Pages that aren't part of the app people would install.
const HIDDEN_ON = ["/studio"];

export default function InstallPrompts() {
  const pathname = usePathname();
  // Server snapshot is "none", so nothing renders until the client has
  // checked - no hydration mismatch, and nothing flashes for browsers that
  // can't install.
  const mode = useSyncExternalStore(subscribeInstall, getInstallMode, () => "none" as InstallMode);
  const [popupOpen, setPopupOpen] = useState(false);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const popupChecked = useRef(false);

  const hidden = HIDDEN_ON.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
  const available = mode !== "none" && !hidden;

  // The popup: once installing becomes possible on this visit, wait a moment,
  // then show it if it isn't snoozed. Checked once per visit; the snooze is
  // set as soon as it shows, so it's "once" even if they just ignore it.
  useEffect(() => {
    if (!available || popupChecked.current) return;
    const timer = window.setTimeout(() => {
      popupChecked.current = true;
      if (popupDue()) {
        snoozePopup();
        setPopupOpen(true);
      }
    }, POPUP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [available]);

  const install = async () => {
    setPopupOpen(false);
    if (mode === "ios") {
      setIosHelpOpen(true);
      return;
    }
    await promptInstall();
  };

  const notNow = () => {
    snoozePopup();
    setPopupOpen(false);
  };

  if (!available) return null;

  return (
    <>
      <InstallBar onInstall={install} />
      {popupOpen && <InstallPopup onInstall={install} onDismiss={notNow} />}
      {iosHelpOpen && mode === "ios" && <IosInstallHelp onClose={() => setIosHelpOpen(false)} />}
    </>
  );
}

// --- Bottom bar ------------------------------------------------------------------

function InstallBar({ onInstall }: { onInstall: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  // Publish the bar's height (including the iPhone home-indicator area) so the
  // page can pad its bottom and the games keep their buttons above it
  // (lib/viewport.ts).
  useLayoutEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty("--mly-bottom-inset", `${bar.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--mly-bottom-inset");
    };
  }, []);

  return (
    <button ref={ref} type="button" className="mly-install-bar" onClick={onInstall}>
      <span className="mly-install-bar__hop">
        <Image src="/icon-192.png" alt="" width={24} height={24} style={{ borderRadius: 6, display: "block" }} />
        <span>Install Munchly App</span>
        <DownloadIcon />
      </span>
    </button>
  );
}

// --- Popup card ------------------------------------------------------------------

function InstallPopup({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  // Non-modal, like a notification: it doesn't take focus or block the page.
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="mly-install-title"
      aria-describedby="mly-install-body"
      className="mly-install-popup"
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Image src="/icon-192.png" alt="" width={52} height={52} style={{ flex: "none", borderRadius: 14, display: "block" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <h2 id="mly-install-title" style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 20, lineHeight: 1.2, color: "var(--ink)" }}>
            Install Munchly App
          </h2>
          <p id="mly-install-body" style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: "var(--muted)" }}>
            Add Munchly to your home screen and decide what&apos;s for dinner in one tap - no app store needed.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" onClick={onDismiss} className="mly-install-btn mly-install-btn--quiet">
          Not Now
        </button>
        <button type="button" onClick={onInstall} className="mly-install-btn">
          Install
        </button>
      </div>
    </div>
  );
}

// --- iOS manual steps ------------------------------------------------------------

function IosInstallHelp({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  const step = (n: number, content: React.ReactNode) => (
    <li style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, lineHeight: 1.45, color: "var(--ink)" }}>
      <span
        aria-hidden="true"
        style={{ flex: "none", width: 28, height: 28, borderRadius: "50%", background: "var(--chip)", color: "var(--muted)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {n}
      </span>
      <span>{content}</span>
    </li>
  );

  return (
    <div className="mly-install-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mly-ios-title"
        className="mly-install-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 id="mly-ios-title" style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 22, color: "var(--ink)" }}>
            Add Munchly to your Home Screen
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ flex: "none", width: 36, height: 36, border: "none", borderRadius: "50%", background: "var(--chip)", fontSize: 20, lineHeight: 1, cursor: "pointer", color: "var(--muted)" }}
          >
            ×
          </button>
        </div>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
          {step(
            1,
            <>
              Tap the <strong>Share</strong> button <ShareIcon /> in Safari&apos;s toolbar.
            </>
          )}
          {step(
            2,
            <>
              Scroll down and tap <strong>Add to Home Screen</strong> <AddIcon />.
            </>
          )}
          {step(
            3,
            <>
              Tap <strong>Add</strong> - Munchly will open from your Home Screen like an app.
            </>
          )}
        </ol>
        <button type="button" onClick={onClose} className="mly-install-btn" style={{ alignSelf: "stretch" }}>
          Got it
        </button>
      </div>
    </div>
  );
}

// --- Icons -----------------------------------------------------------------------

// Safari's Share icon: a box with an arrow coming out of the top. Both icons
// sit inside a sentence, so they're inline-block (Tailwind's base styles make
// every <svg> display: block).
function ShareIcon() {
  return (
    <svg role="img" aria-label="(the square with an arrow pointing up)" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-5px", margin: "0 2px" }}>
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </svg>
  );
}

// The "Add to Home Screen" menu icon: a plus in a rounded square.
function AddIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" style={{ display: "inline-block", verticalAlign: "-4px", margin: "0 2px" }}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}
