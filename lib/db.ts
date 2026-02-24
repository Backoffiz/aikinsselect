/**
 * Aikins Select - Database Layer
 * Connects to Cloudflare D1 via HTTP API
 */

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || ''
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'fbaa45f12d47c61aca094d76476352a7'
const D1_DATABASE_ID = process.env.D1_DATABASE_ID || '5df12367-0bd2-4568-9437-0090a640c47e'

async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (!CF_API_TOKEN) {
    console.warn('D1: No API token, returning empty results')
    return []
  }
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
        // D1 HTTP API — no caching needed, queries are fast
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
    LEFT JOIN products p ON c.id = p.category_id 
    GROUP BY c.id 
    ORDER BY product_count DESC
  `)
}

export async function getCategoryBySlug(slug: string) {
  const results = await query(`SELECT * FROM categories WHERE slug = ?`, [slug])
  return results[0] || null
}

// --- Reviews ---
export async function getPublishedReviews(limit = 20) {
  return query(
    `SELECT r.*, c.name as category_name, c.slug as category_slug 
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
    `SELECT r.*, c.name as category_name, c.slug as category_slug 
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
     WHERE p.is_trending = 1 
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
     WHERE p.is_best_pick = 1 
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
     WHERE c.slug = ?
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

export async function getProductsForReview(reviewSlug: string) {
  return query(
    `SELECT p.*, rp.rank, rp.mini_review 
     FROM products p 
     JOIN review_products rp ON p.id = rp.product_id 
     JOIN reviews r ON rp.review_id = r.id 
     WHERE r.slug = ? 
     ORDER BY rp.rank`,
    [reviewSlug]
  )
}

export async function getLatestProducts(limit = 12) {
  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ORDER BY p.created_at DESC 
     LIMIT ?`,
    [limit]
  )
}

// --- Search ---
export async function searchProducts(q: string, limit = 20) {
  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.name LIKE ? 
     ORDER BY p.is_best_pick DESC, p.name ASC 
     LIMIT ?`,
    [`%${q}%`, limit]
  )
}

export async function searchReviews(q: string, limit = 20) {
  return query(
    `SELECT r.*, c.name as category_name, c.slug as category_slug 
     FROM reviews r 
     LEFT JOIN categories c ON r.category_id = c.id 
     WHERE (r.title LIKE ? OR r.subtitle LIKE ?) AND r.status = 'published'
     ORDER BY r.published_at DESC 
     LIMIT ?`,
    [`%${q}%`, `%${q}%`, limit]
  )
}

// --- Stats ---
export async function getStats() {
  const reviews = await query('SELECT COUNT(*) as count FROM reviews WHERE status = ?', ['published'])
  const products = await query('SELECT COUNT(*) as count FROM products')
  const categories = await query('SELECT COUNT(*) as count FROM categories')
  return {
    reviews: reviews[0]?.count || 0,
    products: products[0]?.count || 0,
    categories: categories[0]?.count || 0,
  }
}
