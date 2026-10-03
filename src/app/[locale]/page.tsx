import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArtworkGrid } from "@/components/ArtworkGrid";
import { ContactForm } from "@/components/ContactForm";
import { HeroStage } from "@/components/HeroStage";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { heroScrim } from "@/lib/backgrounds";
import { getArtworks, getSiteSettings } from "@/lib/store";
import type { SectionBackground, SectionId } from "@/lib/types";

function withLocale(href: string, locale: string) {
  if (
    href.startsWith("/") &&
    !href.startsWith("/en") &&
    !href.startsWith("/ar") &&
    !href.startsWith("/api") &&
    !href.startsWith("/uploads") &&
    !href.startsWith("/images") &&
    !href.startsWith("/_next")
  ) {
    return `/${locale}${href}`;
  }
  return href;
}

function sectionBackground(
  backgrounds: SectionBackground[],
  id: SectionId
): SectionBackground {
  return (
    backgrounds.find((item) => item.id === id) || {
      id,
      video: "",
      image: "",
      poster: "",
      overlayColor: "#000000",
      overlayOpacity: 50,
    }
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
    icons: { icon: "/images/logo.png" },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const [artworks, site] = await Promise.all([
    getArtworks(),
    getSiteSettings(),
  ]);
  const featured = artworks.filter((a) => a.featured).length
    ? artworks.filter((a) => a.featured)
    : artworks;
  const lang = locale === "ar" ? "ar" : "en";
  const heroSlides = site.heroSlides.map((slide) => ({
    id: slide.id,
    video: slide.video,
    poster: slide.poster,
    title: slide.title[lang],
    subtitle: slide.subtitle[lang],
    buttons: slide.buttons
      .filter((button) => button.label[lang].trim() && button.href)
      .map((button) => ({
        label: button.label[lang],
        href: withLocale(button.href, locale),
      })),
  }));

  return (
    <>
      <HeroStage
        slides={heroSlides}
        muteLabel={t("hero.mute")}
        unmuteLabel={t("hero.unmute")}
        playLabel={t("hero.play")}
        prevLabel={t("hero.previous")}
        nextLabel={t("hero.next")}
        slideLabel={t.raw("hero.slide")}
        scrim={heroScrim(sectionBackground(site.backgrounds, "hero"))}
      />

      <section id="about" className="parallax-section home-block" data-motion="about">
        <SectionBackdrop background={sectionBackground(site.backgrounds, "about")} speed="0.45" />
        <div className="section-content">
          <h2 className="section-title" data-reveal="title" data-delay="0">
            {t("about.title")}
          </h2>
          <div className="about-cols">
            <div className="about-col" data-reveal="slide-start" data-delay="1">
              <div className="about-thumb-wide">
                <Image
                  src="/images/about-01.jpg"
                  alt={t("about.alt1")}
                  width={400}
                  height={200}
                />
              </div>
              <p>{t("about.p1")}</p>
              <p>{t("about.p2")}</p>
            </div>
            <div className="about-col" data-reveal="slide-end" data-delay="2">
              <div className="about-thumb-wide">
                <Image
                  src="/images/about-02.jpg"
                  alt={t("about.alt2")}
                  width={400}
                  height={200}
                />
              </div>
              <p>{t("about.p3")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="parallax-section home-block" data-motion="gallery">
        <SectionBackdrop background={sectionBackground(site.backgrounds, "homeGallery")} />
        <div className="section-content">
          <h2 className="section-title" data-reveal="title" data-delay="0">
            {t("gallery.title")}
          </h2>
          <p className="section-subtitle" data-reveal="fade-up" data-delay="1">
            {t("gallery.subtitle")}
          </p>
          <ArtworkGrid artworks={featured} limit={6} />
          <div style={{ marginTop: 40 }} data-reveal="fade-up" data-delay="4">
            <Link href="/gallery" className="btn-pill">
              {t("gallery.viewAll")}
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="parallax-section home-block" data-motion="contact">
        <SectionBackdrop background={sectionBackground(site.backgrounds, "contact")} />
        <div className="section-content">
          <h2 className="section-title" data-reveal="title" data-delay="0">
            {t("contact.title")}
          </h2>
          <p className="section-subtitle" data-reveal="fade-up" data-delay="1">
            {t("contact.subtitle")}
          </p>
          <div data-reveal="rise" data-delay="2">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
