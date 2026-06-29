/**
 * Catalog data-integrity guard.
 *
 * Validates the live D1 catalog against the failure modes that have actually bitten us:
 * wrong products on a review page (e.g. "Best Blender" showing air fryers), archived
 * products still linked into reviews (review pages don't filter by status), reviews with
 * too few / no picks, non-contiguous ranks, and scraper-mangled product names/slugs.
 *
 * Run from the Code/ directory:
 *   npm run validate-catalog
 *
 * Exit code 1 if any ERROR-level violation is found (suitable for CI / pre-deploy);
 * WARN-level issues are reported but don't fail the run.
 *
 * Credentials are read from .env.local (gitignored) or the process environment:
 *   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID
 * Nothing is hardcoded.
 */
import fs from 'node:fs'
import path from 'node:path'

// --- env -------------------------------------------------------------------
function loadEnvLocal() {
  const file = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnvLocal()

const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID } = process.env
if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !D1_DATABASE_ID) {
  console.error('Missing D1 credentials. Set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID in .env.local or the environment.')
  process.exit(1)
}

async function d1(sql, params = []) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    },
  )
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error('D1 query failed: ' + JSON.stringify(data.errors || `HTTP ${res.status}`))
  }
  return data.result?.[0]?.results ?? []
}

// --- config ----------------------------------------------------------------
const MIN_PICKS = 3 // a published "best X" review should compare at least this many products

/**
 * Per-review DENY tokens: substrings that must NOT appear in a linked product's name.
 * These encode the cross-type contamination we've actually seen, so the same class of bug
 * (brand/keyword matching pulling in the wrong product type) fails loudly next time.
 * Reviews not listed here skip the type check but still get all the structural checks.
 */
const REVIEW_DENY = {
  'best-blender': ['air fryer', 'airfryer', 'crispi', 'creami', 'ice cream', 'coffee', 'espresso', 'toaster', 'rice cooker'],
  'best-air-fryer': ['blender', 'coffee', 'espresso', 'ice cream', 'creami', 'rice cooker', 'knife', 'skillet', 'dutch oven', 'stand mixer'],
  'best-coffee-maker': ['air fryer', 'airfryer', 'blender', 'toaster', 'rice cooker', 'knife', 'skillet', 'dutch oven'],
  'best-gaming-headset': ['comforter', 'mattress', 'shoe', 'sneaker', 'cloudmonster', 'keyboard', 'mouse', 'monitor', 'chair', 'controller', 'gpu', 'graphics card'],
  'best-gaming-mouse': ['headset', 'headphone', 'monitor', 'keyboard', 'chair', 'comforter', 'shoe'],
  'best-gaming-monitor': ['mouse', 'headset', 'keyboard', 'chair', 'comforter', 'shoe'],
  'best-webcam': ['dog', 'pet', 'monitor', 'keyboard', 'mouse', 'headphone'],
  'best-fitness-tracker': ['dog', 'pet', 'whistle', 'treadmill', 'dumbbell', 'yoga mat', 'rowing', 'bike', 'water bottle', 'tumbler'],
  'best-over-ear-headphones': ['earbud', 'keyboard', 'mouse', 'laptop', 'comforter', 'shoe'],
  'best-wireless-earbuds': ['over-ear', 'headset', 'keyboard', 'laptop', 'comforter', 'shoe'],
  'best-running-shoes': ['headset', 'tracker', 'comforter', 'dumbbell', 'yoga mat'],
  'best-laptops': ['air fryer', 'blender', 'headset', 'mouse', 'monitor', 'chair'],
}

/** Brands used to spot scraper-mangled names that concatenate two products. */
const BRANDS = [
  'Sony', 'Apple', 'Bose', 'Samsung', 'Sennheiser', 'Audeze', 'SteelSeries', 'HyperX', 'Razer',
  'Logitech', 'Ninja', 'Vitamix', 'Nutribullet', 'Breville', 'Cosori', 'Philips', 'Garmin',
  'Fitbit', 'Whoop', 'Oura', 'Dell', 'Elgato', 'Nespresso', 'Technivorm', 'KitchenAid',
  'Cuisinart', 'Anker', 'Dyson', 'iRobot', 'Roborock', 'Nike', 'Hoka', 'Brooks', 'ASICS',
  'Keychron', 'Wooting', 'Jabra', 'Marshall',
]

