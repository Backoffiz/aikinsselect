# product-sync

Scheduled Supabase Edge Function that keeps the Cloudflare D1 product catalog
fresh from the Amazon Product Advertising API (PA-API 5.0).

```
Supabase Cron ──▶ product-sync (Deno) ──▶ Amazon PA-API
                                      └──▶ Cloudflare D1 (HTTP API)
```

## Modes

| `?mode=` | What it does |
|----------|--------------|
| `ping`    | No PA-API. Verifies D1 connectivity + returns status counts. **Test this first.** |
| `refresh` | Re-checks every published product (price, image, availability), stamps `last_checked_at`. Items PA-API can't return twice in a row are archived. |
| `gather`  | Searches PA-API per category, dedups by ASIN, inserts up to `GATHER_PER_CATEGORY` new products each. |
| `both`    | `refresh` then `gather`. |

> PA-API 5.0 does **not** expose star ratings, so `rating` is never overwritten —
> only `price`, `image_url`, `availability`, `last_checked_at`.

## Prerequisites

- **Amazon PA-API access.** Credentials require 3+ qualifying affiliate sales in
  180 days. Until granted, only `mode=ping` works; `refresh`/`gather` will 500 on
  the PA-API call. The code is ready — just add creds when Amazon approves.
- **Cloudflare API token** scoped to **D1 → Edit** for database `aikinsselect-db`.

## Deploy

```bash
# one-time
supabase login
supabase link --project-ref <PROJECT_REF>

# secrets
supabase secrets set \
  SYNC_SECRET=<random-long-string> \
  AMAZON_ACCESS_KEY=<paapi-access-key> \
  AMAZON_SECRET_KEY=<paapi-secret-key> \
  AMAZON_PARTNER_TAG=aikinsselect-20 \
  CF_ACCOUNT_ID=<cloudflare-account-id> \
  CF_API_TOKEN=<cloudflare-d1-edit-token> \
  CF_D1_DATABASE_ID=5df12367-0bd2-4568-9437-0090a640c47e

# deploy (no-verify-jwt: we guard with our own SYNC_SECRET instead of a Supabase JWT)
supabase functions deploy product-sync --no-verify-jwt
```

Optional secrets: `AMAZON_REGION` (default `us-east-1`), `AMAZON_HOST`
(`webservices.amazon.com`), `AMAZON_MARKETPLACE` (`www.amazon.com`),
`REFRESH_LIMIT` (`1000`), `GATHER_PER_CATEGORY` (`3`).

## Test

```bash
# should return D1 status counts
curl -H "Authorization: Bearer <SYNC_SECRET>" \
  "https://<PROJECT_REF>.supabase.co/functions/v1/product-sync?mode=ping"

# dry single refresh once PA-API creds are live
curl -H "Authorization: Bearer <SYNC_SECRET>" \
  "https://<PROJECT_REF>.supabase.co/functions/v1/product-sync?mode=refresh"
```

## Schedule

After the function is deployed and `ping` works, run `supabase/cron.sql` in the
Supabase SQL editor (fill in `<PROJECT_REF>` and `<SYNC_SECRET>`). It installs a
daily `refresh` and a weekly `gather`.

## Retirement model

- Products are never hard-deleted. Retiring sets `status = 'archived'`
  (allowed by the table CHECK constraint: `draft | published | archived`).
- `availability` tracks `in_stock | out_of_stock | unavailable`.
- A product is archived only after PA-API fails to return it **twice running**
  (`availability` already `unavailable` → archive). Temporary `out_of_stock`
  never archives — age is not a retirement signal.
- Listing queries in `lib/db.ts` filter `status = 'published'`, so archived
  products vanish from the site automatically while the row (and its ASIN
  history) is preserved.
