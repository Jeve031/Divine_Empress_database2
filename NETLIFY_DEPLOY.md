# Deploy Divine Empress Hair to Netlify

Yes — this site is Netlify-ready. It uses Next.js App Router + API routes + Postgres.
Netlify runs the API routes as serverless functions, so you just need a **hosted Postgres**
(Netlify has no built-in Postgres). Free Neon tier works perfectly.

## What was already done for you

- `netlify.toml` — build command `npm run build`, publish `.next`, Next.js plugin
- `src/db/index.ts` — serverless-safe Postgres pool + SSL auto-detect for Neon/Supabase
- `drizzle.config.ts` — reads `DATABASE_URL` from env (works for local + hosted DB)
- `src/lib/auth.ts` — admin credentials read from `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars
  (defaults to `Storm` / `Caleb27/02`, so nothing breaks)
- `.env.example` — documents the 3 env vars you need

## Step-by-step (15 minutes)

### 1. Create a free hosted database (Neon)

1. Go to https://neon.tech → Sign up → New Project
2. Name: `divine-empress`, region: closest to you (e.g. EU / US)
3. Copy the **pooled connection string**. It looks like:
   `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`
4. Keep it — this is your production `DATABASE_URL`

> Alternative: Supabase (https://supabase.com) → New project → Settings → Database → Connection string (use pooler + `?sslmode=require`).

### 2. Create the tables in the hosted DB

On your computer (in this project folder):

```bash
# Point drizzle at Neon temporarily
export DATABASE_URL="postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require"

npx drizzle-kit push
```

You should see `[✓] Changes applied`. This creates `services`, `bookings`, `admin_sessions`.

The app auto-seeds the 10 service categories on first visit to `/api/services`, so no manual seeding needed.
(Your price edits afterwards are stored in this Neon DB and show instantly on the live site.)

### 3. Push this code to GitHub

```bash
git init
git add .
git commit -m "Divine Empress Hair — Netlify ready"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/divine-empress-hair.git
git push -u origin main
```

### 4. Connect Netlify

1. Go to https://app.netlify.com → Add new site → Import an existing project → GitHub → pick your repo
2. Netlify auto-detects from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Before deploying, open **Site settings → Environment variables** and add:
   - `DATABASE_URL` = your Neon connection string (from step 1)
   - `ADMIN_USERNAME` = `Storm`
   - `ADMIN_PASSWORD` = `Caleb27/02`
   - `NODE_VERSION` = `20`
4. Click **Deploy site**

First build takes ~2–3 minutes. You get a URL like `https://divine-empress-hair.netlify.app`.

### 5. Test production

- Open your Netlify URL → Services & Prices should load (auto-seeded from defaults)
- Click **Admin Login** → log in as `Storm` → change a price → refresh → price persists
- Submit a test booking → check it appears in Admin → Bookings tab

### 6. (Optional) Custom domain + logo

- Netlify → Domain settings → Add custom domain (e.g. `divineempresshair.co.za`)
- Favicon/logo is already `public/images/logo.png` — no action needed.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails: `DATABASE_URL is required` | Fixed in code — rebuild. If still failing, make sure you deployed the latest commit with `src/db/index.ts` fallback. |
| Site loads but Services show defaults / edits don't save | `DATABASE_URL` not set or wrong in Netlify env vars. Check Site settings → Environment → `DATABASE_URL`, then **Deploys → Trigger deploy → Clear cache and deploy**. |
| `self-signed certificate` / SSL error | `src/db/index.ts` already sets `ssl: { rejectUnauthorized: false }` when URL contains `neon.tech` / `sslmode=require`. Make sure your Neon URL includes `?sslmode=require`. |
| Admin login fails on live site, works locally | You set different `ADMIN_PASSWORD` in Netlify env vars. Use exactly `Caleb27/02` (note the `/`). |
| `Page not found` on refresh of `/admin` | Make sure `netlify.toml` with `@netlify/plugin-nextjs` was pushed. Check Netlify build log for `Next.js Runtime` loaded. |

## Keeping local dev working

Your local `.env` still points at `127.0.0.1:5432/app_db` — `npm run dev` is unchanged.
Only production (Netlify) uses the Neon URL.
