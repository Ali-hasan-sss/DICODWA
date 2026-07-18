import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArtworkGrid } from "@/components/ArtworkGrid";
import { getArtworks } from "@/lib/store";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "gallery" });
  const artworks = await getArtworks();

  return (
    <section className="parallax-section" data-motion="gallery" style={{ minHeight: "auto" }}>
      <div
        className="parallax-bg"
        data-speed="0.4"
        style={{ backgroundImage: "url('/images/parallax-bg-03.jpg')" }}
      />
      <div className="parallax-overlay overlay-dark" />
      <div className="section-content" style={{ paddingTop: 140 }}>
        <h1 className="section-title" data-reveal="title" data-delay="0">
          {t("title")}
        </h1>
        <p className="section-subtitle" data-reveal="fade-up" data-delay="1">
          {t("subtitle")}
        </p>
        <ArtworkGrid artworks={artworks} />
      </div>
    </section>
  );
}
