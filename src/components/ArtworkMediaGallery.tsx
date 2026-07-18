"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import type { ArtworkMedia } from "@/lib/types";

type Props = {
  media: ArtworkMedia[];
  alt: string;
};

function isRemote(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArtworkMediaGallery({ media, alt }: Props) {
  const t = useTranslations("gallery");
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [mounted, setMounted] = useState(false);

  const count = media.length;
  const current = media[active] ?? media[0];

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count < 2) return;
      setActive((i) => (i + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!lightbox) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  if (!current) return null;

  const lightboxNode =
    lightbox && mounted
      ? createPortal(
          <div
            className="media-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={t("fullscreen")}
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              className="media-lightbox-close"
              onClick={() => setLightbox(false)}
              aria-label={t("close")}
            >
              <IconClose />
            </button>

            {count > 1 && (
              <>
                <button
                  type="button"
                  className="media-lightbox-nav left"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label={t("previous")}
                >
                  <IconChevronLeft />
                </button>
                <button
                  type="button"
                  className="media-lightbox-nav right"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label={t("next")}
                >
                  <IconChevronRight />
                </button>
              </>
            )}

            <div
              className="media-lightbox-stage"
              onClick={(e) => e.stopPropagation()}
            >
              {current.type === "video" ? (
                <video
                  key={current.src}
                  src={current.src}
                  poster={current.poster}
                  controls
                  autoPlay
                  playsInline
                  className="media-lightbox-media"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.src}
                  alt={alt}
                  className="media-lightbox-media"
                />
              )}
              <p className="media-lightbox-counter">
                {active + 1} / {count}
              </p>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="media-gallery">
      <button
        type="button"
        className="media-main"
        onClick={() => setLightbox(true)}
        aria-label={t("openFullscreen")}
      >
        {current.type === "video" ? (
          <video
            src={current.src}
            poster={current.poster}
            muted
            playsInline
            preload="metadata"
            className="media-main-media"
          />
        ) : (
          <Image
            src={current.src}
            alt={alt}
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            className="media-main-media"
            priority
            unoptimized={isRemote(current.src)}
          />
        )}
        {current.type === "video" && (
          <span className="media-play-badge" aria-hidden>
            ▶
          </span>
        )}
        <span className="media-expand-hint">{t("clickToExpand")}</span>
      </button>

      {count > 1 && (
        <div className="media-thumbs" role="list">
          {media.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              role="listitem"
              className={`media-thumb${index === active ? " active" : ""}`}
              onClick={() => setActive(index)}
              aria-label={
                item.type === "video"
                  ? t("videoThumb", { n: index + 1 })
                  : t("imageThumb", { n: index + 1 })
              }
              aria-current={index === active}
            >
              {item.type === "video" ? (
                <>
                  {item.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.poster} alt="" />
                  ) : (
                    <video src={item.src} muted playsInline preload="metadata" />
                  )}
                  <span className="media-thumb-play" aria-hidden>
                    ▶
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt="" />
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxNode}
    </div>
  );
}
