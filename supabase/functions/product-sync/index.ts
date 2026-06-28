/**
 * Aikins Select — product-sync (Supabase Edge Function, Deno)
 *
 * Scheduled by Supabase Cron (see supabase/cron.sql). Pulls live product data
 * from the Amazon Product Advertising API (PA-API 5.0) and writes it to the
 * Cloudflare D1 database over the D1 HTTP API.
 *
 * Modes (?mode=...):
 *   ping     — no PA-API; verifies D1 connectivity + returns counts (test this first)
 *   refresh  — re-check existing published products: price, image, availability;
 *              stamp last_checked_at; retire (status='archived') items gone 2 checks running
 *   gather   — search PA-API per category, dedup by ASIN, insert new products
 *   both     — refresh then gather
 *
 * Auth: callers must send  Authorization: Bearer <SYNC_SECRET>  (cron does this).
 *
 * Required secrets (supabase secrets set ...):
 *   SYNC_SECRET            shared secret guarding this endpoint
 *   AMAZON_ACCESS_KEY      PA-API access key
 *   AMAZON_SECRET_KEY      PA-API secret key
 *   AMAZON_PARTNER_TAG     associate tag, e.g. aikinsselect-20
 *   CF_ACCOUNT_ID          Cloudflare account id
 *   CF_API_TOKEN           Cloudflare API token with D1 edit on this DB
 *   CF_D1_DATABASE_ID      D1 database id
 * Optional: AMAZON_REGION (us-east-1), AMAZON_HOST (webservices.amazon.com),
 *   AMAZON_MARKETPLACE (www.amazon.com), REFRESH_LIMIT (1000), GATHER_PER_CATEGORY (3)
 *
 * NOTE: PA-API 5.0 does not expose star ratings/review counts, so `rating` is
 * never overwritten here — only price, image_url, availability, last_checked_at.
 */
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20'

const env = (k: string, d?: string) => Deno.env.get(k) ?? d ?? ''
const SYNC_SECRET = env('SYNC_SECRET')
const PARTNER_TAG = env('AMAZON_PARTNER_TAG')
const REGION = env('AMAZON_REGION', 'us-east-1')
const HOST = env('AMAZON_HOST', 'webservices.amazon.com')
const MARKETPLACE = env('AMAZON_MARKETPLACE', 'www.amazon.com')
const REFRESH_LIMIT = Number(env('REFRESH_LIMIT', '1000'))
const GATHER_PER_CATEGORY = Number(env('GATHER_PER_CATEGORY', '3'))

const CF_ACCOUNT = env('CF_ACCOUNT_ID')
const CF_TOKEN = env('CF_API_TOKEN')
const CF_DB = env('CF_D1_DATABASE_ID')

const aws = new AwsClient({
  accessKeyId: env('AMAZON_ACCESS_KEY'),
  secretAccessKey: env('AMAZON_SECRET_KEY'),
  service: 'ProductAdvertisingAPI',
  region: REGION,
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const chunk = <T>(a: T[], n: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n))
  return out
}

// ---- Cloudflare D1 (HTTP API) ----
async function d1<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/d1/database/${CF_DB}/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    },
  )
  const data = await res.json()
  if (!data.success) throw new Error('D1: ' + JSON.stringify(data.errors))
  return (data.result?.[0]?.results as T[]) ?? []
}

