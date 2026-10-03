import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isSafeHref, isSafeMediaUrl, sanitizeSlides } from "@/lib/hero-slides";
import { getSiteSettings, saveSiteSettings } from "@/lib/store";
import type { HeroSlide } from "@/lib/types";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const MAX_POSTER_BYTES = 8 * 1024 * 1024;

const VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const POSTER_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function extFromName(filename: string, allowed: string[]): string | null {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return allowed.includes(ext) ? ext : null;
}

function localHeroFile(urlPath: string): string | null {
  if (!urlPath.startsWith("/uploads/hero/") || urlPath.includes("..")) return null;
  return path.join(process.cwd(), "public", "uploads", "hero", path.basename(urlPath));
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  let parsed: unknown = [];
  try {
    parsed = JSON.parse(String(form.get("slides") || "[]"));
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const slide = item as { video?: unknown; poster?: unknown; buttons?: { href?: unknown }[] };
      if (slide.video && !isSafeMediaUrl(String(slide.video))) {
        return NextResponse.json({ error: "bad_url" }, { status: 400 });
      }
      if (slide.poster && !isSafeMediaUrl(String(slide.poster))) {
        return NextResponse.json({ error: "bad_url" }, { status: 400 });
      }
      if (Array.isArray(slide.buttons)) {
        for (const button of slide.buttons) {
          if (button?.href && !isSafeHref(String(button.href))) {
            return NextResponse.json({ error: "bad_url" }, { status: 400 });
          }
        }
      }
    }
  }

  const slides = sanitizeSlides(parsed);
  const dir = path.join(process.cwd(), "public", "uploads", "hero");
  await fs.mkdir(dir, { recursive: true });

  for (const slide of slides) {
    const video = form.get(`video:${slide.id}`);
    const poster = form.get(`poster:${slide.id}`);
    const videoUrl = String(form.get(`videoUrl:${slide.id}`) || "").trim();
    const posterUrl = String(form.get(`posterUrl:${slide.id}`) || "").trim();

    if (video instanceof File && video.size > 0) {
      const ext =
        VIDEO_EXT[video.type] || extFromName(video.name, ["mp4", "webm", "mov"]);
      if (!ext) return NextResponse.json({ error: "bad_type" }, { status: 400 });
      if (video.size > MAX_VIDEO_BYTES) {
        return NextResponse.json({ error: "too_large" }, { status: 400 });
      }
      const name = `hero-video-${slide.id}-${Date.now()}.${ext}`;
      await fs.writeFile(path.join(dir, name), Buffer.from(await video.arrayBuffer()));
      slide.video = `/uploads/hero/${name}`;
    } else if (videoUrl) {
      if (!isSafeMediaUrl(videoUrl)) {
        return NextResponse.json({ error: "bad_url" }, { status: 400 });
      }
      slide.video = videoUrl;
    }

    if (poster instanceof File && poster.size > 0) {
      const ext =
        POSTER_EXT[poster.type] ||
        extFromName(poster.name, ["jpg", "jpeg", "png", "webp"]);
      if (!ext) return NextResponse.json({ error: "bad_poster" }, { status: 400 });
      if (poster.size > MAX_POSTER_BYTES) {
        return NextResponse.json({ error: "poster_too_large" }, { status: 400 });
      }
      const storedExt = ext === "jpeg" ? "jpg" : ext;
      const name = `hero-poster-${slide.id}-${Date.now()}.${storedExt}`;
      await fs.writeFile(path.join(dir, name), Buffer.from(await poster.arrayBuffer()));
      slide.poster = `/uploads/hero/${name}`;
    } else if (posterUrl) {
      if (!isSafeMediaUrl(posterUrl)) {
        return NextResponse.json({ error: "bad_url" }, { status: 400 });
      }
      slide.poster = posterUrl;
    }
  }

  const previous = await getSiteSettings();
  await saveSiteSettings({ ...previous, heroSlides: slides });
  await removeOrphans(dir, slides, previous.heroSlides);

  return NextResponse.json({ heroSlides: slides });
}

async function removeOrphans(dir: string, slides: HeroSlide[], previous: HeroSlide[]) {
  const keep = new Set<string>();
  for (const slide of slides) {
    for (const url of [slide.video, slide.poster]) {
      if (url.startsWith("/uploads/hero/")) keep.add(path.basename(url));
    }
  }
  const owned = new Set<string>();
  for (const slide of previous) {
    for (const url of [slide.video, slide.poster]) {
      const file = localHeroFile(url);
      if (file) owned.add(path.basename(file));
    }
  }
  for (const name of owned) {
    if (keep.has(name)) continue;
    await fs.unlink(path.join(dir, name)).catch(() => {});
  }
}
