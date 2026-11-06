"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import type { HeroSlide } from "@/lib/types";

type Draft = HeroSlide & {
  videoFile?: File | null;
  posterFile?: File | null;
};

type Props = {
  initialSlides: HeroSlide[];
};

function emptySlide(): Draft {
  return {
    id: `slide-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    video: "",
    poster: "",
    title: { en: "", ar: "" },
    subtitle: { en: "", ar: "" },
    buttons: [{ label: { en: "", ar: "" }, href: "#gallery" }],
    videoFile: null,
    posterFile: null,
  };
}

export function HeroSlidesEditor({ initialSlides }: Props) {
  const t = useTranslations("admin");
  const [slides, setSlides] = useState<Draft[]>(
    initialSlides.map((slide) => ({ ...slide, videoFile: null, posterFile: null }))
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function update(id: string, patch: Partial<Draft>) {
    setSlides((current) =>
      current.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide))
    );
  }

  function move(index: number, direction: -1 | 1) {
    setSlides((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const tooLarge = slides.some(
      (slide) => slide.videoFile && slide.videoFile.size > 80 * 1024 * 1024
    );
    if (tooLarge) {
      setStatus("too_large");
      return;
    }
    const data = new FormData();
    data.set(
      "slides",
      JSON.stringify(
        slides.map(({ videoFile: _video, posterFile: _poster, ...slide }) => slide)
      )
    );
    slides.forEach((slide) => {
      if (slide.videoFile) data.set(`video:${slide.id}`, slide.videoFile);
      if (slide.posterFile) data.set(`poster:${slide.id}`, slide.posterFile);
    });
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/hero", { method: "POST", body: data });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus(body.error || "error");
      return;
    }
    const saved = await res.json();
    setSlides(
      (saved.heroSlides || []).map((slide: HeroSlide) => ({
        ...slide,
        videoFile: null,
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
    if (code === "saved") return t("heroSaved");
    return t("heroError");
  }

  return (
    <form className="admin-form" onSubmit={save}>
      <h2 className="admin-block-title">{t("heroTitle")}</h2>
      <p className="form-status">{t("heroSlidesHelp")}</p>
      {slides.map((slide, index) => (
        <fieldset key={slide.id} className="slide-card">
          <legend>
            {t("slide")} {index + 1}
          </legend>
          {slide.video && (
            <video
              className="hero-admin-preview-video"
              src={slide.video}
              poster={slide.poster || undefined}
              muted
              playsInline
              controls
            />
          )}
          <div className="grid-2">
            <input
              placeholder={t("slideTitleEn")}
              value={slide.title.en}
              onChange={(e) =>
                update(slide.id, { title: { ...slide.title, en: e.target.value } })
              }
            />
            <input
              placeholder={t("slideTitleAr")}
              value={slide.title.ar}
              onChange={(e) =>
                update(slide.id, { title: { ...slide.title, ar: e.target.value } })
              }
            />
          </div>
          <div className="grid-2">
            <textarea
              placeholder={t("slideSubEn")}
              rows={2}
              value={slide.subtitle.en}
              onChange={(e) =>
                update(slide.id, { subtitle: { ...slide.subtitle, en: e.target.value } })
              }
            />
            <textarea
              placeholder={t("slideSubAr")}
              rows={2}
              value={slide.subtitle.ar}
              onChange={(e) =>
                update(slide.id, { subtitle: { ...slide.subtitle, ar: e.target.value } })
              }
            />
          </div>
          <label className="admin-file">
            {t("heroVideo")}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              onChange={(e) => update(slide.id, { videoFile: e.target.files?.[0] || null })}
            />
          </label>
          <input
            placeholder={t("heroVideoUrl")}
            value={slide.video}
            onChange={(e) => update(slide.id, { video: e.target.value })}
          />
          <label className="admin-file">
            {t("heroPoster")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={(e) => update(slide.id, { posterFile: e.target.files?.[0] || null })}
            />
          </label>
          <input
            placeholder={t("heroPosterUrl")}
            value={slide.poster}
            onChange={(e) => update(slide.id, { poster: e.target.value })}
          />
          <p className="form-status">{t("slideButtons")}</p>
          {slide.buttons.map((button, buttonIndex) => (
            <div key={`${slide.id}-btn-${buttonIndex}`} className="slide-button-row">
              <input
                placeholder={t("buttonLabelEn")}
                value={button.label.en}
                onChange={(e) => {
                  const buttons = slide.buttons.map((item, i) =>
                    i === buttonIndex
                      ? { ...item, label: { ...item.label, en: e.target.value } }
                      : item
                  );
                  update(slide.id, { buttons });
                }}
              />
              <input
                placeholder={t("buttonLabelAr")}
                value={button.label.ar}
                onChange={(e) => {
                  const buttons = slide.buttons.map((item, i) =>
                    i === buttonIndex
                      ? { ...item, label: { ...item.label, ar: e.target.value } }
                      : item
                  );
                  update(slide.id, { buttons });
                }}
              />
              <input
                placeholder={t("buttonHref")}
                value={button.href}
                onChange={(e) => {
                  const buttons = slide.buttons.map((item, i) =>
                    i === buttonIndex ? { ...item, href: e.target.value } : item
                  );
                  update(slide.id, { buttons });
                }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  update(slide.id, {
                    buttons: slide.buttons.filter((_, i) => i !== buttonIndex),
                  })
                }
              >
                {t("removeButton")}
              </button>
            </div>
          ))}
          {slide.buttons.length < 4 && (
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                update(slide.id, {
                  buttons: [...slide.buttons, { label: { en: "", ar: "" }, href: "#" }],
                })
              }
            >
              {t("addButton")}
            </button>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn-primary" onClick={() => move(index, -1)}>
              {t("moveUp")}
            </button>
            <button type="button" className="btn-primary" onClick={() => move(index, 1)}>
              {t("moveDown")}
            </button>
            {slides.length > 1 && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSlides((current) => current.filter((item) => item.id !== slide.id))}
              >
                {t("removeSlide")}
              </button>
            )}
          </div>
        </fieldset>
      ))}
      {slides.length < 8 && (
        <button type="button" className="btn-primary" onClick={() => setSlides((current) => [...current, emptySlide()])}>
          {t("addSlide")}
        </button>
      )}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? t("heroUploading") : t("heroSave")}
      </button>
      {status && (
        <p className={`form-status ${status === "saved" ? "ok" : "err"}`}>{message(status)}</p>
      )}
    </form>
  );
}
