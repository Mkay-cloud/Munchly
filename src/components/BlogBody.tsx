import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/sanity/image";

type BodyImageValue = {
  alt?: string;
  originalPath?: string;
  [key: string]: unknown;
};

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: BodyImageValue }) => {
      // Prefer the original /wp-content/uploads/... path (served by our own
      // proxy route) so in-article image paths stay identical to the source
      // site. Only fall back to the raw Sanity CDN URL for posts imported
      // before that path was captured.
      const url = value.originalPath || urlFor(value).width(1000).fit("max").url();
      return (
        <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", borderRadius: 18, overflow: "hidden", margin: "8px 0" }}>
          <Image src={url} alt={value.alt || ""} fill sizes="800px" style={{ objectFit: "cover" }} />
        </div>
      );
    },
  },
  block: {
    normal: ({ children }) => (
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--ink-2)" }}>{children}</p>
    ),
    h2: ({ children }) => (
      <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ margin: "8px 0 0", fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 20 }}>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ margin: "8px 0 0", fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 18 }}>{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          margin: 0,
          padding: "12px 18px",
          borderLeft: "4px solid var(--primary)",
          background: "var(--card)",
          borderRadius: "0 14px 14px 0",
          fontSize: 16,
          fontStyle: "italic",
          color: "var(--ink-2)",
        }}
      >
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)" }}>{children}</li>,
    number: ({ children }) => <li style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)" }}>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong style={{ fontWeight: 700, color: "var(--ink)" }}>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a href={value?.href} style={{ color: "var(--primary)", textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
};

export default function BlogBody({ value }: { value: unknown[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PortableText value={value as never} components={components} />
    </div>
  );
}
