"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import LocaleLink from "@/i18n/Link";
import { useTranslations } from "@/i18n/LocaleProvider";
import type { CommunityRecipe, CommunityRecipeStatus } from "@/lib/community";

const STATUS_STYLE: Record<CommunityRecipeStatus, { bg: string; fg: string }> = {
  pending: { bg: "var(--chip)", fg: "var(--muted)" },
  approved: { bg: "var(--sage-tint)", fg: "var(--olive-text)" },
  rejected: { bg: "#FBEAEA", fg: "#B3261E" },
};

function StatusBadge({ status }: { status: CommunityRecipeStatus }) {
  const t = useTranslations();
  const s = STATUS_STYLE[status];
  const label =
    status === "pending"
      ? t("suggestForm.statusPending")
      : status === "approved"
        ? t("suggestForm.statusApproved")
        : t("suggestForm.statusRejected");
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: s.bg,
        color: s.fg,
      }}
    >
      {label}
    </span>
  );
}

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--border-strong)",
  fontSize: 15,
  background: "var(--bg)",
  color: "var(--ink)",
  width: "100%",
  fontFamily: "inherit",
} as const;

// Whether an edit to this recipe goes straight to its live fields (nothing
// public to protect yet) or gets staged in the pending_* columns (it's
// already approved and live, so the old version has to keep showing until
// the edit itself is approved).
function isLiveEdit(recipe: CommunityRecipe) {
  return recipe.status === "approved" && recipe.has_pending_edit;
}

