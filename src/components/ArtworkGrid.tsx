"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Artwork } from "@/lib/types";
import { BuyButton } from "./BuyButton";

type Props = {
  artworks: Artwork[];
  limit?: number;
  layout?: "grid" | "editorial";
};

export function ArtworkGrid({ artworks, limit, layout = "grid" }: Props) {
  const t = useTranslations("gallery");
  const locale = useLocale() as "en" | "ar";
  const items = limit ? artworks.slice(0, limit) : artworks;

  if (items.length === 0) {
    return <p className="section-subtitle">{t("empty")}</p>;
  }

  return (
    <div className={`gallery-grid${layout === "editorial" ? " gallery-editorial" : ""}`}>
      {items.map((art, index) => (
        <article
          key={art.id}
          className="artwork-card"
          data-reveal="card"
          data-delay={String(Math.min(index + 2, 8))}
        >
          <Link href={`/gallery/${art.id}`} className="artwork-card-media">
            <div className="artwork-card-image">
              <Image
                src={art.image}
                alt=""
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              <span
                className={`artwork-badge ${art.status === "sold" ? "sold" : ""}`}
              >
                {art.status === "sold" ? t("sold") : t("available")}
              </span>
            </div>
            <div className="artwork-card-body">
              <h3>{art.title[locale]}</h3>
              <p className="artwork-meta">
                {art.medium[locale]} · {art.dimensions}
              </p>
              <p className="artwork-price">
                ${art.price} {t("currency")}
              </p>
            </div>
          </Link>
          {art.status === "available" && (
            <div className="artwork-actions">
              <BuyButton artworkId={art.id} className="btn-buy" />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
