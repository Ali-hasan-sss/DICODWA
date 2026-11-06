import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isSafeMediaUrl } from "@/lib/hero-slides";
import { normalizeShowcase } from "@/lib/showcase";
import { getSiteSettings, saveSiteSettings } from "@/lib/store";
import type { ShowcaseImage } from "@/lib/types";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function extFromName(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "jpeg" || ext === "jpg") return "jpg";
  if (ext === "png" || ext === "webp") return ext;
  return null;
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
    parsed = JSON.parse(String(form.get("showcase") || "{}"));
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const incoming =
    parsed && typeof parsed === "object" && Array.isArray((parsed as { images?: unknown }).images)
      ? ((parsed as { images: unknown[] }).images as ShowcaseImage[])
      : [];

  for (const item of incoming) {
    if (item?.src && !isSafeMediaUrl(String(item.src))) {
      return NextResponse.json({ error: "bad_url" }, { status: 400 });
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads", "showcase");
  await fs.mkdir(dir, { recursive: true });

  for (const item of incoming) {
    if (!item?.id) continue;
    const file = form.get(`image:${item.id}`);
    if (!(file instanceof File) || file.size <= 0) continue;
    const ext = IMAGE_EXT[file.type] || extFromName(file.name);
    if (!ext) return NextResponse.json({ error: "bad_poster" }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "poster_too_large" }, { status: 400 });
    }
    const name = `frame-${item.id}-${Date.now()}.${ext}`;
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    item.src = `/uploads/showcase/${name}`;
  }

  const showcase = normalizeShowcase(parsed);
  const previous = await getSiteSettings();
  await saveSiteSettings({ ...previous, showcase });
  await removeOrphans(dir, showcase.images, previous.showcase.images);

  return NextResponse.json({ showcase });
}

async function removeOrphans(dir: string, next: ShowcaseImage[], previous: ShowcaseImage[]) {
  const keep = new Set(
    next
      .map((image) => image.src)
      .filter((src) => src.startsWith("/uploads/showcase/"))
      .map((src) => path.basename(src))
  );
  for (const image of previous) {
    if (!image.src.startsWith("/uploads/showcase/")) continue;
    const name = path.basename(image.src);
    if (keep.has(name) || name.includes("..")) continue;
    await fs.unlink(path.join(dir, name)).catch(() => {});
  }
}
