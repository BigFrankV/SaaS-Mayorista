# 🏬 SaaS Multitenant de Alimentos Mayoristas - Guía de Desarrollo

Este documento detalla la planificación, arquitectura, modelo de base de datos y la ruta de programación modular para el desarrollo del **SaaS Multitenant Mayorista de Alimentos**. 

La arquitectura elegida para este backend de alta transaccionalidad es la **Arquitectura Hexagonal (Ports & Adapters)** utilizando **Spring Boot (Java)** y **PostgreSQL**.

---

## 🛠️ Stack Tecnológico de Desarrollo
*   **Backend:** Spring Boot (Java 17/21), Spring Security, Spring Data JPA.
*   **Base de Datos:** PostgreSQL 15+.
*   **Caché y Sesiones:** Redis.
*   **Infraestructura de Desarrollo:** Docker / Docker-Compose.

> 💡 **Nota de Desarrollo:** Para agilizar el ciclo de feedback de código en la fase de construcción, el **Frontend (React)** se ejecutará de forma **local/manual** en tu máquina mediante `npm run dev` (omitido del Docker para desarrollo). El **Backend, PostgreSQL y Redis** se levantarán de forma automatizada mediante **Docker**.

---

## 🗺️ Ruta de Programación Modular (Paso a Paso)

### 📍 Fase 0: Infraestructura de Base de Datos y Docker Inicial
Antes de escribir código Java, debemos configurar el entorno para que la base de datos y la caché estén disponibles de inmediato.

1.  **Crear el archivo `docker-compose.yml` inicial** (solo con Postgres y Redis).
2.  **Ejecutar el script SQL de creación de tablas** en tu gestor de base de datos favorito (DBeaver, pgAdmin, etc.).
3.  **Generar la estructura de carpetas** de la Arquitectura Hexagonal en tu proyecto Spring Boot.

---

### 🔑 Módulo 1: Autenticación, Seguridad y Contexto Multitenant
El primer módulo lógico. No podemos registrar productos ni realizar ventas si no sabemos a qué distribuidora (Tenant) pertenecen de manera aislada.

*   **Paso 1:** Configurar la entidad de dominio de `Tenant` y `Usuario`.
*   **Paso 2:** Implementar Spring Security + JWT. El token de acceso debe contener en sus claims de forma obligatoria el `tenant_id` y el `rol`.
*   **Paso 3:** Implementar un filtro interceptor HTTP en Spring Boot que extraiga el `tenant_id` de cada petición entrante y lo asigne al hilo de ejecución (`ThreadLocal`) para que toda consulta posterior esté aislada automáticamente.

---

### 📦 Módulo 2: Catálogo de Alimentos e Inventario (Stock)
Con la seguridad y el aislamiento de tenants listos, procedemos a poblar nuestro inventario de alimentos.

*   **Paso 1:** Desarrollar los endpoints CRUD para `/api/v1/products`.
*   **Paso 2:** Asegurar que los endpoints filtren automáticamente los productos según el `tenant_id` del usuario logueado.
*   **Paso 3:** Desarrollar alertas básicas de quiebre de stock cuando el `stock_actual` sea menor o igual al `stock_minimo`.

---

### 🛒 Módulo 3: Punto de Venta (POS) y Descuento de Stock
Este es el motor de transacciones más crítico del negocio.

*   **Paso 1:** Diseñar la lógica del endpoint `POST /api/v1/sales`.
*   **Paso 2:** Implementar transacciones con bloqueos pesimistas (`SELECT FOR UPDATE` en Postgres) para descontar el stock de forma segura previniendo la venta simultánea de inventario inexistente por múltiples cajeros.
*   **Paso 3:** Agregar las reglas del mercado chileno:
    *   Validación algorítmica del RUT de clientes para facturación (módulo 11).
    *   Cálculo exacto del 19% del IVA sobre el subtotal neto de alimentos.
    *   Diferenciación estricta de campos requeridos si el documento es `BOLETA` o `FACTURA` (Razón Social, Giro Comercial, Dirección).

---

### 📄 Módulo 4: Generación de Comprobantes PDF y Dashboard
*   **Paso 1:** Generación asíncrona del documento PDF (Boleta/Factura) simulando el formato tributario DTE chileno (con desglose neto, IVA, total y código QR simulado).
*   **Paso 2:** Crear endpoints de analítica de ventas para el Dashboard del Administrador por Tenant (ej: ventas del día, balance neto, productos más vendidos).

---

## 📐 1. Modelo de Base de Datos PostgreSQL Completo

