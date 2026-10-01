"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CommunityRecipe } from "@/lib/community";

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  padding: "18px 20px",
  borderRadius: 18,
  border: "1px solid var(--border)",
  background: "var(--card)",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-fredoka)",
  fontWeight: 600,
  fontSize: 22,
};

function primaryButtonStyle(danger: boolean): React.CSSProperties {
  return {
    padding: "9px 18px",
    borderRadius: 999,
    background: danger ? "#B3261E" : "var(--olive)",
    color: "#FBF8F2",
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    cursor: "pointer",
  };
}

const ghostButtonStyle: React.CSSProperties = {
  padding: "9px 18px",
  borderRadius: 999,
  background: "none",
  color: "var(--muted)",
  fontWeight: 600,
  fontSize: 14,
  border: "1px solid var(--border-strong)",
  cursor: "pointer",
};

function RecipeMeta({ recipe, authorName }: { recipe: CommunityRecipe; authorName: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Link href={`/community/${recipe.id}`} style={{ fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>
          {recipe.title}
        </Link>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>by {authorName}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
        {[recipe.cuisine, recipe.time_minutes ? `${recipe.time_minutes} min` : null].filter(Boolean).join(" · ") || "No cuisine/time given"}
      </p>
    </div>
  );
}

function diffRow(label: string, oldVal: string, newVal: string) {
  const changed = oldVal !== newVal;
  return (
    <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label} - current
        </span>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", color: "var(--ink)" }}>{oldVal || "—"}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: changed ? "var(--olive-text)" : "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label} - proposed
        </span>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            color: "var(--ink)",
            background: changed ? "var(--sage-tint)" : "transparent",
            borderRadius: 8,
            padding: changed ? "4px 8px" : 0,
          }}
        >
          {newVal || "—"}
        </p>
      </div>
    </div>
  );
}

