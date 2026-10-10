# InstaMealz

Next.js storefront with Razorpay checkout, Turso orders, Resend confirmation emails, and an admin orders dashboard.

## Environments (`sbx` vs `prod`)

Each environment has its **own env file** (not committed):

| File | Use |
|------|-----|
| `.env.sbx.local` | Sandbox — Razorpay **test** keys, staging Turso DB |
| `.env.prod.local` | Production — Razorpay **live** keys, production Turso DB |

Templates: [`.env.sbx.example`](.env.sbx.example), [`.env.prod.example`](.env.prod.example).

### One-time setup (Windows PowerShell)

```powershell
copy .env.sbx.example .env.sbx.local
copy .env.prod.example .env.prod.local
```

Then edit each `.env.*.local` file with the correct Turso URL/token, Razorpay keys, and `ADMIN_ACCESS_KEY` (for `/admin`).

### Admin orders dashboard

Set `ADMIN_ACCESS_KEY` in your env file, then open [http://localhost:3000/admin](http://localhost:3000/admin) and sign in with that key. The URL is not linked from the public site.

### Local dev commands

```bash
# Sandbox (default) — test payments
npm run dev:sbx

# Same as dev:sbx
npm run dev

# Production credentials locally — real charges; use with care
npm run dev:prod
```

### Build / start

```bash
npm run build:sbx    # build using .env.sbx.local
npm run build:prod   # build using .env.prod.local (alias: npm run build)
npm run start:sbx    # after build:sbx
npm run start:prod   # after build:prod
```

On Vercel (or similar), set env vars on each deployment — you do not upload `.env.*.local`; use the dashboard with the same variable names as in the example files.

## Checkout (Razorpay + Turso)

1. Apply [`sql/schema.sql`](sql/schema.sql) on **both** Turso databases (sandbox and production).
2. Fill `.env.sbx.local` and `.env.prod.local`.
3. Run `npm run dev:sbx` and complete a Razorpay **test** payment on `/checkout`.

Payment completion is **client-driven**: after Razorpay succeeds, the browser calls `POST /api/checkout/verify` to verify the signature, mark the order completed, and send the confirmation email. There is no Razorpay server webhook in this repo.

## Production deploy

1. Create or reset the production Turso database and apply [`sql/schema.sql`](sql/schema.sql).
2. Configure the host (e.g. Vercel) with variables from [`.env.prod.example`](.env.prod.example):
   - `INSTAMEALZ_ENV=prod`
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (live mode)
   - `INSTAMEALZ_SITE_URL` (public origin, no trailing slash)
   - `RESEND_API_KEY`, `EMAIL_FROM` (optional but recommended)
   - `ADMIN_ACCESS_KEY`
3. Run `npm run build:prod` locally or let CI run `npm run build` (defaults to prod).
4. Smoke-test checkout in Razorpay test mode on staging before switching live keys on production.

## Email templates

See [`emails/README.md`](emails/README.md) for previewing `order-confirmation.html`.
