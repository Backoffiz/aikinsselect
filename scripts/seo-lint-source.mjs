/**
 * SEO source lint — PR-time regression gate (no network, no DB, no build).
 *
 * Catches the SEO regressions that get introduced in *source* and would otherwise ship
 * silently: a page losing its canonical, an accidental `noindex` on an indexable page, a
 * deleted JSON-LD builder, a broken sitemap/robots route. It reads the app/ + lib/ source
 * files directly, so it's fast and deterministic and runs on every pull request before the
 * change is ever deployed.
 *
 * This is the cheap, always-on half of SEO monitoring. The runtime crawl (scripts/seo-check.mjs)
 * is the other half — it verifies the *rendered* pages on the live site post-deploy.
 *
 * Run from the Code/ directory:
 *   npm run seo:lint
 *
 * Exit code 1 if any ERROR-level issue is found (suitable for CI); WARN-level issues are
 * reported but don't fail the run. Nothing here is hardcoded beyond the route inventory below,
 * which is intentionally explicit so that adding a public route without SEO wiring fails loudly.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const exists = (p) => fs.existsSync(path.join(ROOT, p))

const issues = []
const add = (level, check, detail) => issues.push({ level, check, detail })

/**
 * Public, indexable routes. Each must resolve a canonical URL — either a static
 * `alternates: { canonical: ... }` or a `canonical` computed inside generateMetadata.
 * `dynamic: true` pages build metadata in generateMetadata(); static pages export `metadata`.
 */
const INDEXABLE_ROUTES = [
  { file: 'app/page.tsx', label: 'home' },
  { file: 'app/reviews/page.tsx', label: 'reviews index' },
  { file: 'app/reviews/[slug]/page.tsx', label: 'review detail', dynamic: true },
  { file: 'app/categories/page.tsx', label: 'categories index' },
  { file: 'app/categories/[slug]/page.tsx', label: 'category detail', dynamic: true },
  { file: 'app/products/[slug]/page.tsx', label: 'product detail', dynamic: true },
  { file: 'app/how-we-review/page.tsx', label: 'how-we-review' },
  { file: 'app/about/page.tsx', label: 'about' },
  { file: 'app/disclosure/page.tsx', label: 'disclosure' },
  { file: 'app/privacy/page.tsx', label: 'privacy' },
]

/** Routes that MUST stay out of the index (thin/duplicate/user-specific). */
const NOINDEX_ROUTES = [
  { file: 'app/search/page.tsx', label: 'search' },
  { file: 'app/saved/page.tsx', label: 'saved' },
]

/** Pages that surface JSON-LD structured data via <JsonLd> (an SEO asset we don't want to lose). */
const STRUCTURED_DATA_ROUTES = [
  'app/page.tsx',
  'app/reviews/[slug]/page.tsx',
  'app/categories/[slug]/page.tsx',
  'app/products/[slug]/page.tsx',
  'app/how-we-review/page.tsx',
]

// --- route-level metadata checks -------------------------------------------
for (const route of INDEXABLE_ROUTES) {
  if (!exists(route.file)) {
    add('ERROR', 'missing-route', `${route.label}: expected ${route.file} to exist`)
    continue
  }
  const src = read(route.file)

  // Matches both a static `alternates: { canonical: '/x' }` and the dynamic object-shorthand
  // `alternates: { canonical }` (canonical computed above in generateMetadata).
  const hasCanonical = /alternates\s*:\s*\{[^}]*canonical/.test(src)
  if (!hasCanonical) {
    add('ERROR', 'missing-canonical', `${route.label} (${route.file}): no canonical URL — set alternates.canonical`)
  }

  if (route.dynamic && !/export\s+async\s+function\s+generateMetadata/.test(src)) {
    add('ERROR', 'missing-metadata', `${route.label} (${route.file}): dynamic page has no generateMetadata()`)
  }
  if (!route.dynamic && !/export\s+const\s+metadata\s*[:=]/.test(src)) {
    add('ERROR', 'missing-metadata', `${route.label} (${route.file}): static page exports no metadata object`)
  }

  // An indexable page must NOT declare index:false. (Whitespace-tolerant.)
  if (/index\s*:\s*false/.test(src)) {
    add('ERROR', 'unexpected-noindex', `${route.label} (${route.file}): declares index:false but is a public page — it will be deindexed`)
  }
}

