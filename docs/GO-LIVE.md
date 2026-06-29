# Aikins Select — Go-Live Runbook

Status as of 2026-06-29. The app **builds clean** and the catalog data has been remediated
(see `docs/data-integrity/`). Deployment is **git-connected**: pushing to `main` auto-builds
and deploys on Cloudflare Pages.

---

## 0. 🔴 BLOCKER — rotate the exposed credentials (do this first)

The repo is **public**, and a live Cloudflare API token was committed to git history
(commit `58f5c92`) and was hardcoded in the scraper scripts. **Anyone can use it to
read/modify/delete the production D1 database.** Rotating it does **not** break production
— the live site reads D1 through the Cloudflare *binding* (`env.DB`), not this token.

1. **Cloudflare** → My Profile → API Tokens → the D1 token → **Roll** (or delete + recreate).
   The old value dies instantly, making its presence in public history harmless.
2. Put the new value in `Code/.env.local` and `scraper/.env` (local only — both gitignored).
3. **Supabase** → rotate the service key (it was in the orphaned Gen-1 scraper scripts).
4. Source files have been scrubbed to read these from env only (no hardcoded fallbacks left),
   so a rotated key is all that's needed.

> Optional hardening: rewrite git history (BFG/`git filter-repo`) to purge the old token, and/or
> make the repo private. Not required once the token is revoked — revocation is the real fix.

---

## 1. Deploy (git-connected — already automatic)

Merging/pushing to `main` triggers a Cloudflare Pages production build. Verify in the
**Cloudflare Pages dashboard** for project `aikinsselect`:

- **Build command:** `npx @cloudflare/next-on-pages` (matches `npm run pages:build`)
- **Build output dir:** `.vercel/output/static`
- **Production branch:** `main`
- **D1 binding:** Settings → Functions → D1 database bindings → `DB` = `aikinsselect-db`
  (`5df12367-0bd2-4568-9437-0090a640c47e`) on **Production** (and Preview). This is what the
  live site uses; without it every page returns empty data.
- **Compatibility:** `nodejs_compat` flag + a recent compatibility date (see `wrangler.jsonc`).

Local verification before pushing: `npm run build` (✅ currently green) and
`npm run validate-catalog` (✅ 0 errors).

---

## 2. Custom domain

Cloudflare Pages → the project → **Custom domains** → add `aikinsselect.com` (+ `www`).
DNS + SSL are provisioned by Cloudflare. Confirm `metadataBase`/`SITE_URL` (`lib/seo.ts`)
matches the final domain (`https://aikinsselect.com`).

---

## 3. Amazon Associates (so the 3 sales count)

- Register the live site URL (`aikinsselect.com`) in your Associates account.
- New Associate accounts must make **3 qualifying sales within 180 days** or the account
  closes — and those sales are also what unlock **PA-API**.
- Qualifying = a *different person* clicks your tagged link and buys within 24h. **Never** buy
  through your own links, and don't reimburse/return — Amazon bans self-referral.
- Affiliate tag `aikinsselect-20` is already live on all published products (0 untagged).

---

## 4. Data state at launch

| Area | State |
|---|---|
| Review→product links | ✅ corrected; contaminated/archived links fixed; guard enforces type/links |
| Ratings | nulled (no fake 4.5s) — no star ratings show until real Aikins Scores exist |
| Prices | real prices unavailable pre-PA-API; absurd scraped values nulled → "Check price on Amazon" |
| Availability | not populated (PA-API job) |
| Images | present for most; some missing → placeholder |
| Affiliate links | ✅ all tagged `aikinsselect-20` |

Known thin/edge cases (non-blocking, tracked as guard WARNs): `best-power-bank` (1 pick),
`best-gaming-mouse` rank gap, ~13 prose-fragment slugs, bare Auto/Outdoors category pages.

---

## 5. Post-launch (after first sales → PA-API unlocks)

1. **Prices/images/availability** — deploy `Code/workers/product-sync` with Amazon secrets
   (`wrangler secret put AMAZON_ACCESS_KEY` / `AMAZON_SECRET_KEY`; `AMAZON_PARTNER_TAG` var),
   then `GET /?mode=refresh`. Auto-archives discontinued items; populates real data for the
   326 ASIN products. Daily cron keeps it fresh. (Uses the D1 binding — no CF token needed.)
2. **Real ratings + content** — run the scored generator per topic
   (`cd scraper && npm run generate -- "best X"`) for computed Aikins Scores, clean
   names/slugs, pros/cons. Needs the rotated CF token + Brave + an LLM key in `scraper/.env`.
   Preview with `npm run generate:dry -- "best X"` (no DB writes).
3. **SEO** — submit `https://aikinsselect.com/sitemap.xml` to Google Search Console; run the
   Rich Results Test on a review and a product URL.
4. **Multi-retailer** (Best Buy/Walmart) — defer; add later via one aggregator (Impact.com /
   Skimlinks), not per-retailer APIs. The product schema already has slots.

---

## 6. Guardrail

`npm run validate-catalog` is the pre-deploy data-integrity gate (exits non-zero on ERRORs:
wrong-type picks, archived/orphan links, empty reviews, placeholder ratings). Run it before
each deploy; consider wiring it into CI.
