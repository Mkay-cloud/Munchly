"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";
import { useTranslations } from "@/i18n/LocaleProvider";

const DEFAULT_AVATAR = "/panda-head.png";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

export default function ProfileClient({
  initialDisplayName,
  initialAvatarUrl,
}: {
  initialDisplayName: string;
  initialAvatarUrl: string | null;
}) {
  const t = useTranslations();
  const { session, loading: sessionLoading } = useSession();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickAvatar = () => fileInputRef.current?.click();

  const onAvatarChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-choosing the same file later
    if (!file || !session) return;
    setError(null);
    setSavedAt(null);

    if (!file.type.startsWith("image/")) {
      setError(t("profileForm.errorImageType"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError(t("profileForm.errorImageSize"));
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    // Fixed filename per user (not timestamped) so re-uploading replaces
    // the old file instead of leaving orphaned ones in storage.
    const path = `${session.user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust - the path (and therefore the public URL) doesn't change
    // between uploads, so without this the browser/CDN would keep showing
    // the old image.
    setAvatarUrl(`${data.publicUrl}?v=${Date.now()}`);
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError(t("profileForm.errorDisplayNameRequired"));
      return;
    }
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error: saveError } = await supabase
      .from("profiles")
      .upsert({ id: session.user.id, display_name: trimmed, avatar_url: avatarUrl });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSavedAt(Date.now());
  };

  if (sessionLoading || !session) {
    return <p style={{ color: "var(--muted)" }}>{t("profileForm.loading")}</p>;
  }

  return (
    <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 420 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={pickAvatar}
          disabled={uploading}
          aria-label={t("profileForm.changeAvatarAria")}
          style={{
            position: "relative",
            width: 88,
            height: 88,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid var(--border)",
            padding: 0,
            cursor: uploading ? "default" : "pointer",
            background: "var(--chip)",
            flexShrink: 0,
          }}
        >
          <Image
            src={avatarUrl || DEFAULT_AVATAR}
            alt=""
            fill
            sizes="88px"
            style={{ objectFit: "cover", opacity: uploading ? 0.5 : 1 }}
          />
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            type="button"
            onClick={pickAvatar}
            disabled={uploading}
            style={{
              padding: "9px 16px",
              borderRadius: 999,
              border: "1.5px solid var(--border)",
              background: "var(--card)",
              color: "var(--ink)",
              fontWeight: 600,
              fontSize: 14,
              cursor: uploading ? "default" : "pointer",
              opacity: uploading ? 0.7 : 1,
              alignSelf: "flex-start",
            }}
          >
            {uploading ? t("profileForm.uploading") : t("profileForm.changePhoto")}
          </button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{t("profileForm.photoHint")}</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onAvatarChosen}
          style={{ display: "none" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="displayName" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
          {t("profileForm.displayNameLabel")}
        </label>
        <input
          id="displayName"
          type="text"
          required
          maxLength={40}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t("profileForm.displayNamePlaceholder")}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1.5px solid var(--border-strong)",
            fontSize: 15,
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          {t("profileForm.displayNameHint")}
        </span>
      </div>

      {error && <p style={{ margin: 0, fontSize: 14, color: "#B3261E" }}>{error}</p>}
      {savedAt && !error && <p style={{ margin: 0, fontSize: 14, color: "var(--olive-text)" }}>{t("profileForm.savedMessage")}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        style={{
          padding: "13px 20px",
          borderRadius: 999,
          background: "var(--primary)",
          color: "#FBF8F2",
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: saving || uploading ? "default" : "pointer",
          opacity: saving || uploading ? 0.7 : 1,
          alignSelf: "flex-start",
        }}
      >
        {saving ? t("profileForm.saving") : t("profileForm.saveProfile")}
      </button>
    </form>
  );
}