### Script de Creación DDL SQL (`schema.sql`)
Copia y ejecuta este script en tu instancia local de PostgreSQL para generar el esquema de base de datos relacional:

```sql
-- Habilitar extensión para UUIDs automáticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Tenants (Cada distribuidora independiente)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_empresa VARCHAR(150) NOT NULL,
    rut VARCHAR(12) UNIQUE NOT NULL,
    giro VARCHAR(200) NOT NULL,
    direccion VARCHAR(250),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios (Cajeros, Administradores)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL, -- 'ADMIN', 'VENDEDOR'
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Tabla de Productos (Catálogo de Alimentos)
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo_barras VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 10,
    precio_neto INT NOT NULL -- Valores netos en Pesos Chilenos ($)
);

-- 4. Tabla de Ventas (Boletas o Facturas emitidas)
CREATE TABLE ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo_documento VARCHAR(15) NOT NULL, -- 'BOLETA', 'FACTURA'
    rut_cliente VARCHAR(12),
    giro_cliente VARCHAR(200),
    total_neto INT NOT NULL,
    iva INT NOT NULL, -- 19%
    total INT NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Detalle de Ventas (Productos asociados a cada compra)
CREATE TABLE detalle_ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_neto_historico INT NOT NULL -- Evita que cambios de precio afecten reportes del pasado
);

-- Índices estratégicos para optimización Multitenant
CREATE INDEX idx_productos_tenant ON productos(tenant_id);
CREATE INDEX idx_ventas_tenant ON ventas(tenant_id);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
```

---

## 🐳 2. Configuración de Entorno de Desarrollo Docker

En tu fase inicial, utilizaremos Docker para simplificar el levantamiento de la base de datos y la caché en tu máquina local. A medida que vayas construyendo los módulos, el servicio del `backend` se agregará a este mismo archivo.

### Archivo: `docker-compose.yml` (Fase Inicial de Desarrollo)

```yaml
version: '3.8'

services:
  # Base de Datos Relacional
  postgres:
    image: postgres:15-alpine
    container_name: mayorista_postgres
    environment:
      POSTGRES_DB: mayorista_db
      POSTGRES_USER: mayorista_user
      POSTGRES_PASSWORD: mayorista_secure_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - saas_network

  # Caché de Lista Negra de Tokens JWT y Rate Limiting
  redis:
    image: redis:7-alpine
    container_name: mayorista_redis
    ports:
      - "6379:6379"
    networks:
      - saas_network

volumes:
  pgdata:

networks:
  saas_network:
    driver: bridge
```

---

## 🛠️ Flujo de Ejecución en Desarrollo (Fase de Código)

Para trabajar de manera ágil y cómoda durante tu desarrollo diario:

1.  **Levanta la Infraestructura base:**
    ```bash
    docker-compose up -d postgres redis
    ```
2.  **Carga las Tablas:** Conéctate a tu base de datos en `localhost:5432` con las credenciales configuradas en el docker-compose y ejecuta el código SQL provisto arriba.
3.  **Ejecuta tu Backend en tu IDE:** Abre IntelliJ IDEA y ejecuta el backend de Spring Boot localmente (conectándolo al puerto `5432` de tu máquina).
4.  **Ejecuta tu Frontend en tu Consola:** Abre tu terminal en la carpeta del frontend React y ejecuta:
    ```bash
    npm run dev
    ```

---

## 🇨🇱 Reglas de Validación de Negocio para el Código

### Algoritmo de RUT Chileno en Java (Módulo 3)
Esta función te servirá para validar el RUT ingresado por los clientes al momento de facturar:

```java
public boolean validarRut(String rutCompleto) {
    if (rutCompleto == null || rutCompleto.isEmpty()) return false;
    
    // Limpieza de caracteres comunes chilenos (. y -)
    String cleanRut = rutCompleto.replace(".", "").replace("-", "").toUpperCase();
    if (cleanRut.length() < 2) return false;
    
    String dv = cleanRut.substring(cleanRut.length() - 1);
    String rutCuerpo = cleanRut.substring(0, cleanRut.length() - 1);
    
    try {
        int rut = Integer.parseInt(rutCuerpo);
        int m = 0, s = 1;
        for (; rut != 0; rut /= 10) {
            s = (s + rut % 10 * (9 - m++ % 6)) % 11;
        }
        char dvCalculado = (char) (s != 0 ? s + 47 : 75);
        return dv.charAt(0) == dvCalculado;
    } catch (NumberFormatException e) {
        return false;
    }
}
```
