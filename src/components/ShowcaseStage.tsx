"use client";

import { useState } from "react";
import Image from "next/image";

export type ShowcaseViewImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

type Props = {
  kicker: string;
  title: string;
  text: string;
  images: ShowcaseViewImage[];
};

export function ShowcaseStage({ kicker, title, text, images }: Props) {
  const [active, setActive] = useState(0);
  const current = images[active] || images[0];
  if (!current) return null;

  return (
    <section id="studio" className="home-block home-showcase" data-motion="studio">
      <div className="section-content">
        {(kicker || title || text) && (
          <div className="showcase-intro">
            {kicker && (
              <p className="eyebrow" data-reveal="fade-up" data-delay="1">
                {kicker}
              </p>
            )}
            {title && (
              <h2 className="section-title" data-reveal="title" data-delay="0">
                {title}
              </h2>
            )}
            {text && (
              <p className="section-lead" data-reveal="fade-up" data-delay="2">
                {text}
              </p>
            )}
          </div>
        )}

        <div className={`showcase-layout${images.length < 2 ? " is-single" : ""}`}>
          <figure className="showcase-stage">
            <Image
              key={current.id}
              src={current.src}
              alt={current.alt || title || "DICODWA"}
              fill
              sizes="(max-width: 800px) 100vw, 62vw"
            />
            {current.caption && <figcaption className="showcase-caption">{current.caption}</figcaption>}
          </figure>

          {images.length > 1 && (
            <div className="showcase-thumbs">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={`showcase-thumb${index === active ? " active" : ""}`}
                  aria-pressed={index === active}
                  aria-label={image.alt || image.caption || title}
                  onClick={() => setActive(index)}
                >
                  <Image src={image.src} alt="" fill sizes="120px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
