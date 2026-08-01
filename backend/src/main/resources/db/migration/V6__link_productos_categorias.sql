-- V6: Link productos.categoria (legacy free-text from V2) to the categorias
-- table (V3) through a real foreign key.
--
-- The legacy VARCHAR column is kept for backward compatibility (the entity
-- still maps it); it is scheduled to be dropped once the FK is the single
-- source of truth (see docs/DEUDA-TECNICA.md).

-- 1) Add the FK column (nullable: a product may have no category).
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id);

-- 2) Backfill existing data.
--    2a) If the legacy text is a UUID that matches an existing category of the
--        same tenant, link directly (the current frontend stores category IDs
--        in the text field).
UPDATE productos p
SET categoria_id = c.id
FROM categorias c
WHERE p.categoria_id IS NULL
  AND p.categoria IS NOT NULL
  AND btrim(p.categoria) <> ''
  AND c.tenant_id = p.tenant_id
  AND c.id::text = btrim(p.categoria);

--    2b) Create one category per (tenant, legacy text) value that does not
--        exist yet. ON CONFLICT DO NOTHING relies on UNIQUE(tenant_id, nombre)
--        and also dedupes rows generated inside this statement.
INSERT INTO categorias (id, tenant_id, nombre, activo, creado_en)
SELECT gen_random_uuid(), p.tenant_id, btrim(p.categoria), TRUE, NOW()
FROM productos p
WHERE p.categoria_id IS NULL
  AND p.categoria IS NOT NULL
  AND btrim(p.categoria) <> ''
ON CONFLICT (tenant_id, nombre) DO NOTHING;

--    2c) Link the remaining products to the categories created in 2b (exact
--        name match on the trimmed value).
UPDATE productos p
SET categoria_id = c.id
FROM categorias c
WHERE p.categoria_id IS NULL
  AND p.categoria IS NOT NULL
  AND btrim(p.categoria) <> ''
  AND c.tenant_id = p.tenant_id
  AND c.nombre = btrim(p.categoria);

-- 3) Index for FK lookups and the category filter (GET /products?categoria=).
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);

-- 4) I6: indexes for foreign keys created without one in V1/V5.
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta ON detalle_ventas(venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_producto ON detalle_ventas(producto_id);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
-- Note: UNIQUE(tenant_id, nombre) already covers tenant-only lookups; this
-- index is added for clarity and consistency with the other *_tenant indexes.
CREATE INDEX IF NOT EXISTS idx_categorias_tenant ON categorias(tenant_id);
