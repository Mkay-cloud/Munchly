"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import type { CommunityRecipe, CommunityRecipeStatus } from "@/lib/community";

const STATUS_STYLE: Record<CommunityRecipeStatus, { bg: string; fg: string; label: string }> = {
  pending: { bg: "var(--chip)", fg: "var(--muted)", label: "Pending review" },
  approved: { bg: "var(--sage-tint)", fg: "var(--olive-text)", label: "Approved" },
  rejected: { bg: "#FBEAEA", fg: "#B3261E", label: "Not approved" },
};

function StatusBadge({ status }: { status: CommunityRecipeStatus }) {
  const s = STATUS_STYLE[status];
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
      {s.label}
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
      setError("Title, ingredients, and instructions are all required.");
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
              Edit your recipe
            </h2>
            {isLiveEdit(editingRecipe) && (
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
                This recipe is already live. Your changes will be held for review and won&rsquo;t replace the
                published version until they&rsquo;re approved.
              </p>
            )}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
            Posting as <strong style={{ color: "var(--ink)" }}>{displayName}</strong>.{" "}
            <a href="/profile" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Not you?
            </a>
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="title" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            Title
          </label>
          <input
            id="title"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My grandmother's jollof rice"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="description" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            Short description <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            id="description"
            maxLength={160}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One line about what makes it good"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 180px" }}>
            <label htmlFor="cuisine" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              Cuisine <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="cuisine"
              maxLength={40}
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="West African"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 140px" }}>
            <label htmlFor="timeMinutes" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              Time (minutes) <span style={{ fontWeight: 400 }}>(optional)</span>
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
            Ingredients
          </label>
          <textarea
            id="ingredients"
            required
            rows={6}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={"One per line, e.g.\n2 cups rice\n1 can tomatoes\n1 onion, diced"}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="instructions" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            Instructions
          </label>
          <textarea
            id="instructions"
            required
            rows={8}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={"One step per line, e.g.\nRinse the rice until the water runs clear\nBlend the tomatoes and pepper\n..."}
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
            {saving ? "Saving…" : editingRecipe ? "Save changes" : "Submit recipe"}
          </button>
          {editingRecipe && (
            <Link href="/suggest" style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>
              Cancel
            </Link>
          )}
        </div>
      </form>

      {submissions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 22 }}>
            Your submissions
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
                  <Link href={`/community/${r.id}`} style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
                    {r.title}
                  </Link>
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
                        Edit pending review
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Link href={`/suggest?edit=${r.id}`} style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
                    Edit
                  </Link>
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
