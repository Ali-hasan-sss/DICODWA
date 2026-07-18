import { NextResponse } from "next/server";
import {
  deleteArtwork,
  getArtworks,
  upsertArtwork,
} from "@/lib/store";
import { isAdminAuthenticated } from "@/lib/auth";
import { buildArtworkMedia } from "@/lib/artwork-media";
import type { Artwork } from "@/lib/types";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const media =
    body.media ??
    buildArtworkMedia(
      body.image,
      body.galleryImages || "",
      body.galleryVideos || ""
    );

  const artwork: Artwork = {
    id: body.id || `aw-${randomUUID().slice(0, 8)}`,
    title: body.title,
    description: body.description,
    price: Number(body.price),
    currency: body.currency || "usd",
    image: body.image,
    media,
    medium: body.medium,
    dimensions: body.dimensions,
    year: Number(body.year) || new Date().getFullYear(),
    status: body.status || "available",
    featured: Boolean(body.featured),
    createdAt: body.createdAt || new Date().toISOString(),
  };

  if (!artwork.title?.en || !artwork.title?.ar || !artwork.image || !artwork.price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const saved = await upsertArtwork(artwork);
  return NextResponse.json(saved);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const existing = (await getArtworks()).find((a) => a.id === body.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const media =
    body.media ??
    (body.galleryImages !== undefined || body.galleryVideos !== undefined
      ? buildArtworkMedia(
          body.image ?? existing.image,
          body.galleryImages ?? "",
          body.galleryVideos ?? ""
        )
      : existing.media);

  const artwork: Artwork = {
    ...existing,
    ...body,
    price: Number(body.price ?? existing.price),
    year: Number(body.year ?? existing.year),
    featured:
      body.featured !== undefined ? Boolean(body.featured) : existing.featured,
    media,
  };

  const saved = await upsertArtwork(artwork);
  return NextResponse.json(saved);
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ok = await deleteArtwork(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
