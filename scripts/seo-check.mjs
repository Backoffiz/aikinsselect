/**
 * SEO runtime crawl — post-deploy / nightly regression check against the LIVE site.
 *
 * Fetches the rendered HTML of representative pages and asserts the on-page SEO invariants that
 * only exist at runtime: a real <title>, a meta description, a canonical that points at the
 * production origin (not a preview/localhost host leaking through), a single <h1>, honest robots
 * directives, Open Graph tags, and JSON-LD that actually parses. It also sanity-checks
 * /sitemap.xml and /robots.txt. Dynamic sample URLs (a real review/product/category) are
 * discovered from the sitemap, so the check tracks the live catalog without a hardcoded slug.
 *
 * This is the runtime half of SEO monitoring; scripts/seo-lint-source.mjs is the source half.
 *
 * Run from the Code/ directory:
 *   npm run seo:check                       # checks production (SITE_URL default)
 *   npm run seo:check -- https://<preview>  # checks a preview / localhost deploy
 *
 * Canonical/sitemap host is always validated against the PRODUCTION origin (SITE_URL), never the
 * fetch target — a preview build correctly emits production canonicals, and a canonical that
 * points anywhere else is the actual bug we want to catch.
 *
 * Exit code 1 if any ERROR-level issue is found (suitable for CI); WARN-level issues are
 * reported but don't fail the run. No dependencies, no secrets.
 */

// Production origin the canonicals/sitemap must reference. Mirrors lib/seo.ts SITE_URL;
// override with the SITE_URL env var if the canonical domain ever changes.
const PROD_ORIGIN = new URL(process.env.SITE_URL || 'https://aikinsselect.com').origin

// What to fetch: default to production; allow an explicit target (preview/localhost) as argv[2].
const TARGET = (process.argv[2] || process.env.SEO_CHECK_URL || PROD_ORIGIN).replace(/\/+$/, '')

const issues = []
const add = (level, check, detail) => issues.push({ level, check, detail })

// --- tiny HTML helpers (regex, not a DOM — fine for well-formed <head> tags) ---
async function fetchText(url, { retries = 2 } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'AikinsSelect-SEO-Check' } })
      const body = await res.text()
      return { status: res.status, body, contentType: res.headers.get('content-type') || '' }
    } catch (e) {
      lastErr = e
    }
  }
  return { status: 0, body: '', contentType: '', error: lastErr }
}

/** Parse a tag's attributes (order-independent) into a lowercased-key map. */
function attrs(tag) {
  const map = {}
  for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*"([^"]*)"/g)) map[m[1].toLowerCase()] = m[2]
  return map
}
const metaTags = (html) => [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]))
const linkTags = (html) => [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]))
function metaByName(html, name) {
  const t = metaTags(html).find((a) => (a.name || '').toLowerCase() === name.toLowerCase())
  return t?.content
}
function metaByProperty(html, prop) {
  const t = metaTags(html).find((a) => (a.property || '').toLowerCase() === prop.toLowerCase())
  return t?.content
}
function canonicalHref(html) {
  const t = linkTags(html).find((a) => (a.rel || '').toLowerCase() === 'canonical')
  return t?.href
}
const titleText = (html) => html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()
const h1Count = (html) => (html.match(/<h1\b/gi) || []).length
function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim())
}

