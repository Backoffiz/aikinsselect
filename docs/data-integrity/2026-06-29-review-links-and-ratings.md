# Catalog data-integrity remediation (part 2) — 2026-06-29

Companion to [`README.md`](./README.md). This records the live-D1 fixes made by the
review-linker / "second agent" referenced there, plus the placeholder-rating cleanup
(the P2-ratings item). As with the rest of this folder, the catalog itself is not
version-controlled, so this is the reproducible record.

## Review→product links — wrong product *type* on review pages

Root cause: `review_products` was populated by `scraper/fix-review-products.ts`
(keyword `name.includes()`) and `scraper/link-review-products.ts` (whole-category),
both of which match on brand/category, not product type. The brand keyword `ninja`
put air fryers and an ice-cream maker into **Best Blender**; `cloud` put a bedding
comforter and a running shoe into **Best Gaming Headset**; `camera`/`tracker` pulled a
dog camera / dog GPS tracker into Webcam / Fitness Tracker.

Fix: re-linked 6 reviews to correct, type-matched products **already in the catalog**,
chosen by exact name (no keyword inference), ranked sensibly. Done via parameterized
exact-name lookups against the D1 HTTP API (DELETE the review's rows, INSERT contiguous
ranks with `rp_<reviewid8>_<n>` ids):

| Review | Now lists |
|--------|-----------|
| best-blender | Vitamix A3500, Ninja Professional Plus, Nutribullet Pro 900, Ninja Foodi Power Blender |
| best-air-fryer | Ninja Air Fryer Pro, Cosori Pro LE, Instant Vortex Plus, Philips Airfryer XXL, Ninja Foodi DualZone, Breville Smart Oven AF |
| best-coffee-maker | Breville Barista Express, Technivorm Moccamaster, De'Longhi Dinamica, Ninja 12-Cup, Nespresso Vertuo, AeroPress |
| best-gaming-headset | Arctis Nova Pro, HyperX Cloud III, Audeze Maxwell, Razer BlackShark V2 Pro, Logitech G Pro X 2 |
| best-webcam | Logitech Brio 500, Razer Kiyo Pro Ultra, Elgato Facecam Pro, Dell UltraSharp 4K, Insta360 Link |
| best-fitness-tracker | Garmin Venu 3, Fitbit Charge 6, Garmin Vivosmart 5, Whoop 4.0, Oura Ring (dropped Whistle dog tracker) |

## Archived products still linked

`review_products` has no status filter, so an archived product still renders as a pick.
Removed 3 such links and re-ranked / backfilled:

- **best-laptops** — dropped archived "Apple MacBook Air 13-inch M4", re-ranked to 5 picks.
- **best-smartwatch** — dropped archived "Apple Watch SE (2nd Gen)", re-ranked to 3 picks.
- **best-gaming-monitor** — dropped archived "Dell AW2725DM"; rebuilt with 5 real published
  monitors (Alienware AW2725D, ASUS ROG Swift PG27AQDP, Samsung Odyssey OLED G9, LG UltraGear
  27GS95QE, Samsung Odyssey OLED G8).

## P2 — placeholder ratings (now done)

Every non-null rating in the catalog was the fabricated default `4.5` (no real scores
exist yet). Nulled all of them so no fake stars display until the scoring engine produces
real "Aikins Scores":

```sql
UPDATE products SET rating = NULL, updated_at = datetime('now') WHERE rating = 4.5;
-- 42 rows (28 published + 14 archived); non-null ratings after: 0
```

Prices, availability, and brand remain P2-open and are best fixed by the PA-API sync
worker (price/image/availability — 326/342 products have an ASIN) and the scored
generator (ratings/brand/specs), not by hand.

## Prevention

`scripts/validate-catalog.mjs` (`npm run validate-catalog`) now guards all of the above:
type-mismatch / archived-link / orphan-link / no-picks / placeholder-rating / rating-range
are ERRORs (block deploy); thin-review, rank-gap, junk-slug, mangled-name, price-suspect,
pick-no-price, stale-availability are WARNs. Currently: **0 errors**.
