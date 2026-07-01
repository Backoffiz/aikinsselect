/**
 * Aikins Select - Database Layer
 *
 * In production (Cloudflare Pages, edge runtime) we talk to D1 directly through
 * the `DB` binding declared in wrangler.jsonc — no credentials live in source.
 *
 * In local `next dev` there is no Cloudflare runtime, so we fall back to the D1
 * HTTP API using credentials from .env.local (gitignored). For local dev set:
 *   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID
 */
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  // Production: use the D1 binding (no network round-trip, no secrets)
  const db = getOptionalRequestContext()?.env?.DB as any
  if (db) {
    try {
      const { results } = await db.prepare(sql).bind(...params).all()
      return (results as T[]) || []
    } catch (e) {
      console.error('D1 binding query error:', e)
      return []
    }
  }

  // Local dev: fall back to the D1 HTTP API
  return queryViaHttp<T>(sql, params)
}

// D1 HTTP API — local-dev fallback only. Credentials come from .env.local (never committed).
async function queryViaHttp<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const databaseId = process.env.D1_DATABASE_ID

  if (!apiToken || !accountId || !databaseId) {
    console.error(
      'D1 HTTP fallback unavailable: set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID and D1_DATABASE_ID in .env.local'
    )
    return []
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      }
    )
    const data = await res.json()
    if (!data.success) {
      console.error('D1 query error:', data.errors)
      return []
    }
    return data.result?.[0]?.results || []
  } catch (e) {
    console.error('D1 fetch error:', e)
    return []
  }
}

// --- Categories ---
export async function getCategories() {
  return query(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.status = 'published'
    GROUP BY c.id
    ORDER BY product_count DESC
  `)
}

export async function getCategoryBySlug(slug: string) {
  const results = await query(`SELECT * FROM categories WHERE slug = ?`, [slug])
  return results[0] || null
}

// --- Reviews ---
//
// Review cards have no dedicated photo, so each card's image is, in order of
// preference: an explicitly-set hero_image, else the image of the review's
// top-ranked product (a real per-review image), else (at render time) the
// category photo. Without this, every review in a category showed the SAME
// category image (e.g. all 8 tech reviews shared /categories/tech.jpg).
const REVIEW_CARD_IMAGE = `COALESCE(
  NULLIF(r.hero_image, ''),
  (SELECT p.image_url FROM review_products rp
     JOIN products p ON p.id = rp.product_id
     WHERE rp.review_id = r.id AND p.image_url IS NOT NULL AND p.image_url != ''
     ORDER BY rp.rank LIMIT 1)
)`

export async function getPublishedReviews(limit = 20) {
  return query(
    `SELECT r.*, c.name as category_name, c.slug as category_slug,
            ${REVIEW_CARD_IMAGE} as card_image
     FROM reviews r
     LEFT JOIN categories c ON r.category_id = c.id
     WHERE r.status = 'published'
     ORDER BY r.published_at DESC
     LIMIT ?`,
    [limit]
  )
}

export async function getFeaturedReview() {
  const results = await query(
    `SELECT r.*, c.name as category_name, c.slug as category_slug,
            ${REVIEW_CARD_IMAGE} as card_image,
            (SELECT COUNT(*) FROM review_products rp WHERE rp.review_id = r.id) as product_count
     FROM reviews r
     LEFT JOIN categories c ON r.category_id = c.id
     WHERE r.status = 'published'
     ORDER BY r.is_featured DESC, r.published_at DESC
     LIMIT 1`
  )
  return results[0] || null
}

export async function getReviewBySlug(slug: string) {
  const results = await query(
    `SELECT r.*, c.name as category_name, c.slug as category_slug 
     FROM reviews r 
     LEFT JOIN categories c ON r.category_id = c.id 
     WHERE r.slug = ?`,
    [slug]
  )
  return results[0] || null
}

export async function getReviewsByCategory(categorySlug: string, limit = 20) {
  return query(
    `SELECT r.*, c.name as category_name, c.slug as category_slug 
     FROM reviews r 
     JOIN categories c ON r.category_id = c.id 
     WHERE c.slug = ? AND r.status = 'published'
     ORDER BY r.published_at DESC
     LIMIT ?`,
    [categorySlug, limit]
  )
}

// --- Products ---
export async function getTrendingProducts(limit = 4) {
  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.is_trending = 1 AND p.status = 'published'
     ORDER BY RANDOM()
     LIMIT ?`,
    [limit]
  )
}

