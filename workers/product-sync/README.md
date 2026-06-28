# product-sync (Cloudflare Worker)

Scheduled Worker that keeps the D1 product catalog fresh from the Amazon Product
Advertising API (PA-API 5.0). It binds the **same D1 database** as the Pages app
directly (`DB` binding) — no HTTP API, no Cloudflare credentials, no cross-cloud.

```
Cron Triggers ──▶ product-sync Worker ──▶ Amazon PA-API
                                     └──▶ D1 (DB binding)
```

## Why a separate Worker?

Cloudflare **Pages** can't run Cron Triggers, so the scheduled job lives in a
standalone Worker that binds the same `aikinsselect-db`. The site stays on Pages.

## Modes

| mode | trigger | what it does |
|------|---------|--------------|
| `ping`    | manual | No PA-API. Returns D1 status counts. **Test this first.** |
| `refresh` | cron `0 9 * * *` (daily 09:00 UTC) | Re-check price/image/availability for published products; archive items PA-API misses twice running. |
| `gather`  | cron `0 10 * * 1` (Mon 10:00 UTC) | Search PA-API per category, dedup by ASIN, insert new products. |
| `both`    | manual | refresh then gather |

> PA-API 5.0 has no star ratings, so `rating` is never overwritten — only
> `price`, `image_url`, `availability`, `last_checked_at`.

## Deploy

```bash
cd workers/product-sync
npm install

# secrets (vars like AMAZON_PARTNER_TAG live in wrangler.jsonc)
npx wrangler secret put AMAZON_ACCESS_KEY
npx wrangler secret put AMAZON_SECRET_KEY
npx wrangler secret put SYNC_SECRET        # any long random string; guards the manual endpoint

npx wrangler deploy
```

The D1 binding is already declared in `wrangler.jsonc`. The deploying account
must have access to the `aikinsselect-db` database.

## Test

```bash
# local dev against the bound D1 (no PA-API needed for ping)
npm run dev
curl "http://localhost:8787/?mode=ping" -H "Authorization: Bearer <SYNC_SECRET>"

# trigger a scheduled run locally
npx wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=0+9+*+*+*"

# in production
curl "https://aikinsselect-product-sync.<your-subdomain>.workers.dev/?mode=ping" \
  -H "Authorization: Bearer <SYNC_SECRET>"
```

## Prerequisites

- **Amazon PA-API access** — credentials require 3+ qualifying affiliate sales in
  180 days. Until granted, only `mode=ping` works; `refresh`/`gather` will error on
  the PA-API call. The code is ready; add the two Amazon secrets when approved.

## Retirement model

- Never hard-deletes. Retiring sets `status='archived'` (table CHECK allows
  `draft | published | archived`). Listing queries in `lib/db.ts` filter
  `status='published'`, so archived rows vanish from the site automatically.
- `availability` = `in_stock | out_of_stock | unavailable`. A product is archived
  only after PA-API fails to return it twice running. Temporary `out_of_stock`
  never archives — age is not a retirement signal.

## Schedules

Defined in `wrangler.jsonc` under `triggers.crons`. Edit there and redeploy to
change cadence. View runs in the Cloudflare dashboard (Workers → this Worker →
Logs / Cron) or `npx wrangler tail`.
