# Design: Módulos Usuarios / Inventario / Ventas

## Technical Approach

Evolución secuencial en 4 PRs stacked-to-main siguiendo la arquitectura hexagonal existente. PR1 arregla listado de usuarios (incluir inactivos) y password opcional en update. PR2 completa CRUD frontend de productos con modal y paginación server-side. PR3 crea módulo ventas backend desde cero (`sales/` con entity, repository, service, controller, DTOs). PR4 implementa POS con carrito local y bloqueo pesimista de stock. Cada PR es autónomo y reversible.

## Architecture Decisions

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Modal vs form inline para users/products | Modal aísla UX, no contamina layout padre; inline es más simple para 1 campo | **Modal** — consistencia entre users y products, mejor UX en listados |
| Paginación server-side (Spring `Page`) vs client-side | Server-side escala con N registros; client-side evita round-trips | **Server-side** — patrón existente en `UserController` + `ProductController`. `productsApi.list()` se corrige a `Page<Product>` |
| Stock blocking: `PESSIMISTIC_WRITE` vs `@Version` optimista | Pesimista evita race conditions en ventas concurrentes; optimista requiere retry y es mejor para baja contención | **PESSIMISTIC_WRITE** — riesgo de concurrencia real en POS. Fallback optimista en v2 si hay contención medida |
| Password opcional en update: mismo DTO con `@Nullable` vs DTO separado | Mismo DTO reduce clases, pero rompe `@Valid` si el password falla validación en create | **Mismo DTO + `@JsonInclude(NON_NULL)`** — patrón existente (todos los campos de UpdateRequest son nullable). `@Size(min = 6)` solo se evalúa si el campo está presente |
| Carrito POS: estado local vs Zustand global | Local evita re-renders innecesarios y cleanup manual; global persiste entre páginas | **Estado local (useState + useReducer)** — el carrito solo vive en POSPage, no necesita persistencia global |

## Data Flow

```
PR1 — Edición usuario con modal:

  UserListPage ──Click "Editar"──→ Modal abierto con UserForm(Mode=EDIT)
       │                                    │
       │  PUT /api/v1/users/{id} ←── onSubmit(UpdateUserPayload)
       │  {password?: ...}
       ▼
  UserController → UserService.update()
       │
       ├── Find by id + tenant check
       ├── if (password != null) → hash + setPasswordHash
       └── save → UserResponse

PR3-PR4 — Ciclo de vida carrito POS:

  POSPage (local state)
       │
       ├── Busca producto → GET /api/v1/products?search=... (server page)
       ├── Add to cart → {items: [{productId, cantidad, precioNeto}]}
       ├── Edit cantidad / remove item
       │
       └── Confirmar venta → POST /api/v1/sales
                │
                ▼
       VentaService.crear()
            │
            ├── @Transactional
            ├── Calcular IVA (19%)
            ├── Save VentaEntity + Detalles
            ├── ProductRepository.decrementarStock() ←── @Lock(PESSIMISTIC_WRITE)
            │       por cada detalle
            └── Limpiar carrito (frontend)
```

## File Changes

| Archivo | Acción | PR | Descripción |
|---------|--------|----|-------------|
| `backend/.../users/domain/UserRepository.java` | Modificar | PR1 | + `findAllByTenantId(UUID, Pageable)` (sin filtro activo) |
| `backend/.../users/application/UserService.java` | Modificar | PR1 | `list()` usa findAllByTenantId; `update()` acepta password opcional; `getById()` quita filtro activo |
| `backend/.../users/api/UpdateUserRequest.java` | Modificar | PR1 | + `@Nullable @Size(min=6) String password` con `@JsonInclude(NON_NULL)` |
| `frontend/.../users/pages/UserListPage.tsx` | Modificar | PR1 | Form inline → modal con UserForm en overlay; estado `editingUser` y `showForm` mueven a modal |
| `frontend/.../users/api/userApi.ts` | Sin cambio | — | Ya soporta paginación y update |
| `backend/.../products/domain/ProductRepository.java` | Modificar | PR2 | + `findByTenantIdAndStockActualLessThanEqual(UUID, int, Pageable)` para stock bajo |
| `backend/.../products/api/ProductController.java` | Modificar | PR2 | + `GET ?stockBajo=true` filtra por stock bajo; + `GET ?search=` búsqueda por código |
| `backend/.../products/application/ProductService.java` | Modificar | PR2 | + `listByStockBajo()`, + `searchByCodigo()` |
| `frontend/.../shared/api/productsApi.ts` | Modificar | PR2 | `list(page, size, stockBajo?)` → `Page<Product>`; + `update(id, payload)`, + `delete(id)` |
| `frontend/.../products/pages/ProductListPage.tsx` | Modificar | PR2 | Form inline → modal crear/editar; +columna acciones editar/eliminar; +paginación |
| `frontend/.../shared/api/types.ts` | Modificar | PR2 | + `PageResponse<T>` genérico; + `UpdateProductPayload`; + `SalePayload`, `SaleResponse`, `VentaResponse` (PR3-4) |
| `backend/.../sales/domain/VentaEntity.java` | Crear | PR3 | Entity JPA para `ventas` |
| `backend/.../sales/domain/DetalleVentaEntity.java` | Crear | PR3 | Entity JPA para `detalle_ventas` |
| `backend/.../sales/domain/VentaRepository.java` | Crear | PR3 | + `findAllByTenantId(UUID, Pageable)` |
| `backend/.../sales/domain/DetalleVentaRepository.java` | Crear | PR3 | Búsqueda por venta_id |
| `backend/.../sales/application/VentaService.java` | Crear | PR3 | Lógica: crear venta con detalle, calcular IVA, decrementar stock con lock |
| `backend/.../sales/application/VentaMapper.java` | Crear | PR3 | Entity ↔ Response |
| `backend/.../sales/api/VentaController.java` | Crear | PR3 | `POST /api/v1/sales`, `GET /api/v1/sales` (paginated) |
| `backend/.../sales/api/CreateVentaRequest.java` | Crear | PR3 | `{tipoDocumento, rutCliente?, giroCliente?, items: [{productoId, cantidad}]}` |
| `backend/.../sales/api/VentaResponse.java` | Crear | PR3 | `{id, total, iva, fecha, items: DetalleResponse[]}` |
| `frontend/.../modules/sales/api/salesApi.ts` | Crear | PR4 | Cliente HTTP para endpoints sales |
| `frontend/.../modules/sales/pages/POSPage.tsx` | Modificar | PR4 | Placeholder → POS completo con buscador, carrito (useReducer), confirmación, limpieza |
| `frontend/.../modules/sales/components/CartItem.tsx` | Crear | PR4 | Fila de carrito editable (cantidad, remove) |
| `frontend/.../modules/sales/components/ProductSearch.tsx` | Crear | PR4 | Buscador con resultados paginados |
| `frontend/.../app/router.tsx` | Sin cambio | — | Ruta `/pos` ya existe |

