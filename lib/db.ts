/**
 * Aikins Select - Database Layer
 * Connects to Cloudflare D1 via HTTP API
 */

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'fbaa45f12d47c61aca094d76476352a7'
const D1_DATABASE_ID = process.env.D1_DATABASE_ID || '5df12367-0bd2-4568-9437-0090a640c47e'

async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    }
  )

  const data = await res.json()
  if (!data.success) {
    console.error('D1 query error:', data.errors)
    return []
  }
  return data.result?.[0]?.results || []
}

// --- Categories ---
export async function getCategories() {
  return query(`SELECT * FROM categories ORDER BY name`)
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

export async function getFeaturedReviews(limit = 3) {
  return query(
    `SELECT r.*, c.name as category_name, c.slug as category_slug 
     FROM reviews r 
     LEFT JOIN categories c ON r.category_id = c.id 
     WHERE r.status = 'published' AND r.is_featured = 1 
     ORDER BY r.published_at DESC 
     LIMIT ?`,
    [limit]
  )
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
export async function getTrendingProducts(limit = 8) {
  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.status = 'published' AND p.is_trending = 1 
     ORDER BY p.rating DESC 
     LIMIT ?`,
    [limit]
  )
}

export async function getBestPicks(limit = 8) {
  return query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.status = 'published' AND p.is_best_pick = 1 
     ORDER BY p.rating DESC 
     LIMIT ?`,
    [limit]
  )
}

export async function getProductsByCategory(categorySlug: string, limit = 20) {
  return query(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     JOIN categories c ON p.category_id = c.id 
     WHERE c.slug = ? AND p.status = 'published'
     ORDER BY p.is_best_pick DESC, p.rating DESC
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
     WHERE p.status = 'published' 
     ORDER BY p.created_at DESC 
     LIMIT ?`,
    [limit]
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
