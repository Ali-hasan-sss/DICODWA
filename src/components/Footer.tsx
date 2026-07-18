"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { socialLinks } from "@/lib/social";

function SocialIcon({ id }: { id: (typeof socialLinks)[number]["id"] }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
  };

  switch (id) {
    case "instagram":
      return (
        <svg {...common}>
          <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2m0 1.8c-3.2 0-3.5 0-4.8.1-1 .1-1.5.2-1.9.4-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.2.4-.3.9-.4 1.9-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.5.4 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.2.9.3 1.9.4 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c1-.1 1.5-.2 1.9-.4.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.2-.4.3-.9.4-1.9.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.5-.4-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.4-.2-.9-.3-1.9-.4-1.3-.1-1.6-.1-4.8-.1zm0 3.1a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.3-2.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M19.6 7.4a5.8 5.8 0 0 1-3.4-1.1v7.2a5.5 5.5 0 1 1-4.7-5.4v2.5a3 3 0 1 0 2.2 2.9V2.5h2.5c.2 1.4 1 2.7 2.1 3.6a5.8 5.8 0 0 0 2.3 1v2.3c-.3 0-.7-.1-1-.1z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M17.5 3h2.8l-6.1 7 7.2 11h-5.6l-4.4-6.4L6.2 21H3.4l6.5-7.4L3 3h5.8l4 5.8L17.5 3zm-1 16.5h1.5L7.6 4.7H6L16.5 19.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p className="script">By DeemaW Ali</p>

      <div className="footer-social" aria-label={t("social")}>
        {socialLinks.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link"
            aria-label={item.label}
          >
            <SocialIcon id={item.id} />
          </a>
        ))}
      </div>

      <nav className="footer-links" aria-label={t("legal")}>
        <Link href="/privacy">{t("privacy")}</Link>
        <span className="footer-sep" aria-hidden>
          ·
        </span>
        <Link href="/terms">{t("terms")}</Link>
      </nav>

      <p className="footer-copy">
        © {year} DICODWA. {t("rights")}
      </p>
    </footer>
  );
}
