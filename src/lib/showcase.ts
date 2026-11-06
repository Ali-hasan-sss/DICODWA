import { isSafeMediaUrl } from "./hero-slides";
import type { LocalizedString, ShowcaseImage, ShowcaseSection } from "./types";

const MAX_IMAGES = 8;

export function defaultShowcase(): ShowcaseSection {
  return {
    kicker: { en: "In the studio", ar: "داخل الاستوديو" },
    title: { en: "Frames", ar: "لقطات" },
    text: {
      en: "A closer look at the work, the materials, and the room they were made in.",
      ar: "نظرة أقرب على العمل والخامات والمكان الذي صُنع فيه.",
    },
    images: [
      frame("frame-studio", "/images/about-01.jpg", "Studio", "الاستوديو"),
      frame("frame-process", "/images/about-02.jpg", "Process", "تفاصيل العمل"),
      frame("frame-light", "/images/parallax-bg-01.jpg", "Light", "الضوء"),
      frame("frame-surface", "/images/parallax-bg-03.jpg", "Surface", "السطح"),
    ],
  };
}

function frame(id: string, src: string, en: string, ar: string): ShowcaseImage {
  return {
    id,
    src,
    alt: { en, ar },
    caption: { en: "", ar: "" },
  };
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

function pair(value: unknown, max: number): LocalizedString {
  const source = value && typeof value === "object" ? (value as LocalizedString) : { en: "", ar: "" };
  return { en: text(source.en, max), ar: text(source.ar, max) };
}

function image(value: unknown): ShowcaseImage | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as ShowcaseImage;
  const src = text(raw.src, 500);
  if (!src || !isSafeMediaUrl(src)) return null;
  const id = text(raw.id, 40).replace(/[^\w-]/g, "") || `frame-${src.length}`;
  return {
    id,
    src,
    alt: pair(raw.alt, 120),
    caption: pair(raw.caption, 180),
  };
}

export function normalizeShowcase(raw: unknown): ShowcaseSection {
  if (!raw || typeof raw !== "object") return defaultShowcase();
  const source = raw as Partial<ShowcaseSection>;
  const images = Array.isArray(source.images)
    ? source.images.map(image).filter((item): item is ShowcaseImage => !!item).slice(0, MAX_IMAGES)
    : [];
  return {
    kicker: pair(source.kicker, 40),
    title: pair(source.title, 80),
    text: pair(source.text, 280),
    images,
  };
}
