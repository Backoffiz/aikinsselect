-- Aikins Select — P0 data-integrity remediation (2026-06-29)
-- Applied to PROD D1 (aikinsselect-db) via: wrangler d1 execute aikinsselect-db --remote --file <this>
-- Reversible: archive (not delete) products; link deletes are re-derivable from review content.

-- A) Un-publish 4 hallucinated / sentence-fragment product names that were live to users
UPDATE products SET status='archived', updated_at=datetime('now')
WHERE id IN (
  'd1846373c90a18d823274f08ee4b2b48', -- "Apple M4 CPU Screen"
  'e7ee609bc923cea1337262dac0d758fb', -- "Sony WH-1000XM6 Audeze Maxwell"
  'c83436279a7b5fc095c10b64d96d8c31', -- "Sony WH-1000XM4 Wireless SteelSeries"
  '8e7da03121b6009bed1dbdda15f7e5cf'  -- "Sony sensor mounted on"
);

-- B) Remove the 2 garbage links so they don't leak into the "Best Over-Ear Headphones" review
--    (review_products has no status filter, so archiving alone wouldn't hide them)
DELETE FROM review_products
WHERE product_id IN (
  'e7ee609bc923cea1337262dac0d758fb', -- "Sony WH-1000XM6 Audeze Maxwell" (was rank 4)
  'c83436279a7b5fc095c10b64d96d8c31'  -- "Sony WH-1000XM4 Wireless SteelSeries" (was rank 5)
);

-- C) Correct 3 mislabeled brands (all wrongly set to "Sony")
UPDATE products SET brand='Apple',   updated_at=datetime('now') WHERE id='6daa94fce5ce8bc59ce39cef96055736'; -- Apple AirPods Pro 2
UPDATE products SET brand='Bose',    updated_at=datetime('now') WHERE id='b0a3c0dc11739ffb120bcdfb00179512'; -- Bose QuietComfort Ultra Earbuds
UPDATE products SET brand='Samsung', updated_at=datetime('now') WHERE id='334ed3c09efbacc7175d33d6c9052a26'; -- Samsung Galaxy Buds3 Pro

-- D) Repair "Best Gaming Headset of 2026": drop the comforter (#1) and running shoe (#4),
--    promote the two real headsets to ranks 1 and 2.
--    NOTE: a second agent's review-linker later rebuilt this review to 5 real headsets,
--    superseding this manual trim. Kept here for the record.
DELETE FROM review_products WHERE id IN (
  'rp_010c1caf_0', -- "Buffy Cloud Comforter" (was #1)
  'rp_010c1caf_3'  -- "On Cloudmonster 2"     (was #4)
);
UPDATE review_products SET rank=1 WHERE id='rp_010c1caf_1'; -- SteelSeries Arctis Nova Pro Wireless -> #1
UPDATE review_products SET rank=2 WHERE id='rp_010c1caf_2'; -- HyperX Cloud III Wireless            -> #2
