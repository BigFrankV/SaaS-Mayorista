CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_empresa VARCHAR(150) NOT NULL,
    rut VARCHAR(12) UNIQUE NOT NULL,
    giro VARCHAR(200) NOT NULL,
    direccion VARCHAR(250),
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo_barras VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 10,
    precio_neto INT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, codigo_barras)
);

CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo_documento VARCHAR(15) NOT NULL,
    rut_cliente VARCHAR(12),
    giro_cliente VARCHAR(200),
    total_neto INT NOT NULL,
    iva INT NOT NULL,
    total INT NOT NULL,
    fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_neto_historico INT NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jti VARCHAR(100) NOT NULL UNIQUE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    expira_en TIMESTAMP NOT NULL,
    revocado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revocado_en TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_productos_tenant ON productos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ventas_tenant ON ventas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_refresh_usuario ON refresh_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tenant ON refresh_tokens(tenant_id);