/**
 * Tokens that betray a slug generated from prose rather than a product name. The first slug
 * token is skipped before checking (it's normally the brand, e.g. "the-ordinary-…"), which
 * avoids false positives on brands/products that legitimately contain a stopword.
 */
const SLUG_STOPWORDS = ['has', 'have', 'claims', 'that', 'this', 'with', 'and', 'for', 'your',
  'its', 'are', 'was', 'were', 'will', 'can', 'says', 'the', 'which', 'their', 'best']

const issues = []
const add = (level, check, detail) => issues.push({ level, check, detail })

function slugLooksLikeProse(slug) {
  const tokens = (slug || '').toLowerCase().split('-').slice(1)
  return tokens.some((t) => SLUG_STOPWORDS.includes(t))
}

// --- checks ----------------------------------------------------------------
async function main() {
  const reviews = await d1(`SELECT id, slug, title, status FROM reviews`)
  const published = reviews.filter((r) => r.status === 'published')

  for (const r of published) {
    const links = await d1(
      `SELECT rp.rank, p.name, p.status AS product_status, p.id AS product_id
       FROM review_products rp
       LEFT JOIN products p ON p.id = rp.product_id
       WHERE rp.review_id = ?
       ORDER BY rp.rank`,
      [r.id],
    )

    if (links.length === 0) {
      add('ERROR', 'no-picks', `${r.slug}: published review has 0 linked products`)
      continue
    }
    if (links.length < MIN_PICKS) {
      add('WARN', 'thin-review', `${r.slug}: only ${links.length} pick(s) (min ${MIN_PICKS})`)
    }

    const ranks = links.map((l) => l.rank)
    const expected = links.map((_, i) => i + 1).join(',')
    if ([...ranks].sort((a, b) => a - b).join(',') !== expected) {
      add('WARN', 'rank-gap', `${r.slug}: ranks are [${ranks.join(', ')}] (expected 1..${links.length})`)
    }

    for (const l of links) {
      if (!l.product_id || l.name == null) {
        add('ERROR', 'orphan-link', `${r.slug}: rank ${l.rank} points at a missing product`)
        continue
      }
      if (l.product_status !== 'published') {
        add('ERROR', 'archived-link', `${r.slug}: links "${l.name}" which is ${l.product_status} (still shows on the page)`)
      }
      const deny = REVIEW_DENY[r.slug]
      if (deny) {
        const lower = l.name.toLowerCase()
        const hit = deny.find((d) => lower.includes(d))
        if (hit) add('ERROR', 'type-mismatch', `${r.slug}: "${l.name}" looks wrong for this review (matched deny token "${hit}")`)
      }
    }
  }

  const products = await d1(`SELECT name, slug FROM products WHERE status = 'published'`)
  for (const p of products) {
    if (slugLooksLikeProse(p.slug)) {
      add('WARN', 'junk-slug', `"${p.name}" has a prose-fragment slug: ${p.slug}`)
    }
    const brandsInName = BRANDS.filter((b) => new RegExp(`\\b${b}\\b`, 'i').test(p.name))
    if (brandsInName.length >= 2) {
      add('WARN', 'mangled-name', `"${p.name}" contains multiple brands (${brandsInName.join(', ')}) — likely two products merged`)
    }
  }

  // --- report ---
  const errors = issues.filter((i) => i.level === 'ERROR')
  const warns = issues.filter((i) => i.level === 'WARN')
  const byCheck = (arr) => {
    const groups = {}
    for (const i of arr) (groups[i.check] ||= []).push(i.detail)
    return groups
  }

  console.log(`\nCatalog validation — ${published.length} published reviews, ${products.length} published products\n`)
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
    console.log('FAIL — fix ERROR-level issues before deploy.')
    process.exit(1)
  }
  console.log('PASS — no blocking issues.')
}

main().catch((e) => {
  console.error('validate-catalog failed:', e)
  process.exit(1)
})
