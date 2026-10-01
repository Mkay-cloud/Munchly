"use client";

import { useEffect, useState, type MouseEvent } from "react";
import AuthModal from "./AuthModal";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";

export default function FavoriteButton({
  slug,
  title,
  variant = "solid",
}: {
  slug: string;
  title: string;
  variant?: "solid" | "outline" | "icon";
}) {
  const { session, loading: sessionLoading } = useSession();
  // Keyed by slug so a stale result from a previously-viewed recipe never
  // gets shown as this recipe's favorite state, without a synchronous
  // setState at the top of the effect (only the async .then() sets state).
  const [favoriteInfo, setFavoriteInfo] = useState<{ slug: string; favorited: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (sessionLoading || !session) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("favorites")
      .select("id")
      .eq("recipe_slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setFavoriteInfo({ slug, favorited: !!data });
      });
    return () => {
      cancelled = true;
    };
  }, [session, sessionLoading, slug]);

  const checking = !!session && (!favoriteInfo || favoriteInfo.slug !== slug);
  const favorited = session && favoriteInfo?.slug === slug ? favoriteInfo.favorited : false;

  const toggle = async (e?: MouseEvent) => {
    // Cards render this as an overlay on top of a clickable Link to the
    // recipe - stop the click from also triggering that navigation.
    e?.preventDefault();
    e?.stopPropagation();
    if (!session) {
      setShowAuth(true);
      return;
    }
    setBusy(true);
    const supabase = createClient();
    if (favorited) {
      const { error } = await supabase.from("favorites").delete().eq("recipe_slug", slug);
      if (!error) setFavoriteInfo({ slug, favorited: false });
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ recipe_slug: slug, user_id: session.user.id });
      if (!error) setFavoriteInfo({ slug, favorited: true });
    }
    setBusy(false);
  };

  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "13px 18px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 15,
    cursor: busy || checking ? "default" : "pointer",
    border: "1.5px solid var(--sage-line)",
    opacity: busy || checking ? 0.7 : 1,
  } as const;

  const iconStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1.5px solid var(--border)",
    background: favorited ? "var(--olive)" : "rgba(255, 253, 249, 0.92)",
    color: favorited ? "#FBF8F2" : "var(--ink)",
    fontSize: 17,
    lineHeight: 1,
    cursor: busy || checking ? "default" : "pointer",
    opacity: busy || checking ? 0.7 : 1,
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.16)",
  } as const;

  const style =
    variant === "icon"
      ? iconStyle
      : variant === "solid"
      ? { ...base, background: favorited ? "var(--olive)" : "var(--card)", color: favorited ? "#FBF8F2" : "var(--olive-text)" }
      : { ...base, background: "var(--card)", color: "var(--olive-text)" };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={busy || checking}
        aria-pressed={favorited}
        aria-label={favorited ? `Remove ${title} from favorites` : `Save ${title} to favorites`}
        style={style}
      >
        <span aria-hidden>{favorited ? "♥" : "♡"}</span>
        {variant !== "icon" && (favorited ? "Saved" : "Save")}
      </button>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      )}
    </>
  );
}
