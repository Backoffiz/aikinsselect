/**
 * Aikins Select — product-sync (Cloudflare Worker, Cron Triggers)
 *
 * Runs on a schedule and keeps the D1 catalog fresh from the Amazon Product
 * Advertising API (PA-API 5.0). Talks to D1 directly through the `DB` binding
 * (same database as the Pages app) — no HTTP API, no Cloudflare credentials.
 *
 * Cron triggers (see wrangler.jsonc):
 *   "0 9 * * *"   daily 09:00 UTC  -> refresh
 *   "0 10 * * 1"  Mondays 10:00 UTC -> gather
 *
 * Manual trigger (for testing): GET /?mode=ping|refresh|gather|both
 *   guarded by Authorization: Bearer <SYNC_SECRET> when SYNC_SECRET is set.
 *
 * Secrets (wrangler secret put ...): AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, SYNC_SECRET
 * Vars (wrangler.jsonc): AMAZON_PARTNER_TAG, and optional AMAZON_REGION/HOST/MARKETPLACE,
 *   REFRESH_LIMIT, GATHER_PER_CATEGORY.
 *
 * NOTE: PA-API 5.0 does not expose star ratings, so `rating` is never overwritten —
 * only price, image_url, availability, last_checked_at.
 */
import { AwsClient } from 'aws4fetch'

export interface Env {
  DB: D1Database
  AMAZON_ACCESS_KEY: string
  AMAZON_SECRET_KEY: string
  AMAZON_PARTNER_TAG: string
  AMAZON_REGION?: string
  AMAZON_HOST?: string
  AMAZON_MARKETPLACE?: string
  REFRESH_LIMIT?: string
  GATHER_PER_CATEGORY?: string
  SYNC_SECRET?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const chunk = <T>(a: T[], n: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n))
  return out
}

// ---- D1 (native binding) ----
async function d1<T = any>(env: Env, sql: string, params: any[] = []): Promise<T[]> {
  const { results } = await env.DB.prepare(sql).bind(...params).all()
  return (results as T[]) ?? []
}
async function d1run(env: Env, sql: string, params: any[] = []): Promise<number> {
  const r = await env.DB.prepare(sql).bind(...params).run()
  return (r.meta?.changes as number) ?? 0
}

// ---- Amazon PA-API 5.0 ----
const GET_RESOURCES = [
  'ItemInfo.Title',
  'ItemInfo.ByLineInfo',
  'Offers.Listings.Price',
  'Offers.Listings.Availability.Message',
  'Offers.Listings.Availability.Type',
  'Images.Primary.Large',
]
function host(env: Env) { return env.AMAZON_HOST ?? 'webservices.amazon.com' }
function marketplace(env: Env) { return env.AMAZON_MARKETPLACE ?? 'www.amazon.com' }

async function paapi(env: Env, op: 'GetItems' | 'SearchItems', payload: Record<string, unknown>) {
  const aws = new AwsClient({
    accessKeyId: env.AMAZON_ACCESS_KEY,
    secretAccessKey: env.AMAZON_SECRET_KEY,
    service: 'ProductAdvertisingAPI',
    region: env.AMAZON_REGION ?? 'us-east-1',
  })
  const body = JSON.stringify({
    PartnerTag: env.AMAZON_PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: marketplace(env),
    ...payload,
  })
  const res = await aws.fetch(`https://${host(env)}/paapi5/${op.toLowerCase()}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-encoding': 'amz-1.0',
      'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${op}`,
    },
    body,
  })
  const json: any = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`PA-API ${op} ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
  return json
}

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

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
const affiliateUrl = (env: Env, asin: string) => `https://www.amazon.com/dp/${asin}?tag=${env.AMAZON_PARTNER_TAG}`
const newId = () => crypto.randomUUID().replace(/-/g, '')

