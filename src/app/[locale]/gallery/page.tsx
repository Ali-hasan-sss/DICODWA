import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArtworkGrid } from "@/components/ArtworkGrid";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { getArtworks, getSiteSettings } from "@/lib/store";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "gallery" });
  const [artworks, site] = await Promise.all([getArtworks(), getSiteSettings()]);
  const background =
    site.backgrounds.find((item) => item.id === "gallery") || site.backgrounds[0];

  return (
    <section className="parallax-section" data-motion="gallery" style={{ minHeight: "auto" }}>
      <SectionBackdrop background={background} speed="0.4" />
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
