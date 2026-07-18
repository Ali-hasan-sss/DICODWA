"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  artworkId: string;
  className?: string;
};

export function BuyButton({ artworkId, className }: Props) {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={`btn-primary ${className || ""}`}
        onClick={handleBuy}
        disabled={loading}
      >
        {loading ? "..." : t("buy")}
      </button>
      {error && <p className="form-status err" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
