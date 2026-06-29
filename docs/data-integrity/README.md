# Catalog data-integrity remediation — 2026-06-29

QA pass on the live Cloudflare **D1** catalog (`aikinsselect-db`): 358 products / 24 reviews /
12 categories. Structure was sound (no orphan products, no broken `review_products` FKs, no
exact-duplicate names). Content was corrupt, concentrated in the ~42 products the LLM
review-generation pipeline touched. The SQL in this folder was applied directly to prod D1 with
`wrangler d1 execute aikinsselect-db --remote --file <file>`; it's checked in as a reproducible
record (the catalog itself is not version-controlled).

## P0 — live, user-facing corruption (`2026-06-29-p0-fix.sql`)
- Archived 4 hallucinated / sentence-fragment product names that were live:
  "Apple M4 CPU Screen", "Sony WH-1000XM6 Audeze Maxwell",
  "Sony WH-1000XM4 Wireless SteelSeries", "Sony sensor mounted on".
- Deleted the 2 garbage links leaking into the "Best Over-Ear Headphones" review
  (`review_products` has no status filter, so archiving alone doesn't hide a product from a
  review page — the link must be deleted too).
- Corrected 3 brands all wrongly set to "Sony": AirPods Pro 2→Apple, Bose QC Ultra Earbuds→Bose,
  Galaxy Buds3 Pro→Samsung.
- Repaired the "Best Gaming Headset" review (comforter at #1, running shoe at #4). A second
  agent's review-linker later rebuilt that review to 5 real headsets, superseding the manual trim.

## P1 — product miscategorization (`2026-06-29-p1-recategorize.sql`)
`products.category_id` only — does **not** touch `review_products`.
- → Tech: MacBook Pro 16″ M4 Pro (laptop), AirPods Pro 3 (earbuds), Google Pixel 7 Pro (phone)
- → Office: Logitech MX Master 4, Logitech M185 (mice)

The review→product link half of P1 was handled concurrently by a second agent re-running the
catalog linker (rebuilds `review_products` with deterministic `rp_<reviewid>_<n>` ids).
**Coordination rule: do not write `review_products` while that linker is active.**

## P2 — still open (not addressed here)
Untrustworthy prices (83 NULL + dozens absurd), placeholder ratings (all `4.5`, 316/358 have
none), unpopulated availability, and bare Auto/Outdoors category pages. These need the
scraper / PA-API pipeline re-run rather than hand edits — and that is gated on rotating the
exposed Cloudflare API token first.
