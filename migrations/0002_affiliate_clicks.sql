-- 0002_affiliate_clicks.sql
-- T5 — first-party affiliate click tracking.
--
-- Append-only funnel log: which buy button, in which on-page location, drove each
-- outbound click. This is the one signal Amazon's own reporting cannot give us —
-- Amazon tells us what *converted*; this tells us what got *clicked and where*.
-- No cookies, no raw IP, no PII: coarse geo (country) + device class only.

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ts              TEXT NOT NULL DEFAULT (datetime('now')),
  created_date    TEXT NOT NULL DEFAULT (date('now')),
  product_id      TEXT,
  guide_id        TEXT,
  merchant        TEXT NOT NULL DEFAULT 'amazon',
  button_location TEXT NOT NULL DEFAULT 'unknown',
  page_url        TEXT,
  device_type     TEXT,
  country         TEXT
);

CREATE INDEX IF NOT EXISTS idx_clicks_date     ON affiliate_clicks(created_date);
CREATE INDEX IF NOT EXISTS idx_clicks_loc      ON affiliate_clicks(button_location);
CREATE INDEX IF NOT EXISTS idx_clicks_product  ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_clicks_merchant ON affiliate_clicks(merchant);
