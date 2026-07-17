# Exploration: Módulos Usuarios, Inventario y Ventas

## Current State

### 1. Módulo Usuarios (Backend + Frontend)

#### Backend — YA EXISTE (completo, del cambio `modulo-usuarios-roles`)

| Archivo | Ruta | Estado |
|---------|------|--------|
| `UserController.java` | `backend/src/main/java/.../users/api/UserController.java` | ✅ Creado |
| `UserService.java` | `backend/src/main/java/.../users/application/UserService.java` | ✅ Creado |
| `UserEntity.java` | `backend/src/main/java/.../users/domain/UserEntity.java` | ✅ Creado |
| `UserRepository.java` | `backend/src/main/java/.../users/domain/UserRepository.java` | ✅ Creado |
| `UserRole.java` | `backend/src/main/java/.../users/domain/UserRole.java` | ✅ Creado |
| `CreateUserRequest.java` | `backend/src/main/java/.../users/api/CreateUserRequest.java` | ✅ Creado |
| `UpdateUserRequest.java` | `backend/src/main/java/.../users/api/UpdateUserRequest.java` | ✅ Creado |
| `UserResponse.java` | `backend/src/main/java/.../users/api/UserResponse.java` | ✅ Creado |

#### Backend Users — Detalles críticos

1. **Query de listado**: `UserService.list()` usa `findAllByTenantIdAndActivoTrue` — SOLO devuelve activos. El spec original (user-admin/spec.md) lo define así. Para listar TODOS (activos e inactivos) hay que cambiar a `findAllByTenantId` y agregar un nuevo método en el Repository.

2. **CreateUserRequest** tiene `password` (campo `@NotBlank @Size(min=6)`). ✅

3. **UpdateUserRequest** NO tiene `password` — solo `email`, `nombre`, `rol`. El frontend tampoco envía password en edit. Coincide con el spec original.

4. **getById** filtra por `activo=true` — si se quiere ver inactivos, hay que cambiar la lógica.

5. **Frontend**: formulario inline (NO modal). El `UserForm` se renderiza inline cuando `showForm=true` o `editingUser != null`.

#### Frontend Users — YA EXISTE

| Archivo | Ruta | Estado |
|---------|------|--------|
| `UserListPage.tsx` | `frontend/src/modules/users/pages/UserListPage.tsx` | ✅ Creado |
| `userApi.ts` | `frontend/src/modules/users/api/userApi.ts` | ✅ Creado |
| `RoleRoute.tsx` | `frontend/src/modules/users/components/RoleRoute.tsx` | ✅ Creado |

**userApi.ts** — 5 métodos: `list(page, size)`, `create`, `getById`, `update`, `delete`. ✅ Completo.

---

### 2. Módulo Inventario (Productos)

#### Backend — YA EXISTE (completo)

| Archivo | Ruta | Estado |
|---------|------|--------|
| `ProductController.java` | `backend/src/main/java/.../products/api/ProductController.java` | ✅ Creado |
| `ProductService.java` | `backend/src/main/java/.../products/application/ProductService.java` | ✅ Creado |
| `ProductEntity.java` | `backend/src/main/java/.../products/domain/ProductEntity.java` | ✅ Creado |
| `ProductRepository.java` | `backend/src/main/java/.../products/domain/ProductRepository.java` | ✅ Creado |
| `CreateProductRequest.java` | `backend/src/main/java/.../products/api/CreateProductRequest.java` | ✅ Creado |
| `UpdateProductRequest.java` | `backend/src/main/java/.../products/api/UpdateProductRequest.java` | ✅ Creado |
| `ProductResponse.java` | `backend/src/main/java/.../products/api/ProductResponse.java` | ✅ Creado |

**Detalles del backend Products:**

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| CRUD endpoints | ✅ | GET list, GET by id, POST create, PUT update, DELETE |
| Paginación | ✅ | `Pageable` con default size=20, sort=nombre |
| Cache | ✅ | `@Cacheable(value="products", keyGenerator="tenantAwareKeyGenerator")` en GETs |
| Cache evict | ✅ | `@CacheEvict(value="products", allEntries=true)` en POST/PUT/DELETE |
| Stock bajo | ✅ | `ProductResponse.stockBajo` = `stockActual <= stockMinimo` |
| `@PreAuthorize` | ✅ | POST/PUT/DELETE requieren `ROLE_ADMIN` |
| Filtro tenant | ✅ | `findAllByTenantId` y `findByIdAndTenantId` |
| Delete | ✅ | Borrado físico (`productRepository.delete(entity)`) — NO soft-delete |
| UpdateProductRequest | ⚠️ | NO incluye `codigoBarras` — solo `nombre`, `stockActual`, `stockMinimo`, `precioNeto` |
| ProductRepository | ⚠️ | Solo `findAllByTenantId` y `findByIdAndTenantId`. No hay query de stock bajo, ni búsqueda por código de barras |

#### Frontend Products — YA EXISTE (parcial)

| Archivo | Ruta | Estado |
|---------|------|--------|
| `ProductListPage.tsx` | `frontend/src/modules/products/pages/ProductListPage.tsx` | ✅ Creado |
| `productsApi.ts` | `frontend/src/shared/api/productsApi.ts` | ✅ Creado (incompleto) |

**productsApi.ts** — solo tiene:
- `list()` → devuelve `Product[]` (⚠️ el backend devuelve `Page<ProductResponse>`, hay mismatch de tipos)
- `create(payload)` → crea producto
- ❌ NO tiene `update(id, payload)`
- ❌ NO tiene `delete(id)`
- ❌ NO tiene `getById(id)`

