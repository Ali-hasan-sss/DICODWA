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
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const switchLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: next });
  };

  const solid = scrolled || open;

  const navItems = [
    { href: "/#home", label: t("home") },
    { href: "/#about", label: t("about") },
    { href: "/gallery", label: t("gallery") },
    { href: "/#contact", label: t("contact") },
  ];

  const langLabel = locale === "en" ? "ar" : "en";

  return (
    <header className={`site-nav ${solid ? "solid" : "overlay"}`}>
      <div className="nav-container">
        <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.png"
            alt="DICODWA"
            width={160}
            height={160}
            priority
          />
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
            {langLabel}
          </button>
          <button
            type="button"
            className={`nav-toggle ${open ? "active" : ""}`}
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
