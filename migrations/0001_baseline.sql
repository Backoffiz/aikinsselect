-- Aikins Select — D1 baseline schema (migration 0001)
--
-- Captured verbatim from PRODUCTION D1 (`aikinsselect-db`) on 2026-06-30, because the
-- live schema had drifted from the old checked-in `../d1-schema.sql`: the columns
-- `description`, `asin`, `availability`, `last_checked_at` and the partial unique index
-- `idx_products_asin_active` were added ad-hoc via `wrangler d1 execute --remote` and were
-- never version-controlled. This file is now the source of truth — recreate/verify with:
--   SELECT type,name,tbl_name,sql FROM sqlite_master WHERE sql IS NOT NULL;
--
-- The PA-API product-sync worker and the validation guard both depend on the asin/
-- availability/last_checked_at columns + the partial unique index below.

CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  product_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES categories(id),
  brand TEXT,
  model TEXT,
  price REAL,
  image_url TEXT,
  amazon_url TEXT,
  bestbuy_url TEXT,
  affiliate_url TEXT,
  rating REAL,
  is_best_pick INTEGER DEFAULT 0,
  is_trending INTEGER DEFAULT 0,
  pros TEXT,            -- JSON array
  cons TEXT,            -- JSON array
  specs TEXT,           -- JSON object
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  description TEXT,
  asin TEXT,
  availability TEXT,    -- 'in_stock' | 'out_of_stock' | 'unavailable' (PA-API worker)
  last_checked_at TEXT  -- last PA-API refresh timestamp
);

-- ASIN must be unique only among PUBLISHED products (a partial index). Multiple NULL/archived
-- rows may share an ASIN; a second *published* row with the same ASIN is the collision the
-- generator's upsert guards against.
CREATE UNIQUE INDEX idx_products_asin_active ON products(asin) WHERE asin IS NOT NULL AND status='published';
CREATE INDEX idx_products_best_pick ON products(is_best_pick) WHERE is_best_pick = 1;
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_trending ON products(is_trending) WHERE is_trending = 1;

CREATE TABLE review_products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  review_id TEXT REFERENCES reviews(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  rank INTEGER,
  mini_review TEXT,
  UNIQUE(review_id, product_id)
);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  category_id TEXT REFERENCES categories(id),
  author TEXT DEFAULT 'Aikins Select',
  content TEXT NOT NULL,
  excerpt TEXT,
  hero_image TEXT,
  is_featured INTEGER DEFAULT 0,
  is_trending INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_reviews_featured ON reviews(is_featured) WHERE is_featured = 1;
CREATE INDEX idx_reviews_published ON reviews(published_at);
CREATE INDEX idx_reviews_status ON reviews(status);

CREATE TABLE sources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  url TEXT NOT NULL UNIQUE,
  site_name TEXT,
  title TEXT,
  scraped_at TEXT DEFAULT (datetime('now')),
  content_hash TEXT,
  category TEXT,
  products_found TEXT  -- JSON array
);

CREATE INDEX idx_sources_site ON sources(site_name);

CREATE TABLE subscribers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TEXT DEFAULT (datetime('now')),
  is_active INTEGER DEFAULT 1
);
