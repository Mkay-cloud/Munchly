"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { IosInstallHelp } from "@/components/InstallPrompts";
import LocaleLink from "@/i18n/Link";
import { useTranslations } from "@/i18n/LocaleProvider";
import {
  chromeIntentUrl,
  getInstallCapability,
  inAppBrowserName,
  isAndroid,
  promptInstall,
  subscribeInstall,
  type InstallCapability,
} from "@/lib/install";

// The /download page body. Same install logic as the popup and bottom bar
// (lib/install.ts), plus a way out of other apps' built-in browsers:
//   - Android in-app browser: tries once to reopen this page in Chrome with
//     an intent:// link, and offers an "Open in Chrome" button and the menu
//     steps in case that didn't work.
//   - iOS in-app browser: no automatic way out, so it shows which menu to use
//     and a "Copy link" button.
// In a normal browser it's just the page with a working install button.

// Set once the automatic Chrome hand-off has been tried this session, so a
// failed attempt can't loop.
const HANDOFF_KEY = "munchly_download_handoff_v1";
// Where Android sends people if Chrome isn't installed (back here, in the
// same in-app browser) - this flag stops a second attempt.
const FALLBACK_PATH = "/download?from=inapp";

type Status = InstallCapability | "pending";

export default function DownloadClient() {
  const t = useTranslations();
  // "pending" on the server and during hydration, so the server HTML and the
  // first client render match; the real answer arrives right after.
  const capability = useSyncExternalStore<Status>(subscribeInstall, getInstallCapability, () => "pending");
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const [handingOff, setHandingOff] = useState(false);

  // Android in-app browser: try to reopen this page in Chrome, once.
  useEffect(() => {
    if (capability !== "inapp" || !isAndroid()) return;
    if (new URLSearchParams(window.location.search).has("from")) return;
    try {
      if (window.sessionStorage.getItem(HANDOFF_KEY)) return;
    } catch {
      // No session storage: still try once per page load.
    }
    const timer = window.setTimeout(() => {
      // Marked as tried only when it actually fires, so an effect that's
      // cleaned up and re-run (React does this in development) still gets
      // its one attempt.
      try {
        window.sessionStorage.setItem(HANDOFF_KEY, "1");
      } catch {
        // ignore
      }
      setHandingOff(true);
      window.location.href = chromeIntentUrl("/download", FALLBACK_PATH);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [capability]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
      <Image src="/icon-512.png" alt="Munchly" width={112} height={112} priority style={{ borderRadius: 28, boxShadow: "0 14px 34px rgba(30, 20, 15, 0.18)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-fredoka)",
            fontWeight: 600,
            fontSize: "clamp(32px, 7vw, 44px)",
            lineHeight: 1.08,
            letterSpacing: "-0.015em",
          }}
        >
          {t("downloadPage.title")}
        </h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)" }}>
          {t("downloadPage.subtitle")}
        </p>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {capability === "pending" && (
          <button type="button" className="mly-install-btn mly-download-btn" disabled aria-busy="true">
            {t("downloadPage.installButton")}
          </button>
        )}

        {capability === "prompt" && (
          <button type="button" className="mly-install-btn mly-download-btn" onClick={() => promptInstall()}>
            {t("downloadPage.installButton")}
          </button>
        )}

        {capability === "ios" && (
          <button type="button" className="mly-install-btn mly-download-btn" onClick={() => setIosHelpOpen(true)}>
            {t("downloadPage.installButton")}
          </button>
        )}

        {capability === "installed" && (
          <Notice title={t("downloadPage.installedTitle")}>
            {t("downloadPage.installedBodyBefore")}
            <LocaleLink href="/" style={{ color: "var(--primary-text)", fontWeight: 600 }}>
              {t("downloadPage.installedBodyLink")}
            </LocaleLink>
            .
          </Notice>
        )}

        {capability === "none" && <NotInstallableHere />}

        {capability === "inapp" && (isAndroid() ? <AndroidInApp handingOff={handingOff} /> : <IosInApp />)}
      </div>

      {iosHelpOpen && capability === "ios" && <IosInstallHelp onClose={() => setIosHelpOpen(false)} />}
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      role="status"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "18px 20px",
        borderRadius: 22,
        border: "1px solid var(--border)",
        background: "var(--card)",
        textAlign: "left",
      }}
    >
      <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 20, color: "var(--ink)" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.55, color: "var(--ink-2)" }}>{children}</div>
    </div>
  );
}

