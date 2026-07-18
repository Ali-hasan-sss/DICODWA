"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll parallax + artistic section enter/exit reveals.
 * Re-binds on route change so every page gets motion.
 */
export function ParallaxEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const parallaxBgs = Array.from(
      document.querySelectorAll<HTMLElement>(".parallax-bg")
    );
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".parallax-section, [data-motion]")
    );

    let isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    let ticking = false;

    function updateParallax() {
      if (isMobile || reduceMotion) return;
      const windowHeight = window.innerHeight;

      parallaxBgs.forEach((bg) => {
        const section = bg.parentElement;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -300 || rect.top > windowHeight + 300) return;

        const speed = parseFloat(bg.getAttribute("data-speed") || "0.5");
        const sectionCenterY = rect.top + rect.height / 2;
        const viewportCenterY = windowHeight / 2;
        const offset = sectionCenterY - viewportCenterY;
        const totalTravel = windowHeight + rect.height;
        let normalized = offset / (totalTravel / 2);
        normalized = Math.max(-1, Math.min(1, normalized));
        const maxShift = windowHeight * speed;
        const translateY = normalized * maxShift;
        bg.style.transform = `translate3d(0,${translateY.toFixed(1)}px,0)`;
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    function onResize() {
      isMobile = window.innerWidth <= 768;
      if (!isMobile && !reduceMotion) {
        updateParallax();
      } else {
        parallaxBgs.forEach((bg) => {
          bg.style.transform = "translate3d(0,0,0)";
        });
      }
    }

    const observers: IntersectionObserver[] = [];

    if (!reduceMotion) {
      sections.forEach((section) => {
        section.classList.add("motion-ready");
        section.classList.remove("in-view", "out-view");

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const el = entry.target as HTMLElement;
              if (entry.isIntersecting) {
                el.classList.add("in-view");
                el.classList.remove("out-view");
              } else {
                el.classList.remove("in-view");
                el.classList.add("out-view");
              }
            });
          },
          {
            threshold: 0.16,
            rootMargin: "0px 0px -6% 0px",
          }
        );

        observer.observe(section);
        observers.push(observer);
      });

      const hero = document.getElementById("home");
      if (hero) {
        requestAnimationFrame(() => {
          hero.classList.add("in-view", "motion-ready");
          hero.classList.remove("out-view");
        });
      }

      // Detail / short pages: trigger if already in viewport
      requestAnimationFrame(() => {
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85 && rect.bottom > 80) {
            section.classList.add("in-view");
            section.classList.remove("out-view");
          }
        });
      });
    } else {
      sections.forEach((section) => {
        section.classList.add("motion-ready", "in-view");
      });
    }

    if (!isMobile && !reduceMotion) {
      window.addEventListener("scroll", onScroll, { passive: true });
      updateParallax();
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observers.forEach((o) => o.disconnect());
    };
  }, [pathname]);

  return null;
}