// ---- refresh ----
async function refresh(env: Env) {
  const limit = Number(env.REFRESH_LIMIT ?? '1000')
  const rows = await d1<{ id: string; asin: string; availability: string | null }>(
    env,
    `SELECT id, asin, availability FROM products
     WHERE asin IS NOT NULL AND asin != '' AND status = 'published'
     ORDER BY (last_checked_at IS NULL) DESC, last_checked_at ASC
     LIMIT ?`,
    [limit],
  )
  const byAsin = new Map(rows.map((r) => [r.asin, r]))
  let updated = 0, outOfStock = 0, archived = 0, missing = 0

  for (const grp of chunk(rows.map((r) => r.asin), 10)) {
    const json = await paapi(env, 'GetItems', { ItemIds: grp, Resources: GET_RESOURCES })
    const items: any[] = json?.ItemsResult?.Items ?? []
    const returned = new Set<string>()
    for (const raw of items) {
      const it = parseItem(raw)
      returned.add(it.asin)
      const sets = ["last_checked_at = datetime('now')", "updated_at = datetime('now')"]
      const params: any[] = []
      if (it.price !== undefined) { sets.push('price = ?'); params.push(it.price) }
      if (it.image) { sets.push('image_url = ?'); params.push(it.image) }
      sets.push('availability = ?'); params.push(it.available ? 'in_stock' : 'out_of_stock')
      // PA-API confirmed this ASIN buyable → canonicalize the buy link to the verified /dp
      // deep-link. The generator stores a never-dead search-url fallback for unverified ASINs;
      // this upgrades those (and any stale URL) to the exact listing once it's confirmed live.
      if (it.available) {
        sets.push('amazon_url = ?'); params.push(`https://www.amazon.com/dp/${it.asin}`)
        sets.push('affiliate_url = ?'); params.push(affiliateUrl(env, it.asin))
      }
      params.push(it.asin)
      await d1run(env, `UPDATE products SET ${sets.join(', ')} WHERE asin = ? AND status = 'published'`, params)
      if (!it.available) outOfStock++
      updated++
    }
    for (const asin of grp) {
      if (returned.has(asin)) continue
      missing++
      const prev = byAsin.get(asin)?.availability
      if (prev === 'unavailable') {
        await d1run(env, `UPDATE products SET status='archived', availability='unavailable', last_checked_at=datetime('now'), updated_at=datetime('now') WHERE asin=? AND status='published'`, [asin])
        archived++
      } else {
        await d1run(env, `UPDATE products SET availability='unavailable', last_checked_at=datetime('now'), updated_at=datetime('now') WHERE asin=? AND status='published'`, [asin])
      }
    }
    await sleep(1100) // PA-API ~1 req/s
  }
  return { checked: rows.length, updated, outOfStock, missing, archived }
}

// Concrete product seeds per category — far better than searching the bare category name
// ("Tech" → random items). Coarse mirror of the generator's topic taxonomy; the worker only
// inserts NEW ASINs (deduped), so a few seeds per category is enough to keep the catalog growing.
const GATHER_KEYWORDS: Record<string, string[]> = {
  tech: ['wireless earbuds', 'laptop', 'smartwatch', 'tablet', 'bluetooth speaker'],
  home: ['robot vacuum', 'air purifier', 'cordless vacuum', 'space heater', 'security camera'],
  kitchen: ['air fryer', 'blender', 'espresso machine', 'coffee maker', 'stand mixer'],
  fitness: ['fitness tracker', 'running shoes', 'adjustable dumbbells', 'yoga mat', 'treadmill'],
  beauty: ['hair dryer', 'electric shaver', 'electric toothbrush', 'beard trimmer', 'curling iron'],
  travel: ['carry on luggage', 'travel backpack', 'packing cubes', 'travel pillow', 'travel adapter'],
  pets: ['automatic cat feeder', 'dog gps tracker', 'pet hair vacuum', 'dog bed', 'cat litter box'],
  office: ['office chair', 'standing desk', 'webcam', 'monitor', 'mechanical keyboard'],
  gaming: ['gaming headset', 'gaming mouse', 'gaming monitor', 'gaming keyboard', 'gaming chair'],
  outdoors: ['tent', 'sleeping bag', 'hiking boots', 'cooler', 'camping stove'],
  baby: ['baby monitor', 'car seat', 'stroller', 'baby carrier', 'high chair'],
  auto: ['dash cam', 'jump starter', 'tire inflator', 'car phone mount', 'car vacuum'],
}

