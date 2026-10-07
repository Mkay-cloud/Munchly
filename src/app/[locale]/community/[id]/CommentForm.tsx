"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";
import { useTranslations } from "@/i18n/LocaleProvider";

export default function CommentForm({ recipeId }: { recipeId: string }) {
  const t = useTranslations();
  const { session } = useSession();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const trimmed = body.trim();
    if (!trimmed) return;

    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("community_recipe_comments")
      .insert({ recipe_id: recipeId, user_id: session.user.id, body: trimmed });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setBody("");
    // Re-fetches the server-rendered comment list (including this new
    // comment, properly joined with the commenter's profile) without a full
    // client remount.
    router.refresh();
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <textarea
        required
        rows={3}
        maxLength={1000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("commentForm.placeholder")}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1.5px solid var(--border-strong)",
          fontSize: 15,
          background: "var(--bg)",
          color: "var(--ink)",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
      {error && <p style={{ margin: 0, fontSize: 14, color: "#B3261E" }}>{error}</p>}
      <button
        type="submit"
        disabled={saving || !body.trim()}
        style={{
          padding: "11px 20px",
          borderRadius: 999,
          background: "var(--primary)",
          color: "#FBF8F2",
          fontWeight: 600,
          fontSize: 14,
          border: "none",
          cursor: saving ? "default" : "pointer",
          opacity: saving || !body.trim() ? 0.7 : 1,
          alignSelf: "flex-start",
        }}
      >
        {saving ? t("commentForm.posting") : t("commentForm.postComment")}
      </button>
    </form>
  );
}
