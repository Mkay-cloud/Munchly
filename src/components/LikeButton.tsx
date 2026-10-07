"use client";

import { useState, type MouseEvent } from "react";
import AuthModal from "./AuthModal";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";
import { useTranslations } from "@/i18n/LocaleProvider";

export default function LikeButton({
  recipeId,
  initialLiked,
  initialCount,
}: {
  recipeId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const t = useTranslations();
  const { session, loading: sessionLoading } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const toggle = async (e?: MouseEvent) => {
    // Cards render this next to (not inside) a Link to the recipe, but the
    // stopPropagation guards against that changing later without this
    // button starting to also trigger navigation.
    e?.preventDefault();
    e?.stopPropagation();
    if (sessionLoading || busy) return;
    if (!session) {
      setShowAuth(true);
      return;
    }

    setBusy(true);
    const supabase = createClient();
    if (liked) {
      const { error } = await supabase
        .from("community_recipe_likes")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", session.user.id);
      if (!error) {
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase
        .from("community_recipe_likes")
        .insert({ recipe_id: recipeId, user_id: session.user.id });
      if (!error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
    setBusy(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={liked}
        aria-label={liked ? t("likeButton.unlikeAria") : t("likeButton.likeAria")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "9px 16px",
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 14,
          cursor: busy ? "default" : "pointer",
          border: `1.5px solid ${liked ? "var(--primary)" : "var(--border)"}`,
          background: liked ? "var(--primary)" : "var(--card)",
          color: liked ? "#FBF8F2" : "var(--ink)",
          opacity: busy ? 0.7 : 1,
        }}
      >
        <span aria-hidden>{liked ? "♥" : "♡"}</span>
        {count}
      </button>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      )}
    </>
  );
}
