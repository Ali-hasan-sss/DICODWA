import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "en" | "ar")) {
    locale = routing.defaultLocale;
  }

  const safeLocale = locale === "ar" ? "ar" : "en";
  const messages = (await import(`../../messages/${safeLocale}.json`)).default;

  if (process.env.NEXT_RUNTIME === "edge") {
    return { locale: safeLocale, messages };
  }

  const { getLocaleMessages } = await import("@/lib/content");
  return {
    locale: safeLocale,
    messages: await getLocaleMessages(safeLocale),
  };
});
