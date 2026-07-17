# Design: Módulo Usuarios y Roles

## Technical Approach

Extender el backend hexagonal existente con un `UserService` (application/) y `UserController` (api/) para CRUD de usuarios del tenant, protegido con `@PreAuthorize`. Agregar guards de rol en `ProductController` y enriquecer `/auth/me` con `email` + `nombre`. En el frontend, crear `modules/users/` con listado y formulario, extender `authStore` con datos del usuario, y agregar navegación condicional por rol en `router.tsx`.

## Architecture Decisions

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| UserService vs lógica en controller | Service permite test unitario y guards reusables | UserService con validaciones de negocio (self-deletion, last-ADMIN) |
| Repo query directa vs JPQL | Método derivado es simple para 1 filtro; JPQL para consultas complejas | `findAllByTenantIdAndActivoTrue` + `countByTenantIdAndRolAndActivoTrue` |
| Método propio en AuthService para `/auth/me` | Controller no debe acceder repos directamente; mantener hexagonal | `AuthService.getCurrentUserProfile(id)` devuelve `MeResponse` |
| Store userInfo completo vs solo rol | Guardar todo evita fetch extra; más datos en localStorage | `authStore` guarda `user: {id, email, nombre, rol}` + `isAdmin` derivado |
| RoleRoute wrapper vs inline checks | Componente reutilizable vs if-por-cada-ruta | `RoleRoute` wrapper con `roles: UserRole[]` prop |

## Data Flow

```
Frontend                          Backend
─────────                        ────────
LoginPage ──POST /auth/login──→ AuthService → JWT (userId, tenantId, role)
    │                                    │
    ├── store tokens + redirect          │
    └── GET /auth/me ───────────→ AuthService.getCurrentUserProfile()
         ←─ {id, email, nombre, rol}     │
         authStore.setUser(data)          │
                                          │
Admin crea usuario:                       │
UserForm ──POST /api/users ────→ UserController
     ←─ {id, email, nombre, rol}   └→ UserService
                                       ├─ hash password
                                       ├─ asignar tenantId
                                       └─ save
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../users/api/UserController.java` | Create | 5 endpoints @PreAuthorize ADMIN, delega a UserService |
| `.../users/api/CreateUserRequest.java` | Create | `{email, password, nombre, rol}` con validation |
| `.../users/api/UpdateUserRequest.java` | Create | `{email, nombre, rol}` (sin password) |
| `.../users/api/UserResponse.java` | Create | `{id, email, nombre, rol, activo, creadoEn}` |
| `.../users/application/UserService.java` | Create | CRUD + self-deletion guard + last-ADMIN guard |
| `.../users/domain/UserRepository.java` | Modify | + `findAllByTenantIdAndActivoTrue`, + `countByTenantIdAndRolAndActivoTrue` |
| `.../auth/api/AuthController.java` | Modify | `/auth/me` ahora usa `AuthService.getCurrentUserProfile` + devuelve `email` y `nombre` |
| `.../auth/application/AuthService.java` | Modify | + `getCurrentUserProfile(UUID userId)` → `MeResponse` |
| `.../auth/api/MeResponse.java` | Create | `{userId, tenantId, email, nombre, rol}` |
| `.../products/api/ProductController.java` | Modify | `@PreAuthorize` en POST/PUT/DELETE |
| `frontend/src/shared/store/authStore.ts` | Modify | + `user`, `setUser`, `clearUser`, `isAdmin` getter |
| `frontend/src/app/router.tsx` | Modify | RoleRoute, nav condicional, /users route, redirect por rol |
| `frontend/src/shared/api/types.ts` | Modify | + `UserResponse`, `MeResponse`, `CreateUserPayload` |
| `frontend/src/modules/users/pages/UserListPage.tsx` | Create | Tabla con crear/editar/borrar, solo ADMIN |
| `frontend/src/modules/users/components/UserForm.tsx` | Create | Modal/página para crear/editar usuario |
| `frontend/src/modules/users/api/userApi.ts` | Create | 5 funciones CRUD contra `/api/v1/users` |

## Interfaces / Contracts

**UserController — endpoints** (base `/api/v1/users`, requires `ROLE_ADMIN`):

| Método | Ruta | Request | Response |
|--------|------|---------|----------|
| GET | `/` | `?page&size` | `Page<UserResponse>` |
| POST | `/` | `CreateUserRequest` | `201 + UserResponse` |
| GET | `/{id}` | — | `UserResponse` |
| PUT | `/{id}` | `UpdateUserRequest` | `UserResponse` |
| DELETE | `/{id}` | — | `204` |

**MeResponse** (nuevo record en auth/api):
```java
public record MeResponse(
    UUID userId, UUID tenantId,
    String email, String nombre, String rol
) {}
```

**Frontend types**:
```typescript
type MeResponse = { userId: string; tenantId: string; email: string; nombre: string; rol: 'ADMIN' | 'VENDEDOR' };
type UserResponse = { id: string; email: string; nombre: string; rol: 'ADMIN' | 'VENDEDOR'; activo: boolean; creadoEn: string };
type CreateUserPayload = { email: string; password: string; nombre: string; rol: 'ADMIN' | 'VENDEDOR' };
type UpdateUserPayload = { email?: string; nombre?: string; rol?: 'ADMIN' | 'VENDEDOR' };
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit — UserService | self-deletion rejection, last-ADMIN guard | Mock UserRepository + assert exceptions |
| Integration — UserController | 5 endpoints con ADMIN OK + VENDEDOR 403 | `@WebMvcTest` con security mock |
| Integration — ProductController | POST/PUT/DELETE con VENDEDOR retorna 403 | `@WebMvcTest` con `@WithMockUser(roles="VENDEDOR")` |
| Integration — AuthController | `/auth/me` returns {email, nombre, rol} | `@WebMvcTest` |
| E2E (manual) | Frontend: ADMIN ve Users link, VENDEDOR no | Navegación + verificación visual |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Schema already has `rol` y `activo` en usuarios. Flyway no necesita cambios. Feature flags no necesarias porque las rutas nuevas solo existen si se despliega el código. Rollback: revertir commits de backend y frontend.

## Open Questions

- [ ] ¿Debe el JWT incluir `email` y `nombre` además de `role`? Decisión: no, se obtienen de `/auth/me`. Si se requiere optimización futura, se agregan al principal.
- [ ] ¿Paginación en GET /api/users? El spec no especifica. Se asume `Pageable` de Spring con default page 0 size 20.