// ---- Amazon PA-API 5.0 ----
async function paapi(op: 'GetItems' | 'SearchItems', payload: Record<string, unknown>) {
  const body = JSON.stringify({
    PartnerTag: PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: MARKETPLACE,
    ...payload,
  })
  const res = await aws.fetch(`https://${HOST}/paapi5/${op.toLowerCase()}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-encoding': 'amz-1.0',
      'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${op}`,
    },
    body,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`PA-API ${op} ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
  return json
}

const GET_RESOURCES = [
  'ItemInfo.Title',
  'ItemInfo.ByLineInfo',
  'Offers.Listings.Price',
  'Offers.Listings.Availability.Message',
  'Offers.Listings.Availability.Type',
  'Images.Primary.Large',
]

type ParsedItem = { asin: string; title?: string; brand?: string; price?: number; image?: string; available: boolean }
function parseItem(it: any): ParsedItem {
  const listing = it?.Offers?.Listings?.[0]
  const availType = listing?.Availability?.Type // "Now" when buyable
  return {
    asin: it.ASIN,
    title: it?.ItemInfo?.Title?.DisplayValue,
    brand: it?.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
    price: typeof listing?.Price?.Amount === 'number' ? listing.Price.Amount : undefined,
    image: it?.Images?.Primary?.Large?.URL,
    available: !!listing && (availType === undefined || availType === 'Now'),
  }
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
const affiliateUrl = (asin: string) => `https://www.amazon.com/dp/${asin}?tag=${PARTNER_TAG}`
const newId = () => crypto.randomUUID().replace(/-/g, '')

// ---- refresh: update existing published products ----
async function refresh() {
  const rows = await d1<{ id: string; asin: string; availability: string | null }>(
    `SELECT id, asin, availability FROM products
     WHERE asin IS NOT NULL AND asin != '' AND status = 'published'
     ORDER BY (last_checked_at IS NULL) DESC, last_checked_at ASC
     LIMIT ?`,
    [REFRESH_LIMIT],
  )
  const byAsin = new Map(rows.map((r) => [r.asin, r]))
  let updated = 0, outOfStock = 0, archived = 0, missing = 0

  for (const grp of chunk(rows.map((r) => r.asin), 10)) {
    const json = await paapi('GetItems', { ItemIds: grp, Resources: GET_RESOURCES })
    const items: any[] = json?.ItemsResult?.Items ?? []
    const returned = new Set<string>()
    for (const raw of items) {
      const it = parseItem(raw)
      returned.add(it.asin)
      const sets = ['last_checked_at = datetime(\'now\')', 'updated_at = datetime(\'now\')']
      const params: any[] = []
      if (it.price !== undefined) { sets.push('price = ?'); params.push(it.price) }
      if (it.image) { sets.push('image_url = ?'); params.push(it.image) }
      sets.push('availability = ?'); params.push(it.available ? 'in_stock' : 'out_of_stock')
      params.push(it.asin)
      await d1(`UPDATE products SET ${sets.join(', ')} WHERE asin = ? AND status = 'published'`, params)
      if (!it.available) outOfStock++
      updated++
    }
    // ASINs PA-API didn't return = not in catalog this round
    for (const asin of grp) {
      if (returned.has(asin)) continue
      missing++
      const prev = byAsin.get(asin)?.availability
      if (prev === 'unavailable') {
        // second strike -> retire
        await d1(`UPDATE products SET status='archived', availability='unavailable', last_checked_at=datetime('now'), updated_at=datetime('now') WHERE asin=? AND status='published'`, [asin])
        archived++
      } else {
        await d1(`UPDATE products SET availability='unavailable', last_checked_at=datetime('now'), updated_at=datetime('now') WHERE asin=? AND status='published'`, [asin])
      }
    }
    await sleep(1100) // PA-API ~1 req/s
  }
  return { checked: rows.length, updated, outOfStock, missing, archived }
}

// ---- gather: discover + insert new products per category ----
async function gather() {
  const cats = await d1<{ id: string; name: string; slug: string }>(
    `SELECT id, name, slug FROM categories ORDER BY name`,
  )
  let inserted = 0, skipped = 0
  const perCat: Record<string, number> = {}

  for (const cat of cats) {
    let added = 0
    const json = await paapi('SearchItems', {
      Keywords: cat.name,
      SearchIndex: 'All',
      ItemCount: 10,
      Resources: GET_RESOURCES,
    }).catch((e) => { console.error('search', cat.name, String(e).slice(0, 120)); return null })
    await sleep(1100)
    const items: any[] = json?.SearchResult?.Items ?? []
    for (const raw of items) {
      if (added >= GATHER_PER_CATEGORY) break
      const it = parseItem(raw)
      if (!it.asin || !it.title) { skipped++; continue }
      const exists = await d1(`SELECT 1 FROM products WHERE asin = ? LIMIT 1`, [it.asin])
      if (exists.length) { skipped++; continue }
      let slug = slugify(it.title)
      if ((await d1(`SELECT 1 FROM products WHERE slug = ? LIMIT 1`, [slug])).length) slug = `${slug}-${it.asin.slice(-4).toLowerCase()}`
      await d1(
        `INSERT INTO products (id, name, slug, category_id, brand, price, image_url, amazon_url, affiliate_url, asin, availability, is_best_pick, is_trending, status, last_checked_at, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,'published',datetime('now'),datetime('now'),datetime('now'))`,
        [newId(), it.title, slug, cat.id, it.brand ?? null, it.price ?? null, it.image ?? null,
         `https://www.amazon.com/dp/${it.asin}`, affiliateUrl(it.asin), it.asin,
         it.available ? 'in_stock' : 'out_of_stock'],
      )
      inserted++; added++
    }
    perCat[cat.slug] = added
  }
  return { categories: cats.length, inserted, skipped, perCat }
}

async function ping() {
  const counts = await d1<{ status: string; c: number }>(`SELECT status, COUNT(*) c FROM products GROUP BY status`)
  const withAsin = await d1<{ c: number }>(`SELECT COUNT(*) c FROM products WHERE asin IS NOT NULL AND asin != ''`)
  return { d1: 'ok', counts, withAsin: withAsin[0]?.c, partnerTag: PARTNER_TAG, region: REGION }
}

Deno.serve(async (req) => {
  if (SYNC_SECRET) {
    const auth = req.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${SYNC_SECRET}`) return new Response('unauthorized', { status: 401 })
  }
  const mode = new URL(req.url).searchParams.get('mode') ?? 'refresh'
  const started = Date.now()
  try {
    let result: unknown
    if (mode === 'ping') result = await ping()
    else if (mode === 'refresh') result = await refresh()
    else if (mode === 'gather') result = await gather()
    else if (mode === 'both') result = { refresh: await refresh(), gather: await gather() }
    else return new Response(JSON.stringify({ error: `unknown mode: ${mode}` }), { status: 400 })
    return Response.json({ ok: true, mode, ms: Date.now() - started, result })
  } catch (e) {
    console.error(e)
    return Response.json({ ok: false, mode, error: String(e) }, { status: 500 })
  }
})
