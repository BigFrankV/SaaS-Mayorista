# Tasks: Módulo Usuarios y Roles

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Backend + Frontend shared) → PR 2 (Frontend UI) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Backend CRUD + product protection + frontend shared layer | PR 1 | `mvn -f backend/pom.xml test -Dtest=UserServiceTest,UserControllerTest,ProductControllerTest,AuthControllerTest` | N/A — tests only | Revert `UserController`, `UserService`, DTOs, `UserRepository` methods, `AuthService.getCurrentUserProfile`, `@PreAuthorize` in `ProductController`, `authStore`, `types`, `userApi` |
| 2 | Frontend user management UI + role-based navigation | PR 2 | `npx tsc --noEmit` | npm run dev + login as ADMIN/VENDEDOR, verify nav and /users route | Revert `router.tsx`, `RoleRoute`, `UserListPage`, `UserForm` |

## Phase 1: Backend Infrastructure

- [ ] 1.1 Add `findAllByTenantIdAndActivoTrue` and `countByTenantIdAndRolAndActivoTrue` to `UserRepository.java`
- [ ] 1.2 Create `CreateUserRequest.java` DTO (`email`, `password`, `nombre`, `rol` with validation)
- [ ] 1.3 Create `UpdateUserRequest.java` DTO (`email`, `nombre`, `rol`)
- [ ] 1.4 Create `UserResponse.java` DTO (`id`, `email`, `nombre`, `rol`, `activo`, `creadoEn`)
- [ ] 1.5 Create `MeResponse.java` record (`userId`, `tenantId`, `email`, `nombre`, `rol`)

## Phase 2: Core Backend Implementation

- [ ] 2.1 Add `getCurrentUserProfile(UUID userId)` to `AuthService.java` → returns `MeResponse`
- [ ] 2.2 Update `AuthController.java` `/auth/me` to return `MeResponse` via `AuthService`
- [ ] 2.3 Create `UserService.java` with CRUD, self-deletion guard (422), last-ADMIN guard (422)
- [ ] 2.4 Create `UserController.java` with 5 ADMIN-only endpoints (`GET /`, `POST /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`)

## Phase 3: Integration / Wiring

- [ ] 3.1 Add `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` to `ProductController` POST/PUT/DELETE
- [ ] 3.2 Add `MeResponse`, `UserResponse`, `CreateUserPayload`, `UpdateUserPayload` to frontend `types.ts`
- [ ] 3.3 Extend `authStore.ts`: `user` state, `setUser`/`clearUser` actions, `isAdmin` getter
- [ ] 3.4 Create `userApi.ts` with 5 CRUD functions (`list`, `create`, `getById`, `update`, `delete`)

## Phase 4: Frontend UI

- [ ] 4.1 Create `RoleRoute` component with `roles: UserRole[]` prop for conditional routing
- [ ] 4.2 Update `router.tsx`: `RoleRoute`, `/users` route, conditional nav (ADMIN sees Users link, VENDEDOR sees only Dashboard + POS), login redirect by role
- [ ] 4.3 Create `UserListPage.tsx` with table, create/edit/delete actions, ADMIN-only
- [ ] 4.4 Create `UserForm.tsx` for create/edit user with email, password/nombre, rol fields

## Phase 5: Testing

- [ ] 5.1 Unit test `UserService`: self-deletion returns 422, last-ADMIN deletion returns 422
- [ ] 5.2 Integration test `UserController`: 5 endpoints with ADMIN = 200/201/204, VENDEDOR = 403
- [ ] 5.3 Integration test `ProductController`: POST/PUT/DELETE with VENDEDOR returns 403
- [ ] 5.4 Integration test `AuthController`: `/auth/me` returns `{email, nombre, rol}`