**ProductListPage.tsx**:
- Formulario inline de creación (NO modal)
- Tabla con columnas: Código, Nombre, Stock, Mínimo, Precio, Estado
- Badge "Stock bajo" cuando `stockBajo === true`
- ❌ NO tiene botón Editar
- ❌ NO tiene botón Eliminar
- ❌ NO tiene paginación (carga todo en `items: Product[]`)
- ⚠️ `productsApi.list()` devuelve `Product[]` (array plano) — el backend devuelve `Page<ProductResponse>`, hay mismatch de tipos

---

### 3. Módulo Ventas

#### Backend — NO EXISTE (solo schema SQL)

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| `VentaEntity.java` | ❌ No existe | No hay clase JPA |
| `VentaController.java` | ❌ No existe | No hay endpoints REST |
| `VentaService.java` | ❌ No existe | No hay lógica de negocio |
| `VentaRepository.java` | ❌ No existe | No hay repositorio |
| `DetalleVentaEntity.java` | ❌ No existe | No hay clase JPA para detalle |
| `DetalleVentaRepository.java` | ❌ No existe | No hay repositorio |
| DTOs (request/response) | ❌ No existen | No hay CreateVentaRequest, VentaResponse, etc. |

**Schema SQL — SÍ EXISTE** en `V1__init_schema.sql`:

```sql
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
```

Columnas `ventas`: `id`, `tenant_id`, `usuario_id`, `tipo_documento`, `rut_cliente`, `giro_cliente`, `total_neto`, `iva`, `total`, `fecha_venta`
Columnas `detalle_ventas`: `id`, `venta_id`, `producto_id`, `cantidad`, `precio_neto_historico`

#### Frontend Sales — SOLO PLACEHOLDER

| Archivo | Ruta | Estado |
|---------|------|--------|
| `POSPage.tsx` | `frontend/src/modules/sales/pages/POSPage.tsx` | ❌ Placeholder (solo texto "Módulo en implementación") |

---

## Affected Areas

### Backend
- `backend/src/main/java/.../users/application/UserService.java` — cambiar query de listado para incluir inactivos, agregar password opcional en update
- `backend/src/main/java/.../users/domain/UserRepository.java` — agregar `findAllByTenantId` (sin filtro activo)
- `backend/src/main/java/.../users/api/UpdateUserRequest.java` — agregar campo `password` opcional
- `backend/src/main/java/.../users/api/UserController.java` — posible nuevo endpoint para reactivar usuarios
- `backend/src/main/java/.../products/api/ProductController.java` — agregar endpoint de stock bajo, búsqueda por código
- `backend/src/main/java/.../products/application/ProductService.java` — agregar métodos de filtro
- `backend/src/main/java/.../products/domain/ProductRepository.java` — agregar queries de stock bajo, búsqueda por código
- `backend/src/main/java/.../products/api/UpdateProductRequest.java` — agregar `codigoBarras`
- `backend/src/main/java/.../sales/` — TODO: crear módulo completo (entity, repository, service, controller, DTOs)

### Frontend
- `frontend/src/shared/api/productsApi.ts` — agregar `update`, `delete`, `getById`, corregir tipo de retorno de `list()`
- `frontend/src/modules/products/pages/ProductListPage.tsx` — agregar edición, eliminación, paginación
- `frontend/src/modules/sales/` — TODO: crear módulo completo (pages, api, components)
- `frontend/src/shared/api/types.ts` — agregar tipos de ventas
- `frontend/src/app/router.tsx` — agregar ruta de ventas si no existe

---

## Approaches

1. **Abordaje por módulo secuencial** — Users → Products → Sales
   - Pros: Enfoque ordenado, cada cambio es independiente, fácil de revisar
   - Cons: Puede generar múltiples PRs encadenados
   - Effort: Medium

2. **Abordaje paralelo** — Backend sales + Frontend mejoras simultáneas
   - Pros: Más rápido si hay múltiples developers
   - Cons: Mayor riesgo de conflictos, difícil de coordinar
   - Effort: High

3. **Abordaje mínimo viable** — Solo lo que falta para completar CRUDs existentes (users query, products edit/delete, sales backend básico)
   - Pros: Entrega rápida de valor, cambios enfocados
   - Cons: Puede dejar features a medias
   - Effort: Low-Medium

---

## Recommendation

**Abordaje 1 (secuencial)**: Es el más ordenado para un solo developer. El orden natural sería:

1. **Users** — Corregir query para listar todos (activos e inactivos), agregar password opcional en update, agregar endpoint para reactivar
2. **Products** — Completar CRUD frontend (editar, eliminar), corregir paginación, agregar búsqueda por código de barras
3. **Sales** — Crear módulo completo backend + frontend POS

## Risks

- **Ventas es un módulo grande**: requiere entities, repository, service, controller, DTOs, y frontend POS completo con bloqueo de stock
- **productsApi.list()** devuelve tipo incorrecto (`Product[]` vs `Page<ProductResponse>`) — rompería si se corrige sin ajustar el frontend
- **UpdateProductRequest** no permite cambiar `codigoBarras` — puede ser intencional o un bug
- **No hay tests** en ningún módulo (según openspec/config.yaml: `testing.strict_tdd: false`, test directories empty)

## Ready for Proposal

**Sí**. El mapa está completo. Se puede proceder a proposal con:

1. **Users**: Corregir query para listar todos (activos e inactivos), agregar password opcional en update, posible reactivación
2. **Products**: Completar CRUD frontend (editar, eliminar), corregir paginación, agregar búsqueda por código de barras
3. **Sales**: Crear módulo backend completo + frontend POS funcional
