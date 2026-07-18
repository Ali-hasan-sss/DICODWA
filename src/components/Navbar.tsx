"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: next });
  };

  const navItems = [
    { href: "/#home", label: t("home") },
    { href: "/#about", label: t("about") },
    { href: "/gallery", label: t("gallery") },
    { href: "/#contact", label: t("contact") },
  ];

  return (
    <nav className={`site-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.png"
            alt="DICODWA"
            width={160}
            height={160}
            priority
          />
          <span className="nav-logo-text">DICODWA</span>
        </Link>

        <ul className={`nav-links ${open ? "open" : ""}`}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button type="button" className="lang-switch" onClick={switchLocale}>
            {locale === "en" ? "العربية" : "EN"}
          </button>
          <button
            type="button"
            className={`nav-toggle ${open ? "active" : ""}`}
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