export default function SuggestForm({
  displayName,
  initialSubmissions,
  editingRecipe,
}: {
  displayName: string;
  initialSubmissions: CommunityRecipe[];
  editingRecipe: CommunityRecipe | null;
}) {
  const t = useTranslations();
  const { session } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const prefillFromLiveEdit = !!editingRecipe && isLiveEdit(editingRecipe);

  const [title, setTitle] = useState(() =>
    editingRecipe ? (prefillFromLiveEdit ? editingRecipe.pending_title ?? "" : editingRecipe.title) : ""
  );
  const [description, setDescription] = useState(() =>
    editingRecipe ? (prefillFromLiveEdit ? editingRecipe.pending_description : editingRecipe.description) ?? "" : ""
  );
  const [cuisine, setCuisine] = useState(() =>
    editingRecipe ? (prefillFromLiveEdit ? editingRecipe.pending_cuisine : editingRecipe.cuisine) ?? "" : ""
  );
  const [timeMinutes, setTimeMinutes] = useState(() => {
    if (!editingRecipe) return "";
    const t = prefillFromLiveEdit ? editingRecipe.pending_time_minutes : editingRecipe.time_minutes;
    return t ? String(t) : "";
  });
  const [ingredients, setIngredients] = useState(() =>
    editingRecipe ? (prefillFromLiveEdit ? editingRecipe.pending_ingredients ?? "" : editingRecipe.ingredients) : ""
  );
  const [instructions, setInstructions] = useState(() =>
    editingRecipe ? (prefillFromLiveEdit ? editingRecipe.pending_instructions ?? "" : editingRecipe.instructions) : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCuisine("");
    setTimeMinutes("");
    setIngredients("");
    setInstructions("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedIngredients = ingredients.trim();
    const trimmedInstructions = instructions.trim();
    if (!trimmedTitle || !trimmedIngredients || !trimmedInstructions) {
      setError(t("suggestForm.requiredError"));
      return;
    }

    setSaving(true);
    const supabase = createClient();

    if (editingRecipe) {
      const payload = isLiveEdit(editingRecipe)
        ? {
            pending_title: trimmedTitle,
            pending_description: description.trim() || null,
            pending_ingredients: trimmedIngredients,
            pending_instructions: trimmedInstructions,
            pending_cuisine: cuisine.trim() || null,
            pending_time_minutes: timeMinutes ? Number(timeMinutes) : null,
            has_pending_edit: true,
          }
        : {
            title: trimmedTitle,
            description: description.trim() || null,
            ingredients: trimmedIngredients,
            instructions: trimmedInstructions,
            cuisine: cuisine.trim() || null,
            time_minutes: timeMinutes ? Number(timeMinutes) : null,
            status: "pending" as const,
          };

      const { error: updateError } = await supabase
        .from("community_recipes")
        .update(payload)
        .eq("id", editingRecipe.id);
      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/suggest");
      router.refresh();
      return;
    }

    const { data, error: insertError } = await supabase
      .from("community_recipes")
      .insert({
        user_id: session.user.id,
        title: trimmedTitle,
        description: description.trim() || null,
        ingredients: trimmedIngredients,
        instructions: trimmedInstructions,
        cuisine: cuisine.trim() || null,
        time_minutes: timeMinutes ? Number(timeMinutes) : null,
      })
      .select()
      .single();
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSubmissions((prev) => [data as CommunityRecipe, ...prev]);
    reset();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {editingRecipe ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 22 }}>
              {t("suggestForm.editTitle")}
            </h2>
            {isLiveEdit(editingRecipe) && (
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
                {t("suggestForm.liveEditNotice")}
              </p>
            )}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
            {t("suggestForm.postingAsBefore")}
            <strong style={{ color: "var(--ink)" }}>{displayName}</strong>.{" "}
            <LocaleLink href="/profile" style={{ color: "var(--primary)", fontWeight: 600 }}>
              {t("suggestForm.notYou")}
            </LocaleLink>
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="title" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            {t("suggestForm.titleLabel")}
          </label>
          <input
            id="title"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("suggestForm.titlePlaceholder")}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="description" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            {t("suggestForm.descriptionLabel")} <span style={{ fontWeight: 400 }}>{t("suggestForm.optional")}</span>
          </label>
          <input
            id="description"
            maxLength={160}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("suggestForm.descriptionPlaceholder")}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 180px" }}>
            <label htmlFor="cuisine" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              {t("suggestForm.cuisineLabel")} <span style={{ fontWeight: 400 }}>{t("suggestForm.optional")}</span>
            </label>
            <input
              id="cuisine"
              maxLength={40}
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder={t("suggestForm.cuisinePlaceholder")}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 140px" }}>
            <label htmlFor="timeMinutes" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              {t("suggestForm.timeLabel")} <span style={{ fontWeight: 400 }}>{t("suggestForm.optional")}</span>
            </label>
            <input
              id="timeMinutes"
              type="number"
              min={1}
              max={999}
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(e.target.value)}
              placeholder="45"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="ingredients" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            {t("suggestForm.ingredientsLabel")}
          </label>
          <textarea
            id="ingredients"
            required
            rows={6}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={t("suggestForm.ingredientsPlaceholder")}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="instructions" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            {t("suggestForm.instructionsLabel")}
          </label>
          <textarea
            id="instructions"
            required
            rows={8}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={t("suggestForm.instructionsPlaceholder")}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {error && <p style={{ margin: 0, fontSize: 14, color: "#B3261E" }}>{error}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "13px 22px",
              borderRadius: 999,
              background: "var(--primary)",
              color: "#FBF8F2",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
              alignSelf: "flex-start",
            }}
          >
            {saving ? t("suggestForm.saving") : editingRecipe ? t("suggestForm.saveChanges") : t("suggestForm.submitRecipe")}
          </button>
          {editingRecipe && (
            <LocaleLink href="/suggest" style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>
              {t("suggestForm.cancel")}
            </LocaleLink>
          )}
        </div>
      </form>

      {submissions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 22 }}>
            {t("suggestForm.yourSubmissions")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {submissions.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  padding: "14px 18px",
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <LocaleLink href={`/community/${r.id}`} style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
                    {r.title}
                  </LocaleLink>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={r.status} />
                    {isLiveEdit(r) && (
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: "var(--chip)",
                          color: "var(--muted)",
                        }}
                      >
                        {t("suggestForm.editPendingReview")}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <LocaleLink href={`/suggest?edit=${r.id}`} style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
                    {t("suggestForm.edit")}
                  </LocaleLink>
                  <DeleteRecipeButton
                    recipeId={r.id}
                    onDeleted={() => setSubmissions((prev) => prev.filter((x) => x.id !== r.id))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
