"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Artwork, ContactMessage, Order } from "@/lib/types";
import { buildArtworkMedia, mediaToFormFields } from "@/lib/artwork-media";

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
  const [tab, setTab] = useState<"artworks" | "orders" | "messages">("artworks");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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
    if (!confirm("Delete?")) return;
    await fetch(`/api/artworks/manage?id=${id}`, { method: "DELETE" });
    await loadData();
  }

  if (loading) {
    return (
      <div className="admin-page">
        <p>...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h1 className="section-title" style={{ fontSize: 28 }}>
            {t("login")}
          </h1>
          <form className="admin-form" onSubmit={handleLogin}>
            <input
              type="password"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h1 className="section-title" style={{ fontSize: 36, margin: 0 }}>
          {t("title")}
        </h1>
        <button type="button" className="btn-primary" onClick={handleLogout}>
          {t("logout")}
        </button>
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === "artworks" ? "active" : ""}
          onClick={() => setTab("artworks")}
        >
          {t("artworks")}
        </button>
        <button
          type="button"
          className={tab === "orders" ? "active" : ""}
          onClick={() => setTab("orders")}
        >
          {t("orders")}
        </button>
        <button
          type="button"
          className={tab === "messages" ? "active" : ""}
          onClick={() => setTab("messages")}
        >
          {t("messages")}
        </button>
      </div>

      {tab === "artworks" && (
        <>
          <form className="admin-form" onSubmit={saveArtwork}>
            <h2 style={{ letterSpacing: 2, color: "var(--gold-light)" }}>
              {form.id ? t("edit") : t("add")}
            </h2>
            <div className="grid-2">
              <input
                placeholder={t("titleEn")}
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                required
              />
              <input
                placeholder={t("titleAr")}
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                required
              />
            </div>
            <div className="grid-2">
              <textarea
                placeholder={t("descEn")}
                value={form.descEn}
                onChange={(e) => setForm({ ...form, descEn: e.target.value })}
                rows={3}
                required
              />
              <textarea
                placeholder={t("descAr")}
                value={form.descAr}
                onChange={(e) => setForm({ ...form, descAr: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="grid-2">
              <input
                placeholder={t("price")}
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                placeholder={t("image")}
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                required
              />
            </div>
            <div className="grid-2">
              <textarea
                placeholder={t("galleryImages")}
                value={form.galleryImages}
                onChange={(e) =>
                  setForm({ ...form, galleryImages: e.target.value })
                }
                rows={3}
              />
              <textarea
                placeholder={t("galleryVideos")}
                value={form.galleryVideos}
                onChange={(e) =>
                  setForm({ ...form, galleryVideos: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid-2">
              <input
                placeholder={t("mediumEn")}
                value={form.mediumEn}
                onChange={(e) => setForm({ ...form, mediumEn: e.target.value })}
                required
              />
              <input
                placeholder={t("mediumAr")}
                value={form.mediumAr}
                onChange={(e) => setForm({ ...form, mediumAr: e.target.value })}
                required
              />
            </div>
            <div className="grid-2">
              <input
                placeholder={t("dimensions")}
                value={form.dimensions}
                onChange={(e) =>
                  setForm({ ...form, dimensions: e.target.value })
                }
                required
              />
              <input
                placeholder={t("year")}
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
            <div className="grid-2">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="available">{t("available")}</option>
                <option value="sold">{t("sold")}</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                Featured
              </label>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn-primary" disabled={saving}>
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

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{locale === "ar" ? "العنوان" : "Title"}</th>
                  <th>{t("price")}</th>
                  <th>{t("status")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {artworks.map((art) => (
                  <tr key={art.id}>
                    <td>{locale === "ar" ? art.title.ar : art.title.en}</td>
                    <td>${art.price}</td>
                    <td>{art.status}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: "6px 12px", fontSize: 10 }}
                        onClick={() => editArtwork(art)}
                      >
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: "6px 12px", fontSize: 10 }}
                        onClick={() => removeArtwork(art.id)}
                      >
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "orders" && (
        <div style={{ overflowX: "auto" }}>
          {orders.length === 0 ? (
            <p className="form-status">{t("noOrders")}</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Artwork</th>
                  <th>Amount</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.artworkTitle}</td>
                    <td>
                      ${o.amount} {o.currency}
                    </td>
                    <td>{o.customerEmail || "—"}</td>
                    <td>{o.status}</td>
                    <td>{new Date(o.createdAt).toLocaleString(locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "messages" && (
        <div style={{ overflowX: "auto" }}>
          {messages.length === 0 ? (
            <p className="form-status">{t("noMessages")}</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td style={{ maxWidth: 320 }}>{m.message}</td>
                    <td>{new Date(m.createdAt).toLocaleString(locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
