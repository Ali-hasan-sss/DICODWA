import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <div className="legal-page" data-motion="legal">
      <div className="legal-inner">
        <p className="detail-back" data-reveal="fade-up" data-delay="0">
          <Link href="/" className="btn-primary">
            {t("backHome")}
          </Link>
        </p>
        <h1 className="section-title" data-reveal="title" data-delay="1">
          {t("termsTitle")}
        </h1>
        <div className="legal-body" data-reveal="fade-up" data-delay="2">
          <p>{t("termsIntro")}</p>
          <h2>{t("termsArtworksTitle")}</h2>
          <p>{t("termsArtworks")}</p>
          <h2>{t("termsOrdersTitle")}</h2>
          <p>{t("termsOrders")}</p>
          <h2>{t("termsIpTitle")}</h2>
          <p>{t("termsIp")}</p>
          <h2>{t("termsContactTitle")}</h2>
          <p>{t("termsContact")}</p>
        </div>
      </div>
    </div>
  );
}
