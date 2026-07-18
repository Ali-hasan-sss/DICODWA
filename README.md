# DICODWA

معرض فني للفنانة **DeemaW Ali** — Decorative Pieces & More.

مشروع **Next.js** (واجهة + Route Handlers) مع دعم العربية والإنجليزية ودفع Stripe.

## التشغيل

```bash
npm install
cp .env.example .env.local
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## الميزات

- موقع ثنائي اللغة (`/en` و `/ar`) مع RTL للعربية
- معرض لوحات مع صفحات تفاصيل
- شراء إلكتروني عبر **Stripe Checkout**
- لوحة إدارة على `/en/admin` أو `/ar/admin`
- API Routes للتحكم بالأعمال والطلبات والرسائل

## لوحة الإدارة

- الرابط: `/en/admin`
- كلمة المرور الافتراضية: `dicodwa-admin` (غيّرها في `.env.local`)

## Stripe

1. أنشئ حساباً على [Stripe](https://dashboard.stripe.com)
2. ضع المفاتيح في `.env.local`:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET` (للإنتاج)
3. للتجربة محلياً:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## هيكل البيانات

البيانات تُحفظ في ملفات JSON داخل مجلد `data/`:

- `artworks.json` — اللوحات
- `orders.json` — الطلبات
- `messages.json` — رسائل التواصل

القالب الأصلي محفوظ في `_template/`.