// --- noindex routes must STAY noindex --------------------------------------
for (const route of NOINDEX_ROUTES) {
  if (!exists(route.file)) continue // deleting a noindex page is fine
  const src = read(route.file)
  if (!/index\s*:\s*false/.test(src)) {
    add('ERROR', 'lost-noindex', `${route.label} (${route.file}): should be noindex (thin/duplicate) but index:false is gone`)
  }
}

// --- structured data must remain wired -------------------------------------
for (const file of STRUCTURED_DATA_ROUTES) {
  if (!exists(file)) {
    add('ERROR', 'missing-route', `structured-data page ${file} is missing`)
    continue
  }
  const src = read(file)
  if (!/<JsonLd\b/.test(src)) {
    add('ERROR', 'missing-structured-data', `${file}: <JsonLd> render was removed — this page no longer emits structured data`)
  }
}

// --- lib/seo.ts builder surface --------------------------------------------
// The pages import these by name; if a refactor drops one, the structured-data graph breaks.
const SEO_EXPORTS = [
  'SITE_URL', 'SITE_NAME', 'jsonLdGraph', 'organizationNode', 'websiteNode', 'editorialTeamNode',
  'breadcrumbNode', 'productNode', 'itemListNode', 'articleNode',
]
if (!exists('lib/seo.ts')) {
  add('ERROR', 'missing-seo-lib', 'lib/seo.ts is missing — all structured data depends on it')
} else {
  const seo = read('lib/seo.ts')
  for (const name of SEO_EXPORTS) {
    const re = new RegExp(`export\\s+(?:async\\s+)?(?:function|const)\\s+${name}\\b`)
    if (!re.test(seo)) {
      add('ERROR', 'missing-seo-export', `lib/seo.ts no longer exports ${name}() — a page imports it`)
    }
  }
  // We must never fabricate ratings/review counts in structured data (Google rich-result policy
  // + our content-honesty rule). Flag the schema.org property names appearing as object keys.
  for (const forbidden of ['aggregateRating', 'reviewCount', 'ratingCount']) {
    if (new RegExp(`['"\`]?${forbidden}['"\`]?\\s*:`).test(seo)) {
      add('WARN', 'fabricated-rating-risk', `lib/seo.ts references ${forbidden} — only emit it from REAL aggregated data, never a constant`)
    }
  }
}

// --- sitemap + robots routes exist -----------------------------------------
for (const file of ['app/sitemap.ts', 'app/robots.ts']) {
  if (!exists(file)) add('ERROR', 'missing-route', `${file} is missing — ${file.includes('sitemap') ? 'crawlers lose the URL inventory' : 'crawlers lose crawl directives'}`)
}
if (exists('app/robots.ts')) {
  const robots = read('app/robots.ts')
  // A blanket disallow of everything would deindex the whole site.
  if (/disallow\s*:\s*['"`]\/['"`]/i.test(robots) && !/allow\s*:\s*['"`]\//i.test(robots)) {
    add('ERROR', 'robots-blanket-disallow', 'app/robots.ts disallows "/" without an allow — this blocks the entire site')
  }
  if (!/sitemap\s*:/.test(robots)) {
    add('WARN', 'robots-no-sitemap', 'app/robots.ts does not reference the sitemap')
  }
}

// --- report ----------------------------------------------------------------
const errors = issues.filter((i) => i.level === 'ERROR')
const warns = issues.filter((i) => i.level === 'WARN')
const byCheck = (arr) => {
  const groups = {}
  for (const i of arr) (groups[i.check] ||= []).push(i.detail)
  return groups
}

console.log(`\nSEO source lint — ${INDEXABLE_ROUTES.length} indexable routes, ${STRUCTURED_DATA_ROUTES.length} structured-data pages\n`)
for (const [check, details] of Object.entries(byCheck(errors))) {
  console.log(`ERROR [${check}] (${details.length})`)
  for (const d of details) console.log(`   - ${d}`)
}
for (const [check, details] of Object.entries(byCheck(warns))) {
  console.log(`WARN  [${check}] (${details.length})`)
  for (const d of details) console.log(`   - ${d}`)
}

console.log(`\n${errors.length} error(s), ${warns.length} warning(s).`)
if (errors.length) {
  console.log('FAIL — an SEO regression is present in source. Fix before merging.')
  process.exit(1)
}
console.log('PASS — no SEO source regressions.')
