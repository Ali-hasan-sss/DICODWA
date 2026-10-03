import { flatOverlay } from "@/lib/backgrounds";
import type { SectionBackground } from "@/lib/types";

type Props = {
  background: SectionBackground;
  speed?: string;
};

export function SectionBackdrop({ background, speed = "0.5" }: Props) {
  const image = background.image || background.poster;

  return (
    <>
      {background.video ? (
        <video
          className="parallax-bg section-bg-video"
          data-speed={speed}
          autoPlay
          muted
          loop
          playsInline
          poster={background.poster || background.image || undefined}
        >
          <source src={background.video} />
        </video>
      ) : (
        <div
          className="parallax-bg"
          data-speed={speed}
          style={image ? { backgroundImage: `url("${image}")` } : undefined}
        />
      )}
      <div
        className="parallax-overlay"
        style={{ background: flatOverlay(background) }}
      />
    </>
  );
}
