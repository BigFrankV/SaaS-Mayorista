CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rut VARCHAR(12) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    giro VARCHAR(255),
    direccion VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, rut)
);

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS nombre_cliente VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_clientes_tenant ON clientes(tenant_id);
