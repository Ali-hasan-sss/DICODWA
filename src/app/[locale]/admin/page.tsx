"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Artwork, ContactMessage, HeroSlide, LocaleCopy, Order, SectionBackground, ShowcaseSection } from "@/lib/types";
import { buildArtworkMedia, mediaToFormFields } from "@/lib/artwork-media";
import { BackgroundsEditor } from "@/components/admin/BackgroundsEditor";
import { HeroSlidesEditor } from "@/components/admin/HeroSlidesEditor";
import { ShowcaseEditor } from "@/components/admin/ShowcaseEditor";
import { SiteCopyEditor } from "@/components/admin/SiteCopyEditor";

const emptyForm = {
  id: "",
  titleEn: "",
  titleAr: "",
  descEn: "",
  descAr: "",
  price: "",
  image: "",
  galleryImages: "",
  galleryVideos: "",
  mediumEn: "",
  mediumAr: "",
  dimensions: "",
  year: String(new Date().getFullYear()),
  status: "available",
  featured: true,
};

export default function AdminPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<
    "hero" | "backgrounds" | "showcase" | "texts" | "artworks" | "orders" | "messages"
  >("hero");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [backgrounds, setBackgrounds] = useState<SectionBackground[]>([]);
  const [showcase, setShowcase] = useState<ShowcaseSection | null>(null);
  const [copy, setCopy] = useState<LocaleCopy | null>(null);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/admin");
    if (!res.ok) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setAuthed(true);
    setArtworks(data.artworks || []);
    setOrders(data.orders || []);
    setMessages(data.messages || []);
    setHeroSlides(data.site?.heroSlides || []);
    setBackgrounds(data.site?.backgrounds || []);
    setShowcase(data.site?.showcase || null);
    setCopy(data.copy || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError(t("invalidPassword"));
      return;
    }
    setPassword("");
    await loadData();
  }

  async function handleLogout() {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAuthed(false);
  }

  function editArtwork(art: Artwork) {
    const fields = mediaToFormFields(art.media, art.image);
    setForm({
      id: art.id,
      titleEn: art.title.en,
      titleAr: art.title.ar,
      descEn: art.description.en,
      descAr: art.description.ar,
      price: String(art.price),
      image: art.image,
      galleryImages: fields.galleryImages,
      galleryVideos: fields.galleryVideos,
      mediumEn: art.medium.en,
      mediumAr: art.medium.ar,
      dimensions: art.dimensions,
      year: String(art.year),
      status: art.status,
      featured: art.featured,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveArtwork(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const media = buildArtworkMedia(
      form.image,
      form.galleryImages,
      form.galleryVideos
    );
    const payload = {
      id: form.id || undefined,
      title: { en: form.titleEn, ar: form.titleAr },
      description: { en: form.descEn, ar: form.descAr },
      price: Number(form.price),
      image: form.image,
      media,
      medium: { en: form.mediumEn, ar: form.mediumAr },
      dimensions: form.dimensions,
      year: Number(form.year),
      status: form.status,
      featured: form.featured,
    };

    const res = await fetch("/api/artworks/manage", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setForm(emptyForm);
      await loadData();
    }
  }

  async function removeArtwork(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/artworks/manage?id=${id}`, { method: "DELETE" });
    await loadData();
  }

  const panels = {
    hero: { group: t("navHome"), title: t("heroTitle"), hint: t("whereHero") },
    backgrounds: { group: t("navHome"), title: t("backgroundsTitle"), hint: t("whereBackgrounds") },
    showcase: { group: t("navHome"), title: t("showcaseTitle"), hint: t("whereShowcase") },
    texts: { group: t("navHome"), title: t("textsTitle"), hint: t("whereTexts") },
    artworks: { group: t("navStudio"), title: t("artworks"), hint: t("artworkHelp") },
    orders: { group: t("navDesk"), title: t("orders"), hint: t("ordersHelp") },
    messages: { group: t("navDesk"), title: t("messages"), hint: t("messagesHelp") },
  } as const;
  const current = panels[tab];
  const navGroups = [
    {
      label: t("navHome"),
      items: [
        { id: "hero" as const, label: t("hero") },
        { id: "backgrounds" as const, label: t("backgrounds") },
        { id: "showcase" as const, label: t("showcase") },
        { id: "texts" as const, label: t("texts") },
      ],
    },
    {
      label: t("navStudio"),
      items: [{ id: "artworks" as const, label: t("artworks"), count: artworks.length }],
    },
    {
      label: t("navDesk"),
      items: [
        { id: "orders" as const, label: t("orders"), count: orders.length },
        { id: "messages" as const, label: t("messages"), count: messages.length },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <p className="form-status">...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <form className="admin-card admin-form" onSubmit={handleLogin}>
            <p className="admin-kicker">DICODWA</p>
            <h1>{t("login")}</h1>
            <label className="admin-field">
              <span>{t("password")}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary">
              {t("submit")}
            </button>
            {loginError && <p className="form-status err">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <aside className="admin-nav">
          <p className="admin-brand">DICODWA</p>
          {navGroups.map((group) => (
            <div key={group.label} className="admin-nav-group">
              <p className="admin-nav-label">{group.label}</p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? "active" : ""}
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => setTab(item.id)}
                >
                  <span>{item.label}</span>
                  {"count" in item && <span className="admin-count">{item.count}</span>}
                </button>
              ))}
            </div>
          ))}
          <div className="admin-nav-actions">
            <Link href="/" className="btn-primary">
              {t("viewSite")}
            </Link>
            <button type="button" className="btn-primary" onClick={handleLogout}>
              {t("logout")}
            </button>
          </div>
        </aside>
        <div className="admin-workspace">
          <header className="admin-panel-head">
            <p className="admin-kicker">{current.group}</p>
            <h1>{current.title}</h1>
            <p>{current.hint}</p>
          </header>

      {tab === "hero" && heroSlides.length > 0 && (
        <HeroSlidesEditor key={heroSlides.map((slide) => slide.id).join("-")} initialSlides={heroSlides} />
      )}

      {tab === "backgrounds" && backgrounds.length > 0 && (
        <BackgroundsEditor initialBackgrounds={backgrounds} />
      )}

      {tab === "showcase" && showcase && (
        <ShowcaseEditor key={showcase.images.map((image) => image.id).join("-")} initial={showcase} />
      )}

      {tab === "texts" && copy && <SiteCopyEditor key={locale} initialCopy={copy} />}

      {tab === "artworks" && (
        <>
          <form id="artwork-form" className="admin-form" onSubmit={saveArtwork}>
            <h2 className="admin-kicker">{form.id ? t("edit") : t("add")}</h2>
            {form.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="admin-cover-preview" src={form.image} alt="" />
            )}
            <div className="grid-2">
              <label className="admin-field">
                <span>{t("titleEn")}</span>
                <input
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                <span>{t("titleAr")}</span>
                <input
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  required
                />
              </label>
            </div>
            <div className="grid-2">
              <label className="admin-field">
                <span>{t("descEn")}</span>
                <textarea
                  value={form.descEn}
                  onChange={(e) => setForm({ ...form, descEn: e.target.value })}
                  rows={3}
                  required
                />
              </label>
              <label className="admin-field">
                <span>{t("descAr")}</span>
                <textarea
                  value={form.descAr}
                  onChange={(e) => setForm({ ...form, descAr: e.target.value })}
                  rows={3}
                  required
                />
              </label>
            </div>
            <div className="grid-2">
              <label className="admin-field">
                <span>{t("price")}</span>
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                <span>{t("image")}</span>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  required
                />
              </label>
            </div>
            <div className="grid-2">
              <label className="admin-field">
                <span>{t("galleryImages")}</span>
                <textarea
                  value={form.galleryImages}
                  onChange={(e) =>
                    setForm({ ...form, galleryImages: e.target.value })
                  }
                  rows={3}
                />
              </label>
              <label className="admin-field">
                <span>{t("galleryVideos")}</span>
                <textarea
                  value={form.galleryVideos}
                  onChange={(e) =>
                    setForm({ ...form, galleryVideos: e.target.value })
                  }
                  rows={3}
                />
              </label>
            </div>
            <div className="grid-2">
              <label className="admin-field">
                <span>{t("mediumEn")}</span>
                <input
                  value={form.mediumEn}
                  onChange={(e) => setForm({ ...form, mediumEn: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                <span>{t("mediumAr")}</span>
                <input
                  value={form.mediumAr}
                  onChange={(e) => setForm({ ...form, mediumAr: e.target.value })}
                  required
                />
              </label>
            </div>
            <div className="grid-2">
              <label className="admin-field">
                <span>{t("dimensions")}</span>
                <input
                  value={form.dimensions}
                  onChange={(e) =>
                    setForm({ ...form, dimensions: e.target.value })
                  }
                  required
                />
              </label>
              <label className="admin-field">
                <span>{t("year")}</span>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </label>
            </div>
            <div className="grid-2">
              <label className="admin-field">
                <span>{t("status")}</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="available">{t("available")}</option>
                  <option value="sold">{t("sold")}</option>
                </select>
              </label>
              <label className="admin-field" style={{ alignContent: "end" }}>
                <span>{t("featured")}</span>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn-primary admin-save" disabled={saving}>
                {t("save")}
              </button>
              {form.id && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setForm(emptyForm)}
                >
                  {t("cancel")}
                </button>
              )}
            </div>
          </form>

          <ul className="admin-works">
            {artworks.map((art) => (
              <li key={art.id} className="admin-work">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={art.image} alt="" />
                <div className="admin-work-body">
                  <h3>{locale === "ar" ? art.title.ar : art.title.en}</h3>
                  <p>
                    ${art.price} · {art.status === "sold" ? t("sold") : t("available")}
                  </p>
                  <div className="admin-work-actions">
                    <button type="button" className="btn-primary" onClick={() => editArtwork(art)}>
                      {t("edit")}
                    </button>
                    <button type="button" className="btn-primary" onClick={() => removeArtwork(art.id)}>
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "orders" && (
        orders.length === 0 ? (
          <p className="form-status">{t("noOrders")}</p>
        ) : (
          <div className="admin-records">
            {orders.map((o) => (
              <article key={o.id} className="admin-record">
                <header>
                  <h3>{o.artworkTitle}</h3>
                  <time dateTime={o.createdAt}>{new Date(o.createdAt).toLocaleString(locale)}</time>
                </header>
                <p>
                  <strong>{t("amount")}: </strong>${o.amount} {o.currency}
                  {" · "}
                  <strong>{t("status")}: </strong>
                  {o.status}
                </p>
                <p>
                  <strong>{t("customer")}: </strong>
                  {o.customerEmail || "—"}
                </p>
              </article>
            ))}
          </div>
        )
      )}

      {tab === "messages" && (
        messages.length === 0 ? (
          <p className="form-status">{t("noMessages")}</p>
        ) : (
          <div className="admin-records">
            {messages.map((m) => (
              <article key={m.id} className="admin-record">
                <header>
                  <h3>{m.name}</h3>
                  <time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString(locale)}</time>
                </header>
                <p>
                  <strong>{t("email")}: </strong>
                  {m.email}
                </p>
                <p>{m.message}</p>
              </article>
            ))}
          </div>
        )
      )}
        </div>
      </div>
    </div>
  );
}
