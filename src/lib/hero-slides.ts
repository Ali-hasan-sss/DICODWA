import type { HeroButton, HeroSlide, LocalizedString } from "./types";

export const DEFAULT_HERO_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const MAX_SLIDES = 8;
const MAX_BUTTONS = 4;

export function defaultHeroSlides(): HeroSlide[] {
  return [
    {
      id: "slide-default",
      video: DEFAULT_HERO_VIDEO,
      poster: "",
      title: { en: "DICODWA", ar: "ديكودوا" },
      subtitle: {
        en: "Decorative Pieces & More by DeemaW Ali",
        ar: "قطع ديكور والمزيد — بإبداع ديما علي",
      },
      buttons: [
        {
          label: { en: "Explore Gallery", ar: "استكشف المعرض" },
          href: "#gallery",
        },
        {
          label: { en: "About Us", ar: "من نحن" },
          href: "#about",
        },
      ],
    },
  ];
}

export function isSafeMediaUrl(value: string): boolean {
  if (
    value.startsWith("/uploads/hero/") ||
    value.startsWith("/uploads/backgrounds/") ||
    value.startsWith("/images/")
  ) {
    return !value.includes("..");
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafeHref(value: string): boolean {
  const href = value.trim();
  if (!href || href.length > 300) return false;
  const lower = href.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) return false;
  if (href.startsWith("#") || href.startsWith("/")) return !href.includes("..");
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").slice(0, max);
}

function pair(value: unknown, max: number): LocalizedString {
  const source = value && typeof value === "object" ? (value as LocalizedString) : { en: "", ar: "" };
  return { en: text(source.en, max), ar: text(source.ar, max) };
}

function button(value: unknown): HeroButton | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as HeroButton;
  const href = text(raw.href, 300);
  if (!isSafeHref(href)) return null;
  return { label: pair(raw.label, 80), href };
}

export function sanitizeSlides(raw: unknown): HeroSlide[] {
  if (!Array.isArray(raw)) return defaultHeroSlides();
  const slides: HeroSlide[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const source = item as Partial<HeroSlide>;
    const id = text(source.id, 40).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!id) continue;
    const video = text(source.video, 500);
    const poster = text(source.poster, 500);
    const buttons = Array.isArray(source.buttons)
      ? source.buttons.map(button).filter((entry): entry is HeroButton => !!entry).slice(0, MAX_BUTTONS)
      : [];
    slides.push({
      id,
      video: video && isSafeMediaUrl(video) ? video : "",
      poster: poster && isSafeMediaUrl(poster) ? poster : "",
      title: pair(source.title, 160),
      subtitle: pair(source.subtitle, 400),
      buttons,
    });
    if (slides.length >= MAX_SLIDES) break;
  }
  return slides.length ? slides : defaultHeroSlides();
}

type LegacySite = {
  heroSlides?: unknown;
  heroVideo?: string;
  heroPoster?: string;
};

export function normalizeSlides(data: LegacySite | null | undefined): HeroSlide[] {
  const slides = sanitizeSlides(data?.heroSlides);
  const hasStoredSlides = Array.isArray(data?.heroSlides) && data.heroSlides.length > 0;
  if (hasStoredSlides) return slides;
  const legacyVideo = text(data?.heroVideo, 500);
  if (legacyVideo && isSafeMediaUrl(legacyVideo)) {
    const legacyPoster = text(data?.heroPoster, 500);
    return [
      {
        ...defaultHeroSlides()[0],
        video: legacyVideo,
        poster: legacyPoster && isSafeMediaUrl(legacyPoster) ? legacyPoster : "",
      },
    ];
  }
  return defaultHeroSlides();
}
