# Propuesta: Módulos Usuarios / Inventario / Ventas

## Intent

Completar módulos core del SaaS Mayorista: corregir listado de usuarios (incluir inactivos), completar CRUD productos (editar/eliminar/paginar), y crear módulo ventas desde cero (backend + POS). Habilita el flujo completo negocio.

## Scope

| Bloque | In Scope | Out of Scope |
|--------|----------|--------------|
| **Usuarios** | Query `findAllByTenantId` (sin filtro activo), password opcional en update, formulario inline → modal | Nuevos roles, cambios de schema |
| **Inventario** | Query stock bajo en Repository, frontend editar/eliminar modal, paginación, corregir `productsApi.list()` | Búsqueda por código barras, reportes |
| **Ventas** | Backend completo (Entity→Controller), POS con carrito + bloqueo stock | PDF boleta, dashboard ventas, tests |

## Capabilities

**Nuevas**: `inventory-management` (CRUD + stock bajo + paginación frontend), `sales-pos` (ventas con carrito + bloqueo stock)

**Modificadas**: `user-admin` — listado cambia a todos los usuarios (no solo activos). Update permite password opcional. Delta spec requerido.

## Approach

Secuencial por riesgo creciente, 4 PRs stacked-to-main:

| PR | Bloque | Archivos clave | Est. líneas |
|----|--------|----------------|-------------|
| 1 | Usuarios | `UserRepository` (nueva query), `UserService` (list+update), `UpdateUserRequest` (+password), `UserListPage` (modal) | ~120 |
| 2 | Inventario | `ProductRepository` (+stock bajo), `productsApi` (+update/delete), `ProductListPage` (+modal+paginación), `types` (+PageResponse) | ~280 |
| 3 | Ventas backend | `VentaEntity`, `DetalleVentaEntity`, repos, service, controller, DTOs — nuevo paquete `sales/` | ~350 |
| 4 | Ventas frontend | `POSPage` (completo), `salesApi` (nuevo), carrito, bloqueo stock pesimista | ~400 |

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| `productsApi.list()` retorna `Product[]` pero backend devuelve `Page` — rompe al corregir | Migrar a `Page<ProductResponse>` en el mismo commit |
| Bloqueo stock concurrente | `@Lock(PESSIMISTIC_WRITE)` en repository. Fallback optimista v1 |
| Schema ventas ya existe en Flyway | Validar entities contra `V1__init_schema.sql`. No crear migración nueva |

## Rollback

Cada PR es autónomo y reversible. Revertir commit del PR que falla. Schema ventas ya existe — no hay migraciones nuevas que deshacer. PR3 y PR4 pueden revertirse sin afectar users/products.

## Dependencias

- Schema ventas existe en `V1__init_schema.sql`
- PR1 y PR2 son independientes entre sí
- PR4 necesita PR3 completado (backend ventas)
- Sin nuevas migraciones Flyway

## Success Criteria

- [ ] PR1: `GET /api/v1/users` devuelve activos e inactivos; modal crear/editar funcional con password opcional en edit
- [ ] PR2: Productos editables y eliminables desde modal; listado paginado; endpoint `?stockBajo=true` funciona
- [ ] PR3: `POST/GET /api/v1/sales` funcional; descuenta stock al crear venta
- [ ] PR4: POS con búsqueda productos, carrito editable, confirmación venta, bloqueo stock
