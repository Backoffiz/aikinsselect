/**
 * Aikins Select — SEO / structured-data builders.
 *
 * These produce schema.org JSON-LD nodes. Pages wrap the nodes they need with
 * `jsonLdGraph()` and render them through <JsonLd>. Everything here is built from
 * REAL data only — we never invent an aggregateRating/reviewCount. The single
 * editorial rating we surface (Review.reviewRating) is the same "Aikins Score"
 * shown visibly on the page, which keeps us within Google's rich-result policy.
 */

export const SITE_URL = 'https://aikinsselect.com'
export const SITE_NAME = 'Aikins Select'

const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

/** Resolve a relative path (or pass through an already-absolute URL) to absolute. */
export function absoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

/** Wrap a set of nodes into one JSON-LD graph document. Nullish nodes are dropped. */
export function jsonLdGraph(nodes: (object | null | undefined)[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  }
}

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
    description:
      'Independent product reviews. We cross-reference trusted expert reviews and real user feedback to find the products that actually deliver.',
  }
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbNode(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  }
}

/** Map our `availability` column to a schema.org URL. Drives the Offer honestly instead of
 *  hardcoding InStock — an out-of-stock/unavailable product must not advertise InStock. */
function availabilitySchema(a?: string | null): string {
  switch (a) {
    case 'out_of_stock':
      return 'https://schema.org/OutOfStock'
    case 'unavailable':
      return 'https://schema.org/Discontinued'
    default:
      // 'in_stock', null, or legacy 'unknown' — InStock is the safe default (an Offer is only
      // emitted when a real price exists, which today only happens via the PA-API sync).
      return 'https://schema.org/InStock'
  }
}

/**
 * A schema.org Product node built from a DB product row. Includes an Offer when a
 * real price exists and an editorial Review when a real rating exists — both are
 * omitted (rather than faked) when the data is missing.
 */
export function productNode(p: any, opts: { includeReview?: boolean } = {}) {
  const includeReview = opts.includeReview ?? true
  const price = Number(p.price)
  const hasPrice = Number.isFinite(price) && price > 0
  const rating = Number(p.rating)
  const hasRating = Number.isFinite(rating) && rating > 0
  const buyUrl =
    p.affiliate_url || p.amazon_url || p.bestbuy_url || (p.slug ? `${SITE_URL}/products/${p.slug}` : undefined)

  const node: Record<string, any> = {
    '@type': 'Product',
    name: p.name,
  }
  const img = absoluteUrl(p.image_url)
  if (img) node.image = img
  if (p.brand) node.brand = { '@type': 'Brand', name: p.brand }
  if (p.description) node.description = p.description
  if (p.slug) node.url = `${SITE_URL}/products/${p.slug}`
  if (p.asin) node.sku = p.asin

  if (hasPrice) {
    node.offers = {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'USD',
      availability: availabilitySchema(p.availability),
      ...(buyUrl ? { url: buyUrl } : {}),
    }
  }

  if (includeReview && hasRating) {
    node.review = {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: rating, bestRating: 5, worstRating: 1 },
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    }
  }

  return node
}

/** An ordered ItemList of Product nodes — used for "best X" roundups & category pages. */
export function itemListNode(products: any[], opts: { name: string; url: string }) {
  return {
    '@type': 'ItemList',
    name: opts.name,
    url: absoluteUrl(opts.url),
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: productNode(p),
    })),
  }
}
