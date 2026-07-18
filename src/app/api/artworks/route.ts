import { NextResponse } from "next/server";
import { getArtworks, getArtworkById } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const artwork = await getArtworkById(id);
    if (!artwork) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(artwork);
  }

  const artworks = await getArtworks();
  return NextResponse.json(artworks);
}
