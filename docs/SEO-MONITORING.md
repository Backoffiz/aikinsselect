# SEO monitoring

Automated, **propose-only** SEO regression monitoring. Nothing here edits the site or the code —
it gates pull requests, crawls the live site after deploy, and (when a regression is found) files a
GitHub issue for a human to action. Rankings and content decisions stay with you; the machine
watches for the mechanical failures that silently tank SEO.

## The three layers

| Layer | Script | Runs | Needs | Fails the run? |
|-------|--------|------|-------|----------------|
| **Source lint** | `scripts/seo-lint-source.mjs` | every pull request | nothing (reads source) | yes — blocks the merge |
| **Runtime crawl** | `scripts/seo-check.mjs` | push to `main` + nightly | a live URL | yes — files an issue |
| **Search Console** | `scripts/gsc-report.mjs` | nightly + on demand | Google service account | no — report only |

Why this split: source lint is deterministic and instant, so it belongs at PR time where it can
*block* a regression before it ships. The runtime crawl needs a deployed URL, so it runs against
production after the Cloudflare Pages deploy settles (and nightly as the authoritative check). GSC
is the real ranking signal (impressions/clicks/queries) but lags a few days and is informational,
so it reports rather than gates.

## What each check catches

**Source lint** (`npm run seo:lint`) — reads `app/` + `lib/seo.ts`:
- a public route losing its `canonical`
- an accidental `noindex` on an indexable page (or a thin page *losing* its intended noindex)
- a page dropping its `<JsonLd>` structured-data render
- `lib/seo.ts` no longer exporting a builder that a page imports
- `robots.ts`/`sitemap.ts` deleted, or robots blanket-disallowing the site
- a hardcoded `aggregateRating`/`reviewCount` sneaking into structured data (we only emit ratings
  from real data — never a constant)

**Runtime crawl** (`npm run seo:check [-- <url>]`) — fetches rendered HTML of the home page, hub
pages, `/how-we-review`, `/search`, and a live sample review/product/category discovered from the
sitemap, then asserts:
- HTTP 200, a real `<title>`, a meta description, exactly one `<h1>`
- a canonical that resolves to the **production origin** (catches a preview/localhost host leaking
  into `<link rel="canonical">` or into `sitemap.xml` — a real deindexing risk)
- honest robots directives (indexable pages not `noindex`; `/search` stays `noindex`)
- Open Graph + Twitter card tags
- JSON-LD that parses, with the expected schema types per page (Article + BreadcrumbList on
  reviews, etc.)
- `/sitemap.xml` and `/robots.txt` health

**Search Console** (`npm run seo:gsc`) — last-28-day totals, top queries, and top pages. Read-only.

## Local usage

```bash
npm run seo:lint                              # PR-time source checks
npm run seo:check                             # crawl production
npm run seo:check -- https://<preview>.pages.dev   # crawl a preview / http://localhost:3000
npm run seo:gsc                               # Search Console report (once configured)
```

`seo:check` validates canonicals/sitemap against the production origin regardless of which URL you
crawl, because a preview build *should* still emit production canonicals — anything else is the bug.
Override the expected origin with the `SITE_URL` env var if the canonical domain changes.

## The propose-only issue flow

When the nightly/post-deploy runtime crawl finds an ERROR, the workflow opens a GitHub issue
labeled `seo-regression` with the report, or updates the existing open one and comments that it's
still failing. It never commits a fix. Close the issue once you've addressed the finding; the next
green run leaves it closed.

---

## One-time setup: Google Search Console data

The GSC report is **inert until you complete these steps** — until then `seo:gsc` prints a pointer
here and exits cleanly, so CI is never blocked by missing credentials.

### 1. Verify the property in Search Console
1. Go to <https://search.google.com/search-console>.
2. Add a **Domain** property for `aikinsselect.com` (preferred — covers http/https + all
   subdomains). Verify via the DNS TXT record it gives you (add it in Cloudflare DNS).
   - The property string is then `sc-domain:aikinsselect.com`.
   - (If you use a **URL-prefix** property instead, the string is `https://aikinsselect.com/`.)

> New properties have **no data for ~2–3 days** and little until Google crawls the site. An empty
> report is expected at first — it is not an error.

### 2. Create a service account + key (Google Cloud)
1. In <https://console.cloud.google.com>, create (or pick) a project.
2. **APIs & Services → Library → enable "Google Search Console API"**.
3. **APIs & Services → Credentials → Create credentials → Service account.** Name it e.g.
   `seo-monitor`. No project roles are needed (access is granted per-property in the next step).
4. Open the service account → **Keys → Add key → Create new key → JSON**. Download the JSON file.
   Note the service account's email (`...@<project>.iam.gserviceaccount.com`).

### 3. Grant the service account read access to the property
1. Back in Search Console → the property → **Settings → Users and permissions → Add user**.
2. Add the service-account **email** with the **Full** (or **Restricted**) role.

### 4. Provide the credentials
**Locally** — add to `.env.local` (gitignored). Never commit the key.
```
GSC_PROPERTY=sc-domain:aikinsselect.com
GSC_SERVICE_ACCOUNT_FILE=./.gsc-key.json     # path to the downloaded JSON (also gitignore it)
```
Then: `npm run seo:gsc`.

**In CI** — add two repository secrets (GitHub → Settings → Secrets and variables → Actions):
- `GSC_PROPERTY` = `sc-domain:aikinsselect.com`
- `GSC_SERVICE_ACCOUNT_KEY` = the **entire contents** of the JSON key file (paste inline)

The nightly workflow picks these up automatically. No key is ever stored in the repo.

## Cadence — is daily the right frequency?

Daily is right for the *monitoring* here because these runs are cheap and read-only and catch
regressions the day they appear. It is **not** the cadence for content or ranking work: for a young
site, rankings move weekly-to-monthly, so review the GSC trend weekly, not daily. The automation
watches the plumbing so you can spend attention on the content.