// ---- gather ----
async function gather(env: Env) {
  const perCatLimit = Number(env.GATHER_PER_CATEGORY ?? '3')
  const cats = await d1<{ id: string; name: string; slug: string }>(env, `SELECT id, name, slug FROM categories ORDER BY name`)
  let inserted = 0, skipped = 0
  const perCat: Record<string, number> = {}

  for (const cat of cats) {
    let added = 0
    const seeds = GATHER_KEYWORDS[cat.slug] ?? [cat.name]
    for (const kw of seeds) {
      if (added >= perCatLimit) break
      let json: any = null
      try {
        json = await paapi(env, 'SearchItems', { Keywords: kw, SearchIndex: 'All', ItemCount: 10, Resources: GET_RESOURCES })
      } catch (e) {
        console.error('search', kw, String(e).slice(0, 120))
      }
      await sleep(1100)
      const items: any[] = json?.SearchResult?.Items ?? []
      for (const raw of items) {
        if (added >= perCatLimit) break
        const it = parseItem(raw)
        if (!it.asin || !it.title) { skipped++; continue }
        if ((await d1(env, `SELECT 1 FROM products WHERE asin = ? LIMIT 1`, [it.asin])).length) { skipped++; continue }
        let slug = slugify(it.title)
        if ((await d1(env, `SELECT 1 FROM products WHERE slug = ? LIMIT 1`, [slug])).length) slug = `${slug}-${it.asin.slice(-4).toLowerCase()}`
        await d1run(
          env,
          `INSERT INTO products (id, name, slug, category_id, brand, price, image_url, amazon_url, affiliate_url, asin, availability, is_best_pick, is_trending, status, last_checked_at, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,'published',datetime('now'),datetime('now'),datetime('now'))`,
          [newId(), it.title, slug, cat.id, it.brand ?? null, it.price ?? null, it.image ?? null,
           `https://www.amazon.com/dp/${it.asin}`, affiliateUrl(env, it.asin), it.asin, it.available ? 'in_stock' : 'out_of_stock'],
        )
        inserted++; added++
      }
    }
    perCat[cat.slug] = added
  }
  return { categories: cats.length, inserted, skipped, perCat }
}

async function ping(env: Env) {
  const counts = await d1(env, `SELECT status, COUNT(*) c FROM products GROUP BY status`)
  const withAsin = await d1<{ c: number }>(env, `SELECT COUNT(*) c FROM products WHERE asin IS NOT NULL AND asin != ''`)
  return { d1: 'ok', counts, withAsin: withAsin[0]?.c, partnerTag: env.AMAZON_PARTNER_TAG }
}

async function run(env: Env, mode: string) {
  if (mode === 'ping') return ping(env)
  if (mode === 'refresh') return refresh(env)
  if (mode === 'gather') return gather(env)
  if (mode === 'both') return { refresh: await refresh(env), gather: await gather(env) }
  throw new Error(`unknown mode: ${mode}`)
}

export default {
  // Cron Triggers
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const mode = event.cron === '0 10 * * 1' ? 'gather' : 'refresh'
    console.log(`scheduled: cron="${event.cron}" -> ${mode}`)
    ctx.waitUntil(
      run(env, mode)
        .then((r) => console.log(`${mode} done:`, JSON.stringify(r)))
        .catch((e) => console.error(`${mode} failed:`, String(e))),
    )
  },

  // Manual trigger for testing
  async fetch(req: Request, env: Env): Promise<Response> {
    if (env.SYNC_SECRET) {
      const auth = req.headers.get('authorization') ?? ''
      if (auth !== `Bearer ${env.SYNC_SECRET}`) return new Response('unauthorized', { status: 401 })
    }
    const mode = new URL(req.url).searchParams.get('mode') ?? 'ping'
    const started = Date.now()
    try {
      const result = await run(env, mode)
      return Response.json({ ok: true, mode, ms: Date.now() - started, result })
    } catch (e) {
      return Response.json({ ok: false, mode, error: String(e) }, { status: 500 })
    }
  },
}
