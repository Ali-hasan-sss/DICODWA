import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: Props) {
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
          {t("privacyTitle")}
        </h1>
        <div className="legal-body" data-reveal="fade-up" data-delay="2">
          <p>{t("privacyIntro")}</p>
          <h2>{t("privacyCollectTitle")}</h2>
          <p>{t("privacyCollect")}</p>
          <h2>{t("privacyUseTitle")}</h2>
          <p>{t("privacyUse")}</p>
          <h2>{t("privacyShareTitle")}</h2>
          <p>{t("privacyShare")}</p>
          <h2>{t("privacyContactTitle")}</h2>
          <p>{t("privacyContact")}</p>
        </div>
      </div>
    </div>
  );
}
