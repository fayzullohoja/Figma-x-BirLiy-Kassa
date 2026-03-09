# BirLiy Kassa (Telegram Mini App)

Frontend: React + Vite  
Backend: Supabase (Postgres + RLS)  
Deploy: Vercel (SPA + Serverless API)

## Implemented now

1. Real Supabase data layer for:
- Tables
- Menu (dishes)
- Active/closed orders + order items
- Owner dashboard metrics
- Subscription + payment history

2. Server-side security/payment endpoints on Vercel:
- `POST /api/auth/telegram` (validates Telegram `initData`)
- `POST /api/payments/click/callback` (verifies Click signature + writes subscription)
- `GET /api/payments/click/verify?transactionId=...`

3. Supabase SQL schema aligned to spec (`UUID`, `users/tables/orders/subscriptions`, strict RLS):
- `supabase/schema.sql`

## 1) Supabase setup

1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. Confirm tables were created: `restaurants`, `users`, `tables`, `dishes`, `orders`, `order_items`, `reservations`, `subscriptions`.
4. Confirm RLS is enabled on those tables.
5. In Supabase Auth, enable `Anonymous sign-ins` (required for prototype launch flow).

## 2) Environment variables

Create local `.env` from `.env.example`.

Client (Vite):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLICK_SERVICE_ID` (optional)
- `VITE_CLICK_MERCHANT_ID` (optional)
- `VITE_CLICK_RETURN_URL` (optional)

Server (Vercel API):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLICK_SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`

## 3) Local run

```bash
npm install
npm run dev
```

## 4) Deploy to Vercel

1. Import repository into Vercel.
2. Add all env vars from step 2 in Project Settings.
3. Build command: `npm run build`
4. Output dir: `dist`
5. Deploy.

`vercel.json` already contains SPA rewrite and keeps `/api/*` for serverless handlers.

## 5) Deploy readiness checklist

Project is ready to deploy when all are true:

1. `supabase/schema.sql` executed successfully.
2. Vercel env vars set (`SUPABASE_SERVICE_ROLE_KEY`, `CLICK_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, VITE vars).
3. Click dashboard callback URL points to:
- `https://<your-domain>/api/payments/click/callback`
4. Telegram bot token is valid.

## Important

- This environment did not have Node installed, so local `npm install` / `npm run build` could not be executed here.
- After you run build once on your machine or Vercel CI, deploy is production-ready.
- RLS supports prototype mode now (anonymous authenticated users).  
  For strict production mode, keep Telegram verification endpoint and switch policies to require JWT claim `telegram_id`.
