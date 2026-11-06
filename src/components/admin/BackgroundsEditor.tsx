"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import type { SectionBackground, SectionId } from "@/lib/types";

type Draft = SectionBackground & {
  videoFile?: File | null;
  imageFile?: File | null;
  posterFile?: File | null;
};

const labels: Record<
  SectionId,
  "bgHero" | "bgAbout" | "bgHomeGallery" | "bgContact" | "bgGallery" | "bgDetail"
> = {
  hero: "bgHero",
  about: "bgAbout",
  homeGallery: "bgHomeGallery",
  contact: "bgContact",
  gallery: "bgGallery",
  detail: "bgDetail",
};

function ImageIcon() {
  return (
    <svg className="bg-preview-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <path d="M6 17l4.2-4.2a1 1 0 0 1 1.4 0L17 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  initialBackgrounds: SectionBackground[];
};

export function BackgroundsEditor({ initialBackgrounds }: Props) {
  const t = useTranslations("admin");
  const [sections, setSections] = useState<Draft[]>(
    initialBackgrounds.map((section) => ({
      ...section,
      videoFile: null,
      imageFile: null,
      posterFile: null,
    }))
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function update(id: SectionId, patch: Partial<Draft>) {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, ...patch } : section))
    );
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (sections.some((section) => section.videoFile && section.videoFile.size > 80 * 1024 * 1024)) {
      setStatus("too_large");
      return;
    }
    const data = new FormData();
    data.set(
      "backgrounds",
      JSON.stringify(
        sections.map(({ videoFile: _video, imageFile: _image, posterFile: _poster, ...section }) => section)
      )
    );
    sections.forEach((section) => {
      if (section.videoFile) data.set(`video:${section.id}`, section.videoFile);
      if (section.imageFile) data.set(`image:${section.id}`, section.imageFile);
      if (section.posterFile) data.set(`poster:${section.id}`, section.posterFile);
    });
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/backgrounds", { method: "POST", body: data });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus(body.error || "error");
      return;
    }
    const saved = await res.json();
    setSections(
      (saved.backgrounds || []).map((section: SectionBackground) => ({
        ...section,
        videoFile: null,
        imageFile: null,
        posterFile: null,
      }))
    );
    setStatus("saved");
  }

  function message(code: string) {
    if (code === "too_large") return t("heroTooLarge");
    if (code === "bad_type") return t("heroBadType");
    if (code === "bad_poster") return t("heroBadPoster");
    if (code === "poster_too_large") return t("heroPosterTooLarge");
    if (code === "bad_url") return t("heroBadUrl");
    if (code === "saved") return t("backgroundsSaved");
    return t("heroError");
  }

  return (
    <form className="admin-form" onSubmit={save}>
      <h2 className="admin-block-title">{t("backgroundsTitle")}</h2>
      <p className="form-status">{t("backgroundsHelp")}</p>
      {sections.map((section) => {
        const preview = section.image || section.poster;
        return (
        <fieldset key={section.id} className="slide-card">
          <legend>{t(labels[section.id])}</legend>
          {section.id === "hero" ? (
            <p className="form-status">{t("bgHeroNote")}</p>
          ) : (
            <div className="bg-editor-row">
              <div className="bg-preview">
                {preview ? (
                  <img src={preview} alt="" />
                ) : (
                  <ImageIcon />
                )}
              </div>
              <div className="bg-fields">
              <label className="admin-file">
                <span>{t("bgImage")}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => update(section.id, { imageFile: e.target.files?.[0] || null })}
                />
              </label>
              <input
                aria-label={t("bgImageUrl")}
                placeholder={t("bgImageUrl")}
                value={section.image}
                onChange={(e) => update(section.id, { image: e.target.value })}
              />
              <label className="admin-file">
                <span>{t("heroVideo")}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  onChange={(e) => update(section.id, { videoFile: e.target.files?.[0] || null })}
                />
              </label>
              <input
                aria-label={t("heroVideoUrl")}
                placeholder={t("heroVideoUrl")}
                value={section.video}
                onChange={(e) => update(section.id, { video: e.target.value })}
              />
              <label className="admin-file">
                <span>{t("heroPoster")}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => update(section.id, { posterFile: e.target.files?.[0] || null })}
                />
              </label>
              <input
                aria-label={t("heroPosterUrl")}
                placeholder={t("heroPosterUrl")}
                value={section.poster}
                onChange={(e) => update(section.id, { poster: e.target.value })}
              />
              </div>
            </div>
          )}
          <div className="bg-controls">
            <label>
              {t("overlayColor")}
              <input
                type="color"
                value={section.overlayColor}
                onChange={(e) => update(section.id, { overlayColor: e.target.value })}
              />
            </label>
            <label className="bg-opacity">
              {t("overlayOpacity")}
              <input
                type="range"
                min={0}
                max={100}
                value={section.overlayOpacity}
                onChange={(e) => update(section.id, { overlayOpacity: Number(e.target.value) })}
              />
              <span>{section.overlayOpacity}%</span>
            </label>
          </div>
        </fieldset>
        );
      })}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? t("heroUploading") : t("backgroundsSave")}
      </button>
      {status && (
        <p className={`form-status ${status === "saved" ? "ok" : "err"}`}>{message(status)}</p>
      )}
    </form>
  );
}
