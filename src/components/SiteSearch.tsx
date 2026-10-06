"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ResultItem = { title: string; href: string; sub?: string };
type SearchResponse = {
  recipes: ResultItem[];
  posts: ResultItem[];
  games: ResultItem[];
  pages: ResultItem[];
};

const EMPTY: SearchResponse = { recipes: [], posts: [], games: [], pages: [] };

const GROUPS: { key: keyof SearchResponse; label: string }[] = [
  { key: "recipes", label: "Recipes" },
  { key: "posts", label: "Blog posts" },
  { key: "games", label: "Games" },
  { key: "pages", label: "Pages" },
];

// A site-wide search: one icon button (rendered inside SiteMenu, so it
// shows up on every page that already has the nav) that opens a modal
// searching recipes, blog posts, games and plain pages all at once via
// /api/search. Debounced so it doesn't hit Sanity on every keystroke.
export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults(EMPTY);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    // Autofocus the input as soon as the modal mounts.
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(t);
    };
  }, [open]);

  // Debouncing lives in this handler (fired from the input's onChange)
  // rather than in a useEffect watching `query` - that keeps every
  // setState call inside an event handler or a timeout callback, never
  // synchronously in an effect body.
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const id = ++requestIdRef.current;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data: SearchResponse = await res.json();
        // Ignore stale responses from an earlier, slower request.
        if (id === requestIdRef.current) setResults(data);
      } catch {
        if (id === requestIdRef.current) setResults(EMPTY);
      } finally {
        if (id === requestIdRef.current) setLoading(false);
      }
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasAnyResults =
    results.recipes.length + results.posts.length + results.games.length + results.pages.length > 0;
  const showEmptyState = query.trim().length >= 2 && !loading && !hasAnyResults;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search Munchly"
        title="Search"
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="var(--ink)" strokeWidth="2" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search Munchly"
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(20,14,10,0.45)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "72px 16px 16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "calc(100vh - 100px)",
              display: "flex",
              flexDirection: "column",
              borderRadius: 24,
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                <circle cx="11" cy="11" r="7" stroke="var(--muted)" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search recipes, blog posts, games, pages..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 16,
                  color: "var(--ink)",
                }}
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                style={{
                  flex: "none",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--muted)",
                  padding: "4px 6px",
                }}
              >
                Esc
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: hasAnyResults ? "8px" : "0" }}>
              {query.trim().length < 2 && (
                <p style={{ margin: 0, padding: "20px 16px", fontSize: 14, color: "var(--muted)" }}>
                  Type at least 2 characters to search the whole site.
                </p>
              )}
              {loading && query.trim().length >= 2 && (
                <p style={{ margin: 0, padding: "20px 16px", fontSize: 14, color: "var(--muted)" }}>Searching...</p>
              )}
              {showEmptyState && (
                <p style={{ margin: 0, padding: "20px 16px", fontSize: 14, color: "var(--muted)" }}>
                  No matches for &ldquo;{query.trim()}&rdquo;.
                </p>
              )}
              {!loading &&
                GROUPS.map(({ key, label }) => {
                  const items = results[key];
                  if (items.length === 0) return null;
                  return (
                    <div key={key} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
                      <span
                        style={{
                          padding: "8px 10px 4px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {label}
                      </span>
                      {items.map((item) => (
                        <Link
                          key={item.href + item.title}
                          href={item.href}
                          onClick={close}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            padding: "9px 10px",
                            borderRadius: 12,
                            color: "var(--ink)",
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</span>
                          {item.sub && (
                            <span style={{ fontSize: 13, color: "var(--muted)" }}>{item.sub}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
