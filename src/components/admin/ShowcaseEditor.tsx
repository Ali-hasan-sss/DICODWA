"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import type { ShowcaseImage, ShowcaseSection } from "@/lib/types";

type DraftImage = ShowcaseImage & { file?: File | null };

type Props = {
  initial: ShowcaseSection;
};

const MAX_IMAGES = 8;

function emptyImage(): DraftImage {
  return {
    id: `frame-${Date.now().toString(36)}`,
    src: "",
    alt: { en: "", ar: "" },
    caption: { en: "", ar: "" },
    file: null,
  };
}

export function ShowcaseEditor({ initial }: Props) {
  const t = useTranslations("admin");
  const [section, setSection] = useState<ShowcaseSection>({
    kicker: { ...initial.kicker },
    title: { ...initial.title },
    text: { ...initial.text },
    images: [],
  });
  const [images, setImages] = useState<DraftImage[]>(
    initial.images.map((image) => ({ ...image, file: null }))
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function updateImage(id: string, patch: Partial<DraftImage>) {
    setImages((current) => current.map((image) => (image.id === id ? { ...image, ...patch } : image)));
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    setImages((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (images.some((image) => !image.src.trim() && !image.file)) {
      setStatus("needs_image");
      return;
    }
    if (images.some((image) => image.file && image.file.size > 8 * 1024 * 1024)) {
      setStatus("poster_too_large");
      return;
    }
    const data = new FormData();
    data.set(
      "showcase",
      JSON.stringify({
        ...section,
        images: images.map(({ file: _file, ...image }) => image),
      })
    );
    images.forEach((image) => {
      if (image.file) data.set(`image:${image.id}`, image.file);
    });
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/showcase", { method: "POST", body: data });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus(body.error || "error");
      return;
    }
    const saved = await res.json();
    const next = saved.showcase as ShowcaseSection;
    setSection({
      kicker: next.kicker,
      title: next.title,
      text: next.text,
      images: [],
    });
    setImages(next.images.map((image) => ({ ...image, file: null })));
    setStatus("saved");
  }

  function message(code: string) {
    if (code === "saved") return t("showcaseSaved");
    if (code === "needs_image") return t("showcaseNeedsImage");
    if (code === "poster_too_large") return t("heroPosterTooLarge");
    if (code === "bad_poster") return t("heroBadPoster");
    if (code === "bad_url") return t("heroBadUrl");
    return t("heroError");
  }

  return (
    <form className="admin-form" onSubmit={save}>
      <h2 className="admin-block-title">{t("showcaseTitle")}</h2>
      <p className="form-status">{t("showcaseHelp")}</p>
      <div className="grid-2">
        <input
          placeholder={t("showcaseKickerEn")}
          value={section.kicker.en}
          onChange={(e) => setSection({ ...section, kicker: { ...section.kicker, en: e.target.value } })}
        />
        <input
          placeholder={t("showcaseKickerAr")}
          value={section.kicker.ar}
          onChange={(e) => setSection({ ...section, kicker: { ...section.kicker, ar: e.target.value } })}
        />
        <input
          placeholder={t("showcaseTitleEn")}
          value={section.title.en}
          onChange={(e) => setSection({ ...section, title: { ...section.title, en: e.target.value } })}
        />
        <input
          placeholder={t("showcaseTitleAr")}
          value={section.title.ar}
          onChange={(e) => setSection({ ...section, title: { ...section.title, ar: e.target.value } })}
        />
      </div>
      <textarea
        rows={3}
        placeholder={t("showcaseTextEn")}
        value={section.text.en}
        onChange={(e) => setSection({ ...section, text: { ...section.text, en: e.target.value } })}
      />
      <textarea
        rows={3}
        placeholder={t("showcaseTextAr")}
        value={section.text.ar}
        onChange={(e) => setSection({ ...section, text: { ...section.text, ar: e.target.value } })}
      />

      {images.map((image, index) => (
        <fieldset key={image.id} className="slide-card">
          <legend>
            {t("showcaseImage")} {index + 1}
            {index === 0 ? ` — ${t("showcaseLead")}` : ""}
          </legend>
          {image.src && (
            <img className="showcase-admin-preview" src={image.src} alt="" />
          )}
          <label className="admin-file">
            {t("showcaseFile")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={(e) => updateImage(image.id, { file: e.target.files?.[0] || null })}
            />
          </label>
          <input
            placeholder={t("showcaseUrl")}
            value={image.src}
            onChange={(e) => updateImage(image.id, { src: e.target.value })}
          />
          <div className="grid-2">
            <input
              placeholder={t("showcaseAltEn")}
              value={image.alt.en}
              onChange={(e) => updateImage(image.id, { alt: { ...image.alt, en: e.target.value } })}
            />
            <input
              placeholder={t("showcaseAltAr")}
              value={image.alt.ar}
              onChange={(e) => updateImage(image.id, { alt: { ...image.alt, ar: e.target.value } })}
            />
            <input
              placeholder={t("showcaseCaptionEn")}
              value={image.caption.en}
              onChange={(e) =>
                updateImage(image.id, { caption: { ...image.caption, en: e.target.value } })
              }
            />
            <input
              placeholder={t("showcaseCaptionAr")}
              value={image.caption.ar}
              onChange={(e) =>
                updateImage(image.id, { caption: { ...image.caption, ar: e.target.value } })
              }
            />
          </div>
          <div className="showcase-admin-actions">
            <button type="button" className="btn-primary" onClick={() => move(index, -1)} disabled={index === 0}>
              {t("moveUp")}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => move(index, 1)}
              disabled={index === images.length - 1}
            >
              {t("moveDown")}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))}
            >
              {t("showcaseRemove")}
            </button>
          </div>
        </fieldset>
      ))}

      {images.length < MAX_IMAGES && (
        <button type="button" className="btn-primary" onClick={() => setImages((current) => [...current, emptyImage()])}>
          {t("showcaseAdd")}
        </button>
      )}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? t("heroUploading") : t("showcaseSave")}
      </button>
      {status && <p className="form-status">{message(status)}</p>}
    </form>
  );
}
