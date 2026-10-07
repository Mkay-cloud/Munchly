"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/i18n/LocaleProvider";

export default function DeleteRecipeButton({
  recipeId,
  onDeleted,
  redirectTo,
}: {
  recipeId: string;
  // Called after a successful delete so the caller can drop the row from
  // whatever local list it's showing (e.g. the "Your submissions" list).
  onDeleted?: () => void;
  // Pass this on a page that IS the recipe (the detail page) so there's
  // somewhere to go once the row stops existing.
  redirectTo?: string;
}) {
  const t = useTranslations();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const doDelete = async () => {
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("community_recipes").delete().eq("id", recipeId);
    setDeleting(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    onDeleted?.();
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  };

  if (confirming) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#B3261E" }}>{t("deleteRecipeButton.confirmPrompt")}</span>
        <button
          type="button"
          onClick={doDelete}
          disabled={deleting}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: "#B3261E",
            color: "#FBF8F2",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            cursor: deleting ? "default" : "pointer",
            opacity: deleting ? 0.7 : 1,
          }}
        >
          {deleting ? t("deleteRecipeButton.deleting") : t("deleteRecipeButton.yesDelete")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={deleting}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: "none",
            color: "var(--muted)",
            fontWeight: 600,
            fontSize: 13,
            border: "1px solid var(--border-strong)",
            cursor: deleting ? "default" : "pointer",
          }}
        >
          {t("deleteRecipeButton.cancel")}
        </button>
        {error && <span style={{ fontSize: 13, color: "#B3261E" }}>{error}</span>}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      style={{
        padding: 0,
        background: "none",
        border: "none",
        color: "#B3261E",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {t("deleteRecipeButton.deleteLabel")}
    </button>
  );
}
