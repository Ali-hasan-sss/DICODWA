import type { Artwork, ArtworkMedia } from "./types";

/** Resolve gallery items; always at least the cover image. */
export function getArtworkMedia(artwork: Artwork): ArtworkMedia[] {
  if (artwork.media?.length) return artwork.media;
  return [{ type: "image", src: artwork.image }];
}

/** Build media list from cover + newline-separated image/video URLs. */
export function buildArtworkMedia(
  cover: string,
  imagesText = "",
  videosText = ""
): ArtworkMedia[] {
  const images = imagesText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const videos = videosText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const media: ArtworkMedia[] = [];
  const seen = new Set<string>();

  const pushImage = (src: string) => {
    if (!src || seen.has(`image:${src}`)) return;
    seen.add(`image:${src}`);
    media.push({ type: "image", src });
  };

  pushImage(cover);
  for (const src of images) pushImage(src);

  for (const line of videos) {
    const [src, poster] = line.split("|").map((s) => s.trim());
    if (!src || seen.has(`video:${src}`)) continue;
    seen.add(`video:${src}`);
    media.push({
      type: "video",
      src,
      ...(poster ? { poster } : {}),
    });
  }

  return media.length ? media : [{ type: "image", src: cover }];
}

export function mediaToFormFields(
  media: ArtworkMedia[] | undefined,
  cover: string
) {
  const items = media?.length
    ? media
    : [{ type: "image" as const, src: cover }];
  const images = items
    .filter((m) => m.type === "image")
    .map((m) => m.src)
    .filter((src) => src !== cover);
  const videos = items
    .filter((m) => m.type === "video")
    .map((m) => (m.poster ? `${m.src}|${m.poster}` : m.src));

  return {
    galleryImages: images.join("\n"),
    galleryVideos: videos.join("\n"),
  };
}
