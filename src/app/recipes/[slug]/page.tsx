import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeBySlug } from "@/sanity/queries";

export const revalidate = 60;

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--nav-bg)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "12px 20px" }}>
          <Link href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to Munchly
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        {recipe.imageUrl && (
          <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", borderRadius: 28, overflow: "hidden", border: "1px solid var(--border)" }}>
            <Image src={recipe.imageUrl} alt={recipe.title} fill sizes="800px" style={{ objectFit: "cover" }} priority />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
            }}
          >
            {recipe.title}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {[recipe.cuisine, recipe.timeMinutes ? `${recipe.timeMinutes} min` : null, recipe.note]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {recipe.ingredients?.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>Ingredients</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  style={{
                    padding: "12px 16px",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    fontSize: 15,
                  }}
                >
                  {ing}
                </li>
              ))}
            </ul>
          </section>
        )}

        {recipe.instructions?.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>Instructions</h2>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {recipe.instructions.map((block, i) => {
                const text = block.children?.map((c) => c.text).join("") ?? "";
                return (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span
                      style={{
                        flex: "none",
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--primary)",
                        color: "#FBF8F2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)", paddingTop: 2 }}>{text}</p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}