// A normal browser that can't install from this page (desktop Firefox or
// Safari, Chrome on iPhone, Android before the browser is ready, ...).
function NotInstallableHere() {
  const t = useTranslations();
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (iOS) {
    return (
      <Notice title={t("downloadPage.notInstallableIosTitle")}>
        <span>{t("downloadPage.notInstallableIosBody")}</span>
        <CopyLink />
      </Notice>
    );
  }
  if (isAndroid()) {
    return (
      <Notice title={t("downloadPage.notInstallableAndroidTitle")}>
        <span>
          {t("downloadPage.notInstallableAndroidBodyBefore")}
          <strong>{t("downloadPage.notInstallableAndroidBodyMenu")}</strong>
          {t("downloadPage.notInstallableAndroidBodyOr")}
          <strong>{t("downloadPage.notInstallableAndroidBodyHome")}</strong>
          {t("downloadPage.notInstallableAndroidBodyAfter")}
        </span>
      </Notice>
    );
  }
  return (
    <Notice title={t("downloadPage.notInstallableDesktopTitle")}>
      <span>
        {t("downloadPage.notInstallableDesktopBodyBefore")}
        <strong>{t("downloadPage.notInstallableDesktopBodyUrl")}</strong>
        {t("downloadPage.notInstallableDesktopBodyAfter")}
      </span>
    </Notice>
  );
}

function AndroidInApp({ handingOff }: { handingOff: boolean }) {
  const t = useTranslations();
  const app = inAppBrowserName();
  const where = app && app !== "app" ? t("downloadPage.builtInBrowserOf", { app }) : t("downloadPage.builtInBrowserGeneric");
  return (
    <Notice title={t("downloadPage.androidInAppTitle")}>
      <span>
        {t("downloadPage.androidInAppBodyBefore", { where })}
        {handingOff ? t("downloadPage.androidInAppAutoNotice") : ""}
        {t("downloadPage.androidInAppBodyAfter")}
      </span>
      <a href={chromeIntentUrl("/download", FALLBACK_PATH)} className="mly-install-btn mly-download-btn" style={{ alignSelf: "stretch", textAlign: "center" }}>
        {t("downloadPage.openInChrome")}
      </a>
      <CopyLink />
    </Notice>
  );
}

function IosInApp() {
  const t = useTranslations();
  const app = inAppBrowserName();
  const steps =
    app === "Instagram"
      ? t("downloadPage.iosStepsInstagram")
      : app === "Facebook"
        ? t("downloadPage.iosStepsFacebook")
        : app === "TikTok"
          ? t("downloadPage.iosStepsTikTok")
          : t("downloadPage.iosStepsDefault");
  const where = app && app !== "app" ? t("downloadPage.builtInBrowserOf", { app }) : t("downloadPage.builtInBrowserGeneric");
  return (
    <Notice title={t("downloadPage.iosInAppTitle")}>
      <span>{t("downloadPage.iosInAppBody", { where })}</span>
      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{steps}</span>
      <span>{t("downloadPage.orCopyLink")}</span>
      <CopyLink />
    </Notice>
  );
}

// The /download URL with a Copy button. Falls back to selecting the text
// (and the old execCommand copy) where the clipboard API isn't allowed, as
// in some in-app browsers.
function CopyLink() {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const url = `${window.location.origin}/download`;

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      return;
    } catch {
      // Fall through to the selection-based copy.
    }
    const input = inputRef.current;
    input?.focus();
    input?.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    setState(ok ? "copied" : "failed");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          readOnly
          value={url}
          aria-label={t("downloadPage.linkAria")}
          onFocus={(e) => e.currentTarget.select()}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            padding: "0 12px",
            borderRadius: 12,
            border: "1.5px solid var(--border-strong)",
            background: "var(--bg)",
            color: "var(--ink)",
            fontSize: 15,
          }}
        />
        <button type="button" onClick={copy} className="mly-install-btn" style={{ flex: "none", padding: "10px 18px" }}>
          {state === "copied" ? t("downloadPage.copied") : t("downloadPage.copyLink")}
        </button>
      </div>
      <span aria-live="polite" style={{ fontSize: 14, color: "var(--muted)", minHeight: 20 }}>
        {state === "copied" ? t("downloadPage.copiedHint") : state === "failed" ? t("downloadPage.failedHint") : ""}
      </span>
    </div>
  );
}