// --- per-page check --------------------------------------------------------
async function checkPage(pathname, opts = {}) {
  const { expectNoindex = false, expectStructuredData = false, expectTypes = [] } = opts
  const url = TARGET + pathname
  const { status, body, error } = await fetchText(url)

  if (status !== 200) {
    add('ERROR', 'http-status', `${pathname}: returned ${status || 'network error'}${error ? ` (${error.message})` : ''}`)
    return
  }

  const title = titleText(body)
  if (!title) add('ERROR', 'missing-title', `${pathname}: no <title>`)
  else if (title.length > 65) add('WARN', 'long-title', `${pathname}: title is ${title.length} chars (aim ≤ 60): "${title.slice(0, 70)}…"`)
  else if (title.length < 15) add('WARN', 'short-title', `${pathname}: title is only ${title.length} chars: "${title}"`)

  const robots = (metaByName(body, 'robots') || '').toLowerCase()
  const isNoindex = robots.includes('noindex')

  if (expectNoindex) {
    if (!isNoindex) add('ERROR', 'lost-noindex', `${pathname}: expected noindex but robots is "${robots || '(none)'}"`)
    return // thin pages: title-only check is enough; skip description/canonical/OG scrutiny
  }
  if (isNoindex) add('ERROR', 'unexpected-noindex', `${pathname}: robots="${robots}" — an indexable page is set to noindex`)

  const desc = metaByName(body, 'description')
  if (!desc) add('ERROR', 'missing-description', `${pathname}: no meta description`)
  else if (desc.length > 165) add('WARN', 'long-description', `${pathname}: description is ${desc.length} chars (aim ≤ 160)`)
  else if (desc.length < 50) add('WARN', 'short-description', `${pathname}: description is only ${desc.length} chars`)

  const canonical = canonicalHref(body)
  if (!canonical) {
    add('ERROR', 'missing-canonical', `${pathname}: no <link rel="canonical">`)
  } else {
    let cOrigin
    try { cOrigin = new URL(canonical).origin } catch { /* relative/invalid */ }
    if (!cOrigin) add('ERROR', 'bad-canonical', `${pathname}: canonical is not an absolute URL: "${canonical}"`)
    else if (cOrigin !== PROD_ORIGIN) add('ERROR', 'canonical-wrong-host', `${pathname}: canonical points at ${cOrigin}, expected ${PROD_ORIGIN} (a preview/localhost origin leaked into canonical)`)
  }

  const h1s = h1Count(body)
  if (h1s === 0) add('ERROR', 'missing-h1', `${pathname}: no <h1>`)
  else if (h1s > 1) add('WARN', 'multiple-h1', `${pathname}: ${h1s} <h1> elements (prefer exactly one)`)

  if (!metaByProperty(body, 'og:title')) add('WARN', 'missing-og', `${pathname}: no og:title`)
  if (!metaByProperty(body, 'og:description')) add('WARN', 'missing-og', `${pathname}: no og:description`)
  if (!metaByProperty(body, 'og:image')) add('WARN', 'missing-og', `${pathname}: no og:image`)
  if (!metaByName(body, 'twitter:card')) add('WARN', 'missing-twitter', `${pathname}: no twitter:card`)

  const blocks = jsonLdBlocks(body)
  if (expectStructuredData && blocks.length === 0) {
    add('ERROR', 'missing-structured-data', `${pathname}: expected JSON-LD structured data, found none`)
  }
  const foundTypes = new Set()
  for (const raw of blocks) {
    let parsed
    try { parsed = JSON.parse(raw) } catch (e) {
      add('ERROR', 'invalid-json-ld', `${pathname}: a JSON-LD block does not parse (${e.message})`)
      continue
    }
    const collect = (node) => {
      if (!node || typeof node !== 'object') return
      if (Array.isArray(node)) return node.forEach(collect)
      if (node['@type']) [].concat(node['@type']).forEach((t) => foundTypes.add(t))
      if (Array.isArray(node['@graph'])) node['@graph'].forEach(collect)
      if (Array.isArray(node.itemListElement)) node.itemListElement.forEach((el) => collect(el?.item))
    }
    collect(parsed)
  }
  for (const t of expectTypes) {
    if (!foundTypes.has(t)) add('WARN', 'missing-schema-type', `${pathname}: JSON-LD is missing a ${t} node`)
  }
}