export async function getBestPicks(limit = 8) {
  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.is_best_pick = 1 AND p.status = 'published'
     ORDER BY RANDOM()
     LIMIT ?`,
    [limit]
  )
}

export async function getProductsByCategory(categorySlug: string, limit = 50) {
  return query(
    `SELECT p.*, c.name as category_name 
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE c.slug = ? AND p.status = 'published'
     ORDER BY p.is_best_pick DESC, p.name ASC
     LIMIT ?`,
    [categorySlug, limit]
  )
}

export async function getProductBySlug(slug: string) {
  const results = await query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.slug = ?`,
    [slug]
  )
  return results[0] || null
}

// Alternatives = same category, excluding the current product.
export async function getAlternativeProducts(categoryId: string, excludeId: string, limit = 3) {
  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.category_id = ? AND p.id != ? AND p.status = 'published'
     ORDER BY p.is_best_pick DESC, p.rating DESC
     LIMIT ?`,
    [categoryId, excludeId, limit]
  )
}

// The first published review that features this product (for "read the full review" + verdict snippet).
export async function getReviewForProduct(productId: string) {
  const results = await query(
    `SELECT r.title, r.slug, r.subtitle, rp.mini_review, rp.rank
     FROM reviews r
     JOIN review_products rp ON rp.review_id = r.id
     WHERE rp.product_id = ? AND r.status = 'published'
     ORDER BY rp.rank ASC
     LIMIT 1`,
    [productId]
  )
  return results[0] || null
}

export async function getProductsForReview(reviewSlug: string) {
  return query(
    `SELECT p.*, rp.rank, rp.mini_review
     FROM products p
     JOIN review_products rp ON p.id = rp.product_id
     JOIN reviews r ON rp.review_id = r.id
     WHERE r.slug = ? AND p.status = 'published'
     ORDER BY rp.rank`,
    [reviewSlug]
  )
}

export async function getLatestProducts(limit = 12) {
  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.status = 'published'
     ORDER BY p.created_at DESC
     LIMIT ?`,
    [limit]
  )
}

// --- Search ---
//
// The old search did `name LIKE '%<whole query>%'`, so any multi-word query
// (e.g. "usb c cable") had to appear verbatim as one contiguous substring and
// almost always returned nothing. Search now tokenizes the query and requires
// EVERY token to match (AND), where each token may match ANY searchable field
// (OR). Results are ordered by a lightweight relevance score. The catalog is
// small (a few hundred rows) so tokenized LIKE is plenty fast — no FTS needed.

/** Split a free-text query into up to 6 lowercased alphanumeric tokens. */
function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .slice(0, 6)
}

