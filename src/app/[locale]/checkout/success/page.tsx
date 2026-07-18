import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <div className="checkout-status">
      <div>
        <h1>{t("successTitle")}</h1>
        <p style={{ color: "var(--white-70)", marginBottom: 32 }}>
          {t("successMessage")}
        </p>
        <Link href="/" className="btn-primary">
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
