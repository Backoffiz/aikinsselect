-- Aikins Select — P1 product-category recategorization (2026-06-29)
-- Applied to PROD D1 (aikinsselect-db) via: wrangler d1 execute aikinsselect-db --remote --file <this>
-- products.category_id only. Does NOT touch review_products (a second agent's linker owns that table).

-- → Tech
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='tech'), updated_at=datetime('now')
WHERE id='f79309989468ecbdcd949f35897d9943'; -- Apple MacBook Pro 16-inch M4 Pro  (laptop; was Office)
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='tech'), updated_at=datetime('now')
WHERE id='c73aef3ccc05d399451560cc2fb2555c'; -- Apple AirPods Pro 3  (earbuds; was Gaming)
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='tech'), updated_at=datetime('now')
WHERE id='ab94d464246906da532021b96ffe11e0'; -- Google Pixel 7 Pro  (phone; was Office)

-- → Office
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='office'), updated_at=datetime('now')
WHERE id='557eaa65c35fd0d00dfb7343d590c941'; -- Logitech MX Master 4  (productivity mouse; was Gaming)
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='office'), updated_at=datetime('now')
WHERE id='7838e84e3e76af8a4fb47b68bebd9931'; -- Logitech M185 Wireless Mouse  (basic office mouse; was Gaming)
