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
const PRICE_FLOOR = 15 // USD; a published price below this is almost always a bad scraped value
const PLACEHOLDER_RATING_MIN = 10 // N+ products sharing one exact rating == fabricated placeholder

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

/**
 * Signatures of a broken auto-generated article. The Gen-2 template generator emitted this exact
 * boilerplate sentence for every pick, and its "pick" names are prose fragments (e.g. "Apple iPads"
 * as a running shoe). Placeholder phrases mark reviews whose picks were never filled in. When a
 * review body contains any of these, the prose itself is garbage and the page can't match its
 * products to its article no matter how the links are set — the article must be regenerated.
 */
const TEMPLATE_BOILERPLATE = 'consistently earns top marks from professional reviewers'
const PLACEHOLDER_PICK = ['see our full recommendations', 'check back soon', 'coming soon', 'detailed picks']

/** Generic model words that don't, on their own, distinguish two products in the same line. */
const GENERIC_MODEL_WORDS = new Set(['pro', 'max', 'ultra', 'plus', 'mini', 'wireless', 'series',
  'edition', 'smart', 'premium', 'cup', 'inch', 'oled', 'best', 'the', 'and', 'for'])

const issues = []
const add = (level, check, detail) => issues.push({ level, check, detail })

function slugLooksLikeProse(slug) {
  const tokens = (slug || '').toLowerCase().split('-').slice(1)
  return tokens.some((t) => SLUG_STOPWORDS.includes(t))
}

