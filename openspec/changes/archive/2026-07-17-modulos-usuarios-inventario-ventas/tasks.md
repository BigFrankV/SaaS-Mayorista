# Tasks: Módulos Usuarios / Inventario / Ventas

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1150 (PR1=120, PR2=280, PR3=350, PR4=400) |
| 800-line budget risk | Medium (PR4=400, 50% del budget) |
| Chained PRs recommended | Yes |
| Suggested split | PR1(Users) → PR2(Inventory) → PR3(Sales Backend) → PR4(Sales Frontend) |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

## Suggested Work Units

| # | Goal | PR | Test command | Harness | Rollback |
|---|------|----|-------------|---------|----------|
| 1 | Users: modal + badge + inactivos | PR1 | `mvn test -pl backend -Dtest="UserServiceTest"` | `mvn spring-boot:run -pl backend` + `npm run dev` | Revert PR1 commit |
| 2 | Inventory: CRUD modal + pag + stock bajo | PR2 | `mvn test -pl backend -Dtest="ProductControllerTest"` | `mvn spring-boot:run -pl backend` + `npm run dev` | Revert PR2 commit |
| 3 | Sales backend: entity→controller | PR3 | `mvn test -pl backend -Dtest="VentaServiceTest,VentaControllerTest"` | `mvn spring-boot:run -pl backend` | Revert PR3 commit |
| 4 | Sales frontend: POS completo | PR4 | N/A (smoke test manual) | `npm run dev` + backend PR3 | Revert PR4 commit |

## PR1 — Users (Backend + Frontend)

### Backend
- [x] 1.1 `UserRepository`: `findAllByTenantId(UUID, Pageable)` sin filtro activo
- [x] 1.2 `UserService`: `list()` y `getById()` retornan inactivos
- [x] 1.3 `UpdateUserRequest`: + `@Nullable @Size(min=6) String password`
- [x] 1.4 `UserService.update()`: hashear solo si password presente

### Frontend
- [x] 2.1 `UserListPage`: form inline → modal crear/editar
- [x] 2.2 Tabla: badge verde "Activo" / gris "Inactivo"

### Tests
- [ ] 3.1 Test: `list()` incluye activos e inactivos
- [ ] 3.2 Test: `update()` sin password no modifica; con password hashea

## PR2 — Inventory (Backend + Frontend)

### Backend
- [x] 1.1 `ProductRepository`: `findByStockBajo()` + `search()` (@Query nativas)
- [x] 1.2 `ProductService`: `listByStockBajo()`, `searchByCodigo()`
- [x] 1.3 `ProductController`: `?stockBajo=true` y `?search=`

### Frontend
- [x] 2.1 `types.ts`: `PageResponse<T>`, `UpdateProductPayload`
- [x] 2.2 `productsApi`: `list()`→`Page`; +`update()`, +`delete()`
- [x] 2.3 `ProductListPage`: modal crear/editar
- [x] 2.4 `ProductListPage`: eliminación con confirmación
- [x] 2.5 `ProductListPage`: paginación server-side

### Tests
- [ ] 3.1 Test: `?stockBajo=true` filtra stock bajo
- [ ] 3.2 Test: `?search=` busca por código/nombre

## PR3 — Sales Backend

### Entities
- [x] 1.1 `VentaEntity` mapeando schema `ventas`
- [x] 1.2 `DetalleVentaEntity` mapeando `detalle_ventas`

### Persistence
- [x] 2.1 `VentaRepository` con `findAllByTenantId()`
- [x] 2.2 `DetalleVentaRepository`

### Business Logic
- [x] 3.1 `VentaMapper` (Entity ↔ Response)
- [x] 3.2 `VentaService.crear()`: @Transactional, IVA 19%, @Lock(PESSIMISTIC_WRITE) stock decrement

### API
- [x] 4.1 `CreateVentaRequest` con `ItemVenta` record
- [x] 4.2 `VentaResponse`, `DetalleResponse`
- [x] 4.3 `VentaController`: POST/GET /api/sales paginado

### Tests
- [ ] 5.1 Test: IVA 19% correcto (documentado — sin infraestructura de testing)
- [ ] 5.2 Test: stock decrement con lock pesimista (documentado — sin infraestructura de testing)
- [ ] 5.3 Test: stock insuficiente → 422 + rollback total (documentado — sin infraestructura de testing)
- [ ] 5.4 Test: POST/GET autorizado ADMIN/VENDEDOR (documentado — sin infraestructura de testing)

## PR4 — Sales Frontend

### API Layer
- [x] 1.1 `salesApi.ts`: `create(payload)`, `list(page,size)`
- [x] 1.2 `types.ts`: `SalePayload`, `SaleResponse`, `CartItem`

### Components
- [x] 2.1 `ProductSearch.tsx`: buscador con resultados
- [x] 2.2 `CartItem.tsx`: fila editable (cantidad + remove)

### POS Page
- [x] 3.1 `POSPage.tsx`: carrito useReducer, búsqueda, confirmación
- [x] 3.2 Limpiar carrito post-venta + notificación

## Dependencias entre unidades

- PR1 ↔ PR2: independientes entre sí
- PR3 → PR4: PR4 necesita backend ventas funcionando
- Sin migraciones Flyway nuevas (schema ya existe en `V1__init_schema.sql`)
