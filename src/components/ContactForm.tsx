"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-form-wrap">
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="form-row">
          <label className="field">
            <span>{t("name")}</span>
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label className="field">
            <span>{t("email")}</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
        </div>
        <label className="field">
          <span>{t("message")}</span>
          <textarea name="message" rows={5} required />
        </label>
        <button type="submit" className="btn-pill" disabled={loading}>
          {loading ? "..." : t("send")}
        </button>
        {status === "ok" && <p className="form-status ok">{t("success")}</p>}
        {status === "err" && <p className="form-status err">{t("error")}</p>}
      </form>
    </div>
  );
}
