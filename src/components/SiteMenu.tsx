"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { APP_LINKS, ACCOUNT_LINKS, INFO_LINKS, type MenuLink } from "@/lib/siteLinks";
import SiteSearch from "./SiteSearch";

function MenuGroup({ label, links, onNavigate }: { label: string; links: MenuLink[]; onNavigate: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          padding: "8px 16px 4px",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onNavigate}
          style={{ padding: "11px 16px", borderRadius: 12, fontWeight: 600, fontSize: 15, color: "var(--ink)" }}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

// A single nav entry point for the whole site: a hamburger button that
// opens a full-width drawer on phones (a proper mobile "menu bar" for
// jumping between the app's pages) and a compact dropdown anchored under
// the button on larger screens - same button, same link list, the panel
// just changes shape per breakpoint via Tailwind's `sm:` responsive classes.
export default function SiteMenu() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <SiteSearch />
      <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        style={{
          width: 42,
          height: 42,
          flex: "none",
          borderRadius: "50%",
          border: "1.5px solid var(--border-strong)",
          background: "var(--card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ width: 18, height: 2, borderRadius: 1, background: "var(--ink)" }} />
          <span style={{ width: 18, height: 2, borderRadius: 1, background: "var(--ink)" }} />
          <span style={{ width: 18, height: 2, borderRadius: 1, background: "var(--ink)" }} />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-x-0 top-16 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-72 sm:rounded-2xl"
          style={{
            background: "var(--card)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "0 16px 32px rgba(0,0,0,0.18)",
            zIndex: 30,
            maxHeight: "calc(100vh - 72px)",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <MenuGroup label="Munchly" links={APP_LINKS} onNavigate={close} />
            <MenuGroup label="Your account" links={ACCOUNT_LINKS} onNavigate={close} />
            <MenuGroup label="Info" links={INFO_LINKS} onNavigate={close} />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
