import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArtworkMediaGallery } from "@/components/ArtworkMediaGallery";
import { BuyButton } from "@/components/BuyButton";
import { getArtworkMedia } from "@/lib/artwork-media";
import { getArtworkById } from "@/lib/store";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ArtworkDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const art = await getArtworkById(id);
  if (!art) notFound();

  const t = await getTranslations({ locale, namespace: "gallery" });
  const lang = locale === "ar" ? "ar" : "en";
  const media = getArtworkMedia(art);

  return (
    <div className="detail-page" data-motion="detail">
      <p className="detail-back" data-reveal="fade-up" data-delay="0">
        <Link href="/gallery" className="btn-primary">
          {t("back")}
        </Link>
      </p>
      <div className="detail-grid">
        <div data-reveal="slide-start" data-delay="1">
          <ArtworkMediaGallery media={media} alt={art.title[lang]} />
        </div>
        <div className="detail-info" data-reveal="slide-end" data-delay="2">
          <h1>{art.title[lang]}</h1>
          <p>{art.description[lang]}</p>
          <ul className="detail-specs">
            <li>
              <span>{t("medium")}</span>
              <span>{art.medium[lang]}</span>
            </li>
            <li>
              <span>{t("dimensions")}</span>
              <span>{art.dimensions}</span>
            </li>
            <li>
              <span>{t("year")}</span>
              <span>{art.year}</span>
            </li>
            <li>
              <span>{t("price")}</span>
              <span>
                {art.status === "sold"
                  ? t("sold")
                  : `$${art.price} ${t("currency")}`}
              </span>
            </li>
          </ul>
          {art.status === "available" && (
            <>
              <p className="detail-price">
                ${art.price} {t("currency")}
              </p>
              <BuyButton artworkId={art.id} />
            </>
          )}
          {art.status === "sold" && (
            <p className="form-status err">{t("sold")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
