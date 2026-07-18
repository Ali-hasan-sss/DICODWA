import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArtworkGrid } from "@/components/ArtworkGrid";
import { ContactForm } from "@/components/ContactForm";
import { getArtworks } from "@/lib/store";

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
  const artworks = await getArtworks();
  const featured = artworks.filter((a) => a.featured).length
    ? artworks.filter((a) => a.featured)
    : artworks;

  return (
    <>
      <section id="home" className="parallax-section" data-motion="hero">
        <div
          className="parallax-bg"
          data-speed="0.5"
          style={{ backgroundImage: "url('/images/parallax-bg-01.jpg')" }}
        />
        <div className="parallax-overlay" />
        <div className="section-content">
          <div className="hero-brand" data-reveal="bloom" data-delay="0">
            <Image
              src="/images/logo.png"
              alt="DICODWA"
              width={280}
              height={280}
              priority
            />
          </div>
          <h1 className="section-title hero-title" data-reveal="title" data-delay="1">
            DICODWA
          </h1>
          <p className="section-subtitle" data-reveal="fade-up" data-delay="2">
            {t("hero.subtitle")}
          </p>
          <a href="#gallery" className="btn-primary" data-reveal="fade-up" data-delay="3">
            {t("hero.cta")}
          </a>
        </div>
      </section>

      <section id="about" className="parallax-section" data-motion="about">
        <div
          className="parallax-bg"
          data-speed="0.45"
          style={{ backgroundImage: "url('/images/parallax-bg-02.jpg')" }}
        />
        <div className="parallax-overlay" />
        <div className="section-content">
          <h2 className="section-title" data-reveal="title" data-delay="0">
            {t("about.title")}
          </h2>
          <div className="about-cols">
            <div className="about-col" data-reveal="slide-start" data-delay="1">
              <div className="about-thumb-wide">
                <Image
                  src="/images/about-01.jpg"
                  alt="DICODWA studio"
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
                  alt="Artwork process"
                  width={400}
                  height={200}
                />
              </div>
              <p>{t("about.p3")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="parallax-section" data-motion="gallery">
        <div
          className="parallax-bg"
          data-speed="0.5"
          style={{ backgroundImage: "url('/images/parallax-bg-04.jpg')" }}
        />
        <div className="parallax-overlay overlay-dark" />
        <div className="section-content">
          <h2 className="section-title" data-reveal="title" data-delay="0">
            {t("gallery.title")}
          </h2>
          <p className="section-subtitle" data-reveal="fade-up" data-delay="1">
            {t("gallery.subtitle")}
          </p>
          <ArtworkGrid artworks={featured} limit={6} />
          <div style={{ marginTop: 40 }} data-reveal="fade-up" data-delay="4">
            <Link href="/gallery" className="btn-primary">
              {t("gallery.viewAll")}
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="parallax-section" data-motion="contact">
        <div
          className="parallax-bg"
          data-speed="0.5"
          style={{ backgroundImage: "url('/images/parallax-bg-05.jpg')" }}
        />
        <div className="parallax-overlay overlay-medium" />
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
