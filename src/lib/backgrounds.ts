import { isSafeMediaUrl } from "./hero-slides";
import type { SectionBackground, SectionId } from "./types";

export const SECTION_IDS: SectionId[] = [
  "hero",
  "about",
  "homeGallery",
  "contact",
  "gallery",
];

const DEFAULTS: Record<SectionId, Pick<SectionBackground, "image" | "overlayOpacity">> = {
  hero: { image: "", overlayOpacity: 72 },
  about: { image: "/images/parallax-bg-02.jpg", overlayOpacity: 50 },
  homeGallery: { image: "/images/parallax-bg-04.jpg", overlayOpacity: 62 },
  contact: { image: "/images/parallax-bg-05.jpg", overlayOpacity: 55 },
  gallery: { image: "/images/parallax-bg-03.jpg", overlayOpacity: 62 },
};

export function defaultBackgrounds(): SectionBackground[] {
  return SECTION_IDS.map((id) => ({
    id,
    video: "",
    image: DEFAULTS[id].image,
    poster: "",
    overlayColor: "#000000",
    overlayOpacity: DEFAULTS[id].overlayOpacity,
  }));
}

function hexColor(value: unknown): string {
  if (typeof value !== "string") return "#000000";
  const color = value.trim();
  return /^#([0-9a-fA-F]{6})$/.test(color) ? color.toLowerCase() : "#000000";
}

function opacity(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function media(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim().slice(0, 500);
  return url && isSafeMediaUrl(url) ? url : "";
}

export function normalizeBackgrounds(raw: unknown): SectionBackground[] {
  const stored = new Map<string, Partial<SectionBackground>>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const id = (item as SectionBackground).id;
      if (SECTION_IDS.includes(id)) stored.set(id, item as SectionBackground);
    }
  }
  return defaultBackgrounds().map((fallback) => {
    const source = stored.get(fallback.id);
    if (!source) return fallback;
    return {
      id: fallback.id,
      video: media(source.video),
      image: media(source.image) || (source.image === "" ? "" : fallback.image),
      poster: media(source.poster),
      overlayColor: hexColor(source.overlayColor),
      overlayOpacity: opacity(source.overlayOpacity, fallback.overlayOpacity),
    };
  });
}

export function hexToRgba(hex: string, alpha: number): string {
  const safe = hexColor(hex);
  const value = safe.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function flatOverlay(background: SectionBackground): string {
  return hexToRgba(background.overlayColor, background.overlayOpacity / 100);
}

export function heroScrim(background: SectionBackground): string {
  const strong = background.overlayOpacity / 100;
  return `linear-gradient(to top, ${hexToRgba(background.overlayColor, strong)} 0%, ${hexToRgba(background.overlayColor, strong * 0.28)} 46%, ${hexToRgba(background.overlayColor, strong * 0.4)} 100%)`;
}
