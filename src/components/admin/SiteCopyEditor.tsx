"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { copyLabel } from "@/lib/copy-labels";
import type { Locale, LocaleCopy, MessageTree } from "@/lib/types";

const sections = [
  "meta",
  "nav",
  "hero",
  "about",
  "gallery",
  "contact",
  "checkout",
  "footer",
  "legal",
] as const;

type Props = {
  initialCopy: LocaleCopy;
};

export function SiteCopyEditor({ initialCopy }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [copy, setCopy] = useState<LocaleCopy>(initialCopy);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function setField(lang: "en" | "ar", section: string, key: string, value: string) {
    setCopy((current) => {
      const sectionTree = current[lang][section];
      const fields =
        sectionTree && typeof sectionTree === "object" ? { ...sectionTree } : {};
      return {
        ...current,
        [lang]: {
          ...current[lang],
          [section]: { ...fields, [key]: value },
        },
      };
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copy),
    });
    setSaving(false);
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setCopy(await res.json());
    setStatus("saved");
  }

  const sectionTitle: Record<(typeof sections)[number], string> = {
    meta: t("sectionMeta"),
    nav: t("sectionNav"),
    hero: t("sectionHero"),
    about: t("sectionAbout"),
    gallery: t("sectionGallery"),
    contact: t("sectionContact"),
    checkout: t("sectionCheckout"),
    footer: t("sectionFooter"),
    legal: t("sectionLegal"),
  };

  return (
    <form className="admin-form" onSubmit={save}>
      <h2 className="admin-block-title">{t("textsTitle")}</h2>
      <p className="form-status">{t("textsHelp")}</p>
      <div className="copy-head">
        <span />
        <span>{t("english")}</span>
        <span>{t("arabic")}</span>
      </div>
      {sections.map((section) => {
        const enFields = copy.en[section];
        if (!enFields || typeof enFields === "string") return null;
        const keys = Object.keys(enFields);
        if (!keys.length) return null;
        return (
          <fieldset key={section} className="slide-card">
            <legend>{sectionTitle[section]}</legend>
            {keys.map((key) => {
              const enValue = String((enFields as MessageTree)[key] ?? "");
              const arSection = copy.ar[section];
              const arValue =
                arSection && typeof arSection === "object"
                  ? String((arSection as MessageTree)[key] ?? "")
                  : "";
              const long = enValue.length > 90 || arValue.length > 90;
              const path = `${section}.${key}`;
              return (
                <label key={path} className="copy-row">
                  <span>
                    {copyLabel(path, locale)}
                    {enValue.includes("{n}") && (
                      <small className="copy-token"> {t("keepToken")}</small>
                    )}
                  </span>
                  {long ? (
                    <textarea
                      rows={4}
                      value={enValue}
                      onChange={(e) => setField("en", section, key, e.target.value)}
                    />
                  ) : (
                    <input
                      value={enValue}
                      onChange={(e) => setField("en", section, key, e.target.value)}
                    />
                  )}
                  {long ? (
                    <textarea
                      rows={4}
                      value={arValue}
                      onChange={(e) => setField("ar", section, key, e.target.value)}
                    />
                  ) : (
                    <input
                      value={arValue}
                      onChange={(e) => setField("ar", section, key, e.target.value)}
                    />
                  )}
                </label>
              );
            })}
          </fieldset>
        );
      })}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? t("heroUploading") : t("textsSave")}
      </button>
      {status && (
        <p className={`form-status ${status === "saved" ? "ok" : "err"}`}>
          {status === "saved" ? t("textsSaved") : t("textsError")}
        </p>
      )}
    </form>
  );
}
