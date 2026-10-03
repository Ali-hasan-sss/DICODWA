"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import type { SectionBackground, SectionId } from "@/lib/types";

type Draft = SectionBackground & {
  videoFile?: File | null;
  imageFile?: File | null;
  posterFile?: File | null;
};

const labels: Record<SectionId, "bgHero" | "bgAbout" | "bgHomeGallery" | "bgContact" | "bgGallery"> = {
  hero: "bgHero",
  about: "bgAbout",
  homeGallery: "bgHomeGallery",
  contact: "bgContact",
  gallery: "bgGallery",
};

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
      <h2 style={{ letterSpacing: 2, color: "var(--gold-light)" }}>{t("backgroundsTitle")}</h2>
      <p className="form-status">{t("backgroundsHelp")}</p>
      {sections.map((section) => (
        <fieldset key={section.id} className="slide-card">
          <legend>{t(labels[section.id])}</legend>
          {section.id === "hero" ? (
            <p className="form-status">{t("bgHeroNote")}</p>
          ) : (
            <>
              {section.video ? (
                <video
                  className="hero-admin-preview-video"
                  src={section.video}
                  poster={section.poster || section.image || undefined}
                  muted
                  playsInline
                  controls
                />
              ) : section.image ? (
                <img className="hero-admin-preview-video" src={section.image} alt="" />
              ) : null}
              <label className="admin-file">
                {t("heroVideo")}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  onChange={(e) => update(section.id, { videoFile: e.target.files?.[0] || null })}
                />
              </label>
              <input
                placeholder={t("heroVideoUrl")}
                value={section.video}
                onChange={(e) => update(section.id, { video: e.target.value })}
              />
              <label className="admin-file">
                {t("bgImage")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => update(section.id, { imageFile: e.target.files?.[0] || null })}
                />
              </label>
              <input
                placeholder={t("bgImageUrl")}
                value={section.image}
                onChange={(e) => update(section.id, { image: e.target.value })}
              />
              <label className="admin-file">
                {t("heroPoster")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => update(section.id, { posterFile: e.target.files?.[0] || null })}
                />
              </label>
              <input
                placeholder={t("heroPosterUrl")}
                value={section.poster}
                onChange={(e) => update(section.id, { poster: e.target.value })}
              />
            </>
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
      ))}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? t("heroUploading") : t("backgroundsSave")}
      </button>
      {status && (
        <p className={`form-status ${status === "saved" ? "ok" : "err"}`}>{message(status)}</p>
      )}
    </form>
  );
}