/** Tokenize text on word boundaries, keeping model tokens like "9a", "s25", "xm5", "u8n". */
function tokenizeText(s) {
  return (s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
}

/**
 * The most distinctive ("anchor") token of a product name: a model token containing a digit
 * (a55, s25, u8n, 67w) when present, else the longest non-generic word. This is what separates
 * "Galaxy A55" from "Galaxy S25 Ultra" — the shared "samsung galaxy" prefix is not enough.
 * Used to test whether a review's article actually mentions a product it links.
 */
function productAnchor(name) {
  const toks = tokenizeText(name)
  const digit = toks.find((t) => /\d/.test(t) && t.length >= 2)
  if (digit) return digit
  const alpha = toks.filter((t) => t.length >= 4 && !GENERIC_MODEL_WORDS.has(t)).sort((a, b) => b.length - a.length)
  return alpha[0] || ''
}

// --- checks ----------------------------------------------------------------
async function main() {
  const reviews = await d1(`SELECT id, slug, title, status, content FROM reviews`)
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

    // Article ↔ products coherence. Two failure modes seen live:
    //  (1) broken-article: the article PROSE is auto-generated garbage (template boilerplate or
    //      unfilled placeholders), so its own "picks" are nonsense (e.g. "Apple iPads" as a running
    //      shoe). The article needs regenerating regardless of which products are linked.
    //  (2) article-link-mismatch: the prose is fine but a linked product is never mentioned in it —
    //      i.e. the page shows a product the article doesn't actually recommend (e.g. a "best budget
    //      smartphone" page showing the flagship Galaxy S25 Ultra).
    const contentLower = (r.content || '').toLowerCase()
    const brokenSignals = []
    if (contentLower.includes(TEMPLATE_BOILERPLATE)) brokenSignals.push('template-generator boilerplate')
    const ph = PLACEHOLDER_PICK.find((p) => contentLower.includes(p))
    if (ph) brokenSignals.push(`placeholder text "${ph}"`)

    if (brokenSignals.length) {
      add('WARN', 'broken-article', `${r.slug}: article prose is auto-generated/garbage (${brokenSignals.join('; ')}) — regenerate the article`)
    } else if (r.content) {
      // Editorial articles (the current generator) legitimately don't name every minor pick —
      // the product cards do that. So only flag a SYSTEMIC disconnect: the article names fewer
      // than half its linked products, or doesn't name its own #1 pick. That still catches the
      // real failure (a "best budget phone" article whose links are all flagships) without crying
      // wolf over an "Also Great" the prose simply didn't mention.
      const artStr = ' ' + tokenizeText(r.content).join(' ') + ' '
      const named = (l) => {
        const a = productAnchor(l.name)
        return !a || a.length < 2 || artStr.includes(` ${a} `)
      }
      const withName = links.filter((l) => l.name)
      const unnamed = withName.filter((l) => !named(l))
      if (withName.length >= 3 && withName.length - unnamed.length < Math.ceil(withName.length / 2)) {
        add('WARN', 'article-link-mismatch', `${r.slug}: article names only ${withName.length - unnamed.length}/${withName.length} linked products (missing: ${unnamed.map((l) => l.name).join(', ')}) — likely a stale/mismatched article`)
      } else if (withName[0] && !named(withName[0])) {
        add('WARN', 'article-link-mismatch', `${r.slug}: article never names its top pick "${withName[0].name}"`)
      }
    }
  }

  const linkedIds = new Set((await d1(`SELECT DISTINCT product_id FROM review_products`)).map((r) => r.product_id))
  const products = await d1(`SELECT id, name, slug, rating, price, asin, availability, affiliate_url, amazon_url FROM products WHERE status = 'published'`)
  const ratingCounts = {}
  let missingPriceOnPick = 0
  let missingAvailOnAsin = 0
  let noBuyLink = 0
  let outOfStockPublished = 0
  for (const p of products) {
    if (slugLooksLikeProse(p.slug)) {
      add('WARN', 'junk-slug', `"${p.name}" has a prose-fragment slug: ${p.slug}`)
    }
    const brandsInName = BRANDS.filter((b) => new RegExp(`\\b${b}\\b`, 'i').test(p.name))
    if (brandsInName.length >= 2) {
      add('WARN', 'mangled-name', `"${p.name}" contains multiple brands (${brandsInName.join(', ')}) — likely two products merged`)
    }
    // rating: must be a real 0–5 score, never a uniform placeholder
    if (p.rating != null) {
      if (p.rating <= 0 || p.rating > 5) {
        add('ERROR', 'rating-range', `"${p.name}" has out-of-range rating ${p.rating}`)
      }
      ratingCounts[p.rating] = (ratingCounts[p.rating] || 0) + 1
    }
    // price sanity
    if (p.price != null && p.price < PRICE_FLOOR) {
      add('WARN', 'price-suspect', `"${p.name}" has an implausibly low price ($${p.price})`)
    }
    if (linkedIds.has(p.id) && p.price == null) missingPriceOnPick++
    if (p.asin && (p.availability == null || p.availability === 'unknown')) missingAvailOnAsin++
    // buy link: every published product must be buyable. The site hides the CTA when
    // affiliate_url is null and trusts these URLs verbatim, so a missing or malformed link
    // is a dead-end card. (Our pipeline always sets at least a tagged Amazon search URL.)
    const buy = p.affiliate_url || p.amazon_url
    if (!buy) {
      noBuyLink++
    } else if (!/^https?:\/\/(www\.)?amazon\./i.test(String(buy))) {
      add('WARN', 'bad-buy-link', `"${p.name}" has a non-Amazon/malformed buy URL: ${String(buy).slice(0, 80)}`)
    }
    // out of stock but still published → renders a live-looking buy button; should be archived
    if (p.availability === 'out_of_stock' || p.availability === 'unavailable') outOfStockPublished++
  }
  // placeholder rating: a fabricated default shows up as ONE value dominating the whole catalog
  // (the old bug was every product = 4.5). A real computed score clusters naturally — with a large
  // catalog many products legitimately share e.g. 4.1★ — so only flag when a single rating covers
  // an implausibly large share of all rated products, not just any value with ≥PLACEHOLDER_RATING_MIN.
  const totalRated = Object.values(ratingCounts).reduce((a, b) => a + b, 0)
  for (const [val, count] of Object.entries(ratingCounts)) {
    if (count >= PLACEHOLDER_RATING_MIN && count / totalRated > 0.4) {
      add('ERROR', 'placeholder-rating', `${count}/${totalRated} products rated exactly ${val} (${Math.round((count / totalRated) * 100)}%) — looks like a fabricated placeholder, not a computed score`)
    }
  }
  if (missingPriceOnPick > 0) {
    add('WARN', 'pick-no-price', `${missingPriceOnPick} review-linked product(s) have no price (shown as a pick without a price)`)
  }
  if (missingAvailOnAsin > 0) {
    add('WARN', 'stale-availability', `${missingAvailOnAsin} product(s) with an ASIN have no availability — run the PA-API sync worker`)
  }
  if (noBuyLink > 0) {
    add('ERROR', 'no-buy-link', `${noBuyLink} published product(s) have no buy URL (affiliate_url/amazon_url) — they render a dead-end card`)
  }
  if (outOfStockPublished > 0) {
    add('WARN', 'out-of-stock-published', `${outOfStockPublished} product(s) are out_of_stock/unavailable but still published — archive them or let the PA-API sync prune them`)
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