## Interfaces / Contracts

**Ventas — Backend endpoints** (base `/api/v1/sales`):

| Método | Ruta | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/` | ADMIN, VENDEDOR | `CreateVentaRequest` | `201 + VentaResponse` |
| GET | `/` | ADMIN, VENDEDOR | `?page&size` | `Page<VentaResponse>` |

```java
// CreateVentaRequest.java
public record CreateVentaRequest(
    @NotBlank String tipoDocumento,           // "BOLETA" | "FACTURA"
    String rutCliente,
    String giroCliente,
    @NotNull @Size(min = 1) List<ItemVenta> items
) {
  public record ItemVenta(@NotNull UUID productoId, @Min(1) int cantidad) {}
}

// VentaResponse.java
public record VentaResponse(
    UUID id, UUID tenantId, UUID usuarioId,
    String tipoDocumento, String rutCliente, String giroCliente,
    int totalNeto, int iva, int total, Instant fechaVenta,
    List<DetalleResponse> detalles
) {}

// DetalleResponse.java
public record DetalleResponse(UUID id, UUID productoId, String nombreProducto, int cantidad, int precioNetoHistorico) {}
```

**Frontend — TypeScript:**

```typescript
// En types.ts
type PageResponse<T> = { content: T[]; totalElements: number; totalPages: number; number: number; size: number };
type SalePayload = { tipoDocumento: 'BOLETA' | 'FACTURA'; rutCliente?: string; giroCliente?: string; items: Array<{ productoId: string; cantidad: number }> };
type SaleResponse = { id: string; total: number; iva: number; fecha: string; detalles: Array<{ productoId: string; nombreProducto: string; cantidad: number }> };
type CartItem = { producto: Product; cantidad: number; subtotal: number };
```

**Product page response — corregir tipo:**
```typescript
// productsApi.list() cambia de Product[] a PageResponse<Product>
```

## Testing Strategy

| Capa | Qué testear | Enfoque |
|------|-----------|---------|
| Unit — UserService | list() incluye inactivos; update() con password opcional hashea | Mock UserRepository |
| Unit — VentaService | Calcular IVA, decrementar stock, validar stock insuficiente | Mock ProductRepository con lock |
| Integration — VentaController | POST/GET sales con ADMIN y VENDEDOR | `@WebMvcTest` con security |
| Integration — ProductController | `?stockBajo=true` filtra, `?search=` busca | `@WebMvcTest` |
| Manual — Frontend | Modal users (crear/editar), modal products (editar/eliminar), POS flujo completo | Smoke test visual |

Nota: `openspec/config.yaml` reporta `testing.strict_tdd: false` y directorios de test vacíos. Tests son recomendados pero no bloqueantes.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. El bloqueo de stock usa `@Lock(PESSIMISTIC_WRITE)` de JPA (SQL `SELECT ... FOR UPDATE` dentro de la misma transacción de base de datos), no involucra subprocesos, locks de OS, ni integraciones externas.

## Migration / Rollout

No se requiere migración Flyway. El schema de `ventas` y `detalle_ventas` ya existe en `V1__init_schema.sql`. Las entities JPA deben mapear exactamente contra ese schema. Rollback: revertir el commit del PR que falle. PR1 y PR2 son independientes; PR4 depende de PR3.

## Open Questions

- [ ] `UpdateProductRequest` no expone `codigoBarras` — ¿se debe agregar en PR2? La propuesta lo marca out-of-scope, pero la exploration lo señala como posible bug.
- [ ] ¿Se requiere endpoint de reactivación de usuarios (PUT para volver `activo=true`)? La propuesta no lo exige, pero la exploration lo sugiere.
- [ ] ¿El POS necesita tecla rápida para cambiar tipo documento (boleta/factura) o se define por configuración del tenant?