export async function searchProducts(q: string, limit = 24) {
  const tokens = tokenize(q)
  if (tokens.length === 0) return []
  const phrase = `%${q.trim().toLowerCase()}%`

  // AND across tokens, OR across fields. Each field is lower()'d so matching is
  // case-insensitive; LIKE on a NULL column yields NULL (no match), which is fine.
  const where = tokens
    .map(
      () => `(
        lower(p.name) LIKE ? OR lower(p.brand) LIKE ? OR lower(p.model) LIKE ?
        OR lower(p.description) LIKE ? OR lower(c.name) LIKE ?
      )`
    )
    .join(' AND ')
  const whereParams = tokens.flatMap((t) => Array(5).fill(`%${t}%`))

  // Relevance: whole-phrase name hit first, then per-token name/brand/model hits,
  // then a nudge for editor's best picks.
  const order = `(
    (CASE WHEN lower(p.name) LIKE ? THEN 100 ELSE 0 END)
    + ${tokens.map(() => `(CASE WHEN lower(p.name) LIKE ? THEN 10 ELSE 0 END)`).join(' + ')}
    + ${tokens
      .map(() => `(CASE WHEN lower(p.brand) LIKE ? OR lower(p.model) LIKE ? THEN 5 ELSE 0 END)`)
      .join(' + ')}
    + (CASE WHEN p.is_best_pick = 1 THEN 8 ELSE 0 END)
  )`
  const orderParams = [
    phrase,
    ...tokens.map((t) => `%${t}%`), // name per token
    ...tokens.flatMap((t) => [`%${t}%`, `%${t}%`]), // brand + model per token
  ]

  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE (${where}) AND p.status = 'published'
     ORDER BY ${order} DESC, p.rating DESC, p.name ASC
     LIMIT ?`,
    [...whereParams, ...orderParams, limit]
  )
}

export async function searchReviews(q: string, limit = 12) {
  const tokens = tokenize(q)
  if (tokens.length === 0) return []
  const phrase = `%${q.trim().toLowerCase()}%`

  const where = tokens
    .map(
      () => `(
        lower(r.title) LIKE ? OR lower(r.subtitle) LIKE ?
        OR lower(r.excerpt) LIKE ? OR lower(r.content) LIKE ? OR lower(c.name) LIKE ?
      )`
    )
    .join(' AND ')
  const whereParams = tokens.flatMap((t) => Array(5).fill(`%${t}%`))

  const order = `(
    (CASE WHEN lower(r.title) LIKE ? THEN 100 ELSE 0 END)
    + ${tokens.map(() => `(CASE WHEN lower(r.title) LIKE ? THEN 10 ELSE 0 END)`).join(' + ')}
    + (CASE WHEN r.is_featured = 1 THEN 5 ELSE 0 END)
  )`
  const orderParams = [phrase, ...tokens.map((t) => `%${t}%`)]

  return query(
    `SELECT r.*, c.name as category_name, c.slug as category_slug
     FROM reviews r
     LEFT JOIN categories c ON r.category_id = c.id
     WHERE (${where}) AND r.status = 'published'
     ORDER BY ${order} DESC, r.published_at DESC
     LIMIT ?`,
    [...whereParams, ...orderParams, limit]
  )
}

// Categories whose name/description match the query — shown as quick links on
// the search page so a query like "kitchen" jumps straight to the category.
export async function searchCategories(q: string, limit = 6) {
  const tokens = tokenize(q)
  if (tokens.length === 0) return []

  const where = tokens
    .map(() => `(lower(c.name) LIKE ? OR lower(c.description) LIKE ?)`)
    .join(' AND ')
  const whereParams = tokens.flatMap((t) => [`%${t}%`, `%${t}%`])

  return query(
    `SELECT c.*, COUNT(p.id) as product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.status = 'published'
     WHERE ${where}
     GROUP BY c.id
     ORDER BY product_count DESC, c.name ASC
     LIMIT ?`,
    [...whereParams, limit]
  )
}

// --- Affiliate click tracking (T5) ---
export type AffiliateClick = {
  product_id: string | null
  guide_id: string | null
  merchant: string
  button_location: string
  page_url: string | null
  device_type: string | null
  country: string | null
}

/** Append one affiliate click to the funnel log. ts/created_date default in-DB. */
export async function recordAffiliateClick(c: AffiliateClick): Promise<void> {
  await query(
    `INSERT INTO affiliate_clicks (product_id, guide_id, merchant, button_location, page_url, device_type, country)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [c.product_id, c.guide_id, c.merchant, c.button_location, c.page_url, c.device_type, c.country],
  )
}

// --- Stats ---
export async function getStats() {
  const reviews = await query('SELECT COUNT(*) as count FROM reviews WHERE status = ?', ['published'])
  const products = await query('SELECT COUNT(*) as count FROM products WHERE status = ?', ['published'])
  const categories = await query('SELECT COUNT(*) as count FROM categories')
  return {
    reviews: reviews[0]?.count || 0,
    products: products[0]?.count || 0,
    categories: categories[0]?.count || 0,
  }
}
