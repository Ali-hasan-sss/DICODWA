import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { normalizeBackgrounds } from "@/lib/backgrounds";
import { isSafeMediaUrl } from "@/lib/hero-slides";
import { getSiteSettings, saveSiteSettings } from "@/lib/store";
import type { SectionBackground } from "@/lib/types";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function extFromName(filename: string, allowed: string[]): string | null {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return allowed.includes(ext) ? ext : null;
}

async function storeFile(file: File, dir: string, prefix: string, kind: "video" | "image") {
  const map = kind === "video" ? VIDEO_EXT : IMAGE_EXT;
  const allowed = kind === "video" ? ["mp4", "webm", "mov"] : ["jpg", "jpeg", "png", "webp"];
  const max = kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const ext = map[file.type] || extFromName(file.name, allowed);
  if (!ext) return { error: kind === "video" ? "bad_type" : "bad_poster" } as const;
  if (file.size > max) {
    return { error: kind === "video" ? "too_large" : "poster_too_large" } as const;
  }
  const storedExt = ext === "jpeg" ? "jpg" : ext;
  const name = `${prefix}-${Date.now()}.${storedExt}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/backgrounds/${name}` } as const;
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(form.get("backgrounds") || "[]"));
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const row = item as SectionBackground;
      for (const field of [row.video, row.image, row.poster]) {
        if (field && !isSafeMediaUrl(String(field))) {
          return NextResponse.json({ error: "bad_url" }, { status: 400 });
        }
      }
    }
  }

  const backgrounds = normalizeBackgrounds(parsed);
  const dir = path.join(process.cwd(), "public", "uploads", "backgrounds");
  await fs.mkdir(dir, { recursive: true });

  for (const section of backgrounds) {
    const video = form.get(`video:${section.id}`);
    const image = form.get(`image:${section.id}`);
    const poster = form.get(`poster:${section.id}`);

    if (video instanceof File && video.size > 0) {
      const stored = await storeFile(video, dir, `bg-video-${section.id}`, "video");
      if ("error" in stored) return NextResponse.json({ error: stored.error }, { status: 400 });
      section.video = stored.url;
    }
    if (image instanceof File && image.size > 0) {
      const stored = await storeFile(image, dir, `bg-image-${section.id}`, "image");
      if ("error" in stored) return NextResponse.json({ error: stored.error }, { status: 400 });
      section.image = stored.url;
    }
    if (poster instanceof File && poster.size > 0) {
      const stored = await storeFile(poster, dir, `bg-poster-${section.id}`, "image");
      if ("error" in stored) return NextResponse.json({ error: stored.error }, { status: 400 });
      section.poster = stored.url;
    }
  }

  const previous = await getSiteSettings();
  await saveSiteSettings({ ...previous, backgrounds });
  await removeOrphans(dir, backgrounds, previous.backgrounds);

  return NextResponse.json({ backgrounds });
}

async function removeOrphans(
  dir: string,
  next: SectionBackground[],
  previous: SectionBackground[]
) {
  const keep = new Set<string>();
  for (const section of next) {
    for (const url of [section.video, section.image, section.poster]) {
      if (url.startsWith("/uploads/backgrounds/")) keep.add(path.basename(url));
    }
  }
  for (const section of previous) {
    for (const url of [section.video, section.image, section.poster]) {
      if (!url.startsWith("/uploads/backgrounds/")) continue;
      const name = path.basename(url);
      if (keep.has(name)) continue;
      await fs.unlink(path.join(dir, name)).catch(() => {});
    }
  }
}
