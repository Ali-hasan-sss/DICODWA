"use client";

import { useEffect, useRef, useState } from "react";

export type HeroSlideView = {
  id: string;
  video: string;
  poster: string;
  title: string;
  subtitle: string;
  buttons: { label: string; href: string }[];
};

type Props = {
  slides: HeroSlideView[];
  muteLabel: string;
  unmuteLabel: string;
  playLabel: string;
  prevLabel: string;
  nextLabel: string;
  slideLabel: string;
  scrim: string;
};

function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M4 9v6h4l5 4V5L8 9H4zm13.6 3 2.2-2.2-1.4-1.4L16.2 10.6 14 8.4l-1.4 1.4L14.8 12 12.6 14.2l1.4 1.4 2.2-2.2 2.2 2.2 1.4-1.4L17.6 12z"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a3.5 3.5 0 0 0-1.5-2.9v5.8a3.5 3.5 0 0 0 1.5-2.9zm2.5 0a6 6 0 0 0-2.5-4.9v1.8a4.2 4.2 0 0 1 0 6.2v1.8A6 6 0 0 0 18 12z"
      />
    </svg>
  );
}

export function HeroStage({
  slides,
  muteLabel,
  unmuteLabel,
  playLabel,
  prevLabel,
  nextLabel,
  slideLabel,
  scrim,
}: Props) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [reduce, setReduce] = useState(false);
  const count = slides.length;
  const active = slides[index] || slides[0];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      el.muted = muted;
      if (i === index && !reduce) el.play().catch(() => {});
      else el.pause();
    });
  }, [index, muted, reduce, slides]);

  useEffect(() => {
    if (count < 2 || reduce) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [count, reduce, index]);

  function go(next: number) {
    if (!count) return;
    setIndex((next + count) % count);
  }

  function toggleMute() {
    setMuted((value) => !value);
  }

  function play() {
    const el = videoRefs.current[index];
    if (!el) return;
    el.play().catch(() => {});
  }

  if (!active) return null;

  return (
    <section id="home" className={`fs-hero ${count > 1 ? "has-dots" : ""}`} data-motion="hero">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`fs-hero-slide ${i === index ? "active" : ""}`}
          aria-hidden={i !== index}
        >
          {slide.video ? (
            <video
              ref={(node) => {
                videoRefs.current[i] = node;
              }}
              className="fs-hero-video"
              autoPlay={i === index}
              muted
              loop
              playsInline
              preload={i === index ? "auto" : "metadata"}
              poster={slide.poster || undefined}
            >
              <source src={slide.video} />
            </video>
          ) : (
            <div
              className="fs-hero-fallback"
              style={{
                backgroundImage: `url('${slide.poster || "/images/parallax-bg-01.jpg"}')`,
              }}
            />
          )}
        </div>
      ))}
      <div className="fs-hero-scrim" style={{ background: scrim }} />
      <div className="fs-hero-copy" key={active.id}>
        {active.title && <h1 className="fs-hero-title">{active.title}</h1>}
        {active.subtitle && <p className="fs-hero-kicker">{active.subtitle}</p>}
        {active.buttons.length > 0 && (
          <div className="fs-hero-actions">
            {active.buttons.map((button, i) => (
              <a
                key={`${button.href}-${button.label}`}
                className={i === 0 ? "btn-pill" : "btn-pill btn-pill-ghost"}
                href={button.href}
                {...(button.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {button.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="fs-hero-arrow prev"
            onClick={() => go(index - 1)}
            aria-label={prevLabel}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M15.4 4.6 8 12l7.4 7.4-1.4 1.4L5.2 12 14 3.2z" />
            </svg>
          </button>
          <button
            type="button"
            className="fs-hero-arrow next"
            onClick={() => go(index + 1)}
            aria-label={nextLabel}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="m8.6 4.6 1.4-1.4L18.8 12 10 20.8l-1.4-1.4L16 12z" />
            </svg>
          </button>
          <div className="fs-hero-dots">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={`fs-hero-dot ${i === index ? "active" : ""}`}
                aria-label={slideLabel.replace("{n}", String(i + 1))}
                aria-current={i === index}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}

      {active.video && reduce && (
        <button type="button" className="fs-hero-play" onClick={play}>
          {playLabel}
        </button>
      )}
      {active.video && (
        <button
          type="button"
          className="fs-hero-sound"
          onClick={toggleMute}
          aria-pressed={!muted}
          aria-label={muted ? unmuteLabel : muteLabel}
        >
          <SpeakerIcon muted={muted} />
        </button>
      )}
    </section>
  );
}