// --- sitemap + robots ------------------------------------------------------
async function checkSitemap() {
  const { status, body, contentType } = await fetchText(TARGET + '/sitemap.xml')
  if (status !== 200) { add('ERROR', 'sitemap', `/sitemap.xml returned ${status}`); return [] }
  if (!/xml/.test(contentType) && !body.trimStart().startsWith('<')) add('WARN', 'sitemap', `/sitemap.xml is not served as XML (content-type: ${contentType})`)

  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim())
  if (locs.length === 0) { add('ERROR', 'sitemap', '/sitemap.xml contains no <loc> URLs'); return [] }

  const offHost = locs.filter((u) => { try { return new URL(u).origin !== PROD_ORIGIN } catch { return true } })
  if (offHost.length) add('ERROR', 'sitemap-host', `${offHost.length} sitemap URL(s) are not on ${PROD_ORIGIN} (e.g. ${offHost[0]}) — a preview/localhost origin leaked into the sitemap`)

  const seen = new Set(); const dupes = new Set()
  for (const u of locs) { if (seen.has(u)) dupes.add(u); else seen.add(u) }
  if (dupes.size) add('WARN', 'sitemap-dupes', `${dupes.size} duplicate URL(s) in the sitemap`)

  console.log(`  sitemap: ${locs.length} URLs`)
  return locs
}

async function checkRobotsTxt() {
  const { status, body } = await fetchText(TARGET + '/robots.txt')
  if (status !== 200) { add('ERROR', 'robots-txt', `/robots.txt returned ${status}`); return }
  if (/^\s*disallow:\s*\/\s*$/im.test(body) && !/^\s*allow:\s*\//im.test(body)) {
    add('ERROR', 'robots-txt', '/robots.txt disallows the entire site')
  }
  if (!/sitemap:/i.test(body)) add('WARN', 'robots-txt', '/robots.txt does not reference a sitemap')
  else if (!new RegExp(`sitemap:\\s*${PROD_ORIGIN}`, 'i').test(body)) {
    add('WARN', 'robots-txt', `/robots.txt sitemap line does not point at ${PROD_ORIGIN}`)
  }
}

/** Pick the first sitemap URL whose path matches a prefix, returned as a pathname. */
function samplePath(locs, prefix) {
  const hit = locs.map((u) => { try { return new URL(u).pathname } catch { return '' } }).find((p) => p.startsWith(prefix) && p !== prefix)
  return hit
}

// --- run -------------------------------------------------------------------
async function main() {
  console.log(`\nSEO runtime check — target ${TARGET} (canonical origin ${PROD_ORIGIN})\n`)

  const locs = await checkSitemap()
  await checkRobotsTxt()

  // Fixed hub/static pages that must always be healthy.
  await checkPage('/', { expectStructuredData: true, expectTypes: ['Organization', 'WebSite'] })
  await checkPage('/reviews')
  await checkPage('/categories')
  await checkPage('/how-we-review', { expectStructuredData: true })
  await checkPage('/search', { expectNoindex: true })

  // Dynamic samples discovered from the sitemap, so the check follows the live catalog.
  const reviewPath = samplePath(locs, '/reviews/')
  const productPath = samplePath(locs, '/products/')
  const categoryPath = samplePath(locs, '/categories/')
  if (reviewPath) await checkPage(reviewPath, { expectStructuredData: true, expectTypes: ['Article', 'BreadcrumbList'] })
  else add('WARN', 'no-sample', 'no /reviews/<slug> URL in the sitemap to sample')
  if (productPath) await checkPage(productPath, { expectStructuredData: true, expectTypes: ['BreadcrumbList'] })
  else add('WARN', 'no-sample', 'no /products/<slug> URL in the sitemap to sample')
  if (categoryPath) await checkPage(categoryPath, { expectStructuredData: true })
  else add('WARN', 'no-sample', 'no /categories/<slug> URL in the sitemap to sample')

  // --- report ---
  const errors = issues.filter((i) => i.level === 'ERROR')
  const warns = issues.filter((i) => i.level === 'WARN')
  const byCheck = (arr) => {
    const groups = {}
    for (const i of arr) (groups[i.check] ||= []).push(i.detail)
    return groups
  }
  console.log('')
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
    console.log('FAIL — a live SEO regression is present.')
    process.exit(1)
  }
  console.log('PASS — no live SEO regressions.')
}

main().catch((e) => {
  console.error('seo-check failed:', e)
  process.exit(1)
})