function SubmissionCard({
  recipe,
  authorName,
  onResolved,
}: {
  recipe: CommunityRecipe;
  authorName: string;
  onResolved: (id: string) => void;
}) {
  const router = useRouter();
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("community_recipes")
      .update({ status: "approved" })
      .eq("id", recipe.id);
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onResolved(recipe.id);
    router.refresh();
  };

  const reject = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    // Scrub the content rather than deleting the row outright, so the
    // submitter still sees a "Not approved" status instead of their
    // submission just vanishing - this is how spam gets cleared out while
    // still leaving something to show them.
    const { error: updateError } = await supabase
      .from("community_recipes")
      .update({
        status: "rejected",
        title: "Removed",
        description: null,
        ingredients: "",
        instructions: "",
        cuisine: null,
        time_minutes: null,
      })
      .eq("id", recipe.id);
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onResolved(recipe.id);
    router.refresh();
  };

  return (
    <div style={cardStyle}>
      <RecipeMeta recipe={recipe} authorName={authorName} />
      {recipe.description && <p style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>{recipe.description}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Ingredients
          </span>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", color: "var(--ink)" }}>{recipe.ingredients}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Instructions
          </span>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", color: "var(--ink)" }}>{recipe.instructions}</p>
        </div>
      </div>

      {error && <p style={{ margin: 0, fontSize: 14, color: "#B3261E" }}>{error}</p>}

      {confirmingReject ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#B3261E" }}>
            Reject and clear this submission&rsquo;s content?
          </span>
          <button type="button" onClick={reject} disabled={busy} style={primaryButtonStyle(true)}>
            {busy ? "Working…" : "Yes, reject"}
          </button>
          <button type="button" onClick={() => setConfirmingReject(false)} disabled={busy} style={ghostButtonStyle}>
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={approve} disabled={busy} style={primaryButtonStyle(false)}>
            {busy ? "Working…" : "Approve"}
          </button>
          <button type="button" onClick={() => setConfirmingReject(true)} disabled={busy} style={ghostButtonStyle}>
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

function EditCard({
  recipe,
  authorName,
  onResolved,
}: {
  recipe: CommunityRecipe;
  authorName: string;
  onResolved: (id: string) => void;
}) {
  const router = useRouter();
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("community_recipes")
      .update({
        title: recipe.pending_title,
        description: recipe.pending_description,
        ingredients: recipe.pending_ingredients,
        instructions: recipe.pending_instructions,
        cuisine: recipe.pending_cuisine,
        time_minutes: recipe.pending_time_minutes,
        pending_title: null,
        pending_description: null,
        pending_ingredients: null,
        pending_instructions: null,
        pending_cuisine: null,
        pending_time_minutes: null,
        has_pending_edit: false,
      })
      .eq("id", recipe.id);
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onResolved(recipe.id);
    router.refresh();
  };

  const reject = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    // Just discards the proposed draft - the live, published recipe is
    // untouched and stays up exactly as it was.
    const { error: updateError } = await supabase
      .from("community_recipes")
      .update({
        pending_title: null,
        pending_description: null,
        pending_ingredients: null,
        pending_instructions: null,
        pending_cuisine: null,
        pending_time_minutes: null,
        has_pending_edit: false,
      })
      .eq("id", recipe.id);
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onResolved(recipe.id);
    router.refresh();
  };

  return (
    <div style={cardStyle}>
      <RecipeMeta recipe={recipe} authorName={authorName} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {diffRow("Title", recipe.title, recipe.pending_title ?? "")}
        {diffRow("Description", recipe.description ?? "", recipe.pending_description ?? "")}
        {diffRow(
          "Cuisine / time",
          [recipe.cuisine, recipe.time_minutes ? `${recipe.time_minutes} min` : null].filter(Boolean).join(" · "),
          [recipe.pending_cuisine, recipe.pending_time_minutes ? `${recipe.pending_time_minutes} min` : null]
            .filter(Boolean)
            .join(" · ")
        )}
        {diffRow("Ingredients", recipe.ingredients, recipe.pending_ingredients ?? "")}
        {diffRow("Instructions", recipe.instructions, recipe.pending_instructions ?? "")}
      </div>

      {error && <p style={{ margin: 0, fontSize: 14, color: "#B3261E" }}>{error}</p>}

      {confirmingReject ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#B3261E" }}>Discard this proposed edit?</span>
          <button type="button" onClick={reject} disabled={busy} style={primaryButtonStyle(true)}>
            {busy ? "Working…" : "Yes, discard"}
          </button>
          <button type="button" onClick={() => setConfirmingReject(false)} disabled={busy} style={ghostButtonStyle}>
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={approve} disabled={busy} style={primaryButtonStyle(false)}>
            {busy ? "Working…" : "Approve edit"}
          </button>
          <button type="button" onClick={() => setConfirmingReject(true)} disabled={busy} style={ghostButtonStyle}>
            Reject edit
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminReviewClient({
  initialPendingSubmissions,
  initialPendingEdits,
  authorNames,
}: {
  initialPendingSubmissions: CommunityRecipe[];
  initialPendingEdits: CommunityRecipe[];
  authorNames: Record<string, string>;
}) {
  const [submissions, setSubmissions] = useState(initialPendingSubmissions);
  const [edits, setEdits] = useState(initialPendingEdits);

  const resolveSubmission = (id: string) => setSubmissions((prev) => prev.filter((r) => r.id !== id));
  const resolveEdit = (id: string) => setEdits((prev) => prev.filter((r) => r.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionTitleStyle}>New submissions {submissions.length > 0 && `(${submissions.length})`}</h2>
        {submissions.length === 0 ? (
          <p style={{ margin: 0, fontSize: 15, color: "var(--muted)" }}>Nothing waiting on review.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {submissions.map((r) => (
              <SubmissionCard
                key={r.id}
                recipe={r}
                authorName={authorNames[r.user_id] ?? "Someone"}
                onResolved={resolveSubmission}
              />
            ))}
          </div>
        )}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionTitleStyle}>Edits to live recipes {edits.length > 0 && `(${edits.length})`}</h2>
        {edits.length === 0 ? (
          <p style={{ margin: 0, fontSize: 15, color: "var(--muted)" }}>Nothing waiting on review.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {edits.map((r) => (
              <EditCard key={r.id} recipe={r} authorName={authorNames[r.user_id] ?? "Someone"} onResolved={resolveEdit} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
