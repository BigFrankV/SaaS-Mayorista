# Proposal: User & Roles Module

## Intent

Enable tenant-wide user administration and role-based access control. Currently only auth (login/JWT) exists — no user management UI, no role-based navigation, no endpoint protection. Any authenticated user can access any resource, and there's no way to create or manage users beyond the seeded admin.

## Scope

### In Scope
- 5 REST endpoints for user CRUD (list, create, read, update, soft-delete), ADMIN-only
- `@PreAuthorize` guards on existing product endpoints (POST/PUT/DELETE)
- Role-based frontend navigation: ADMIN sees everything, VENDEDOR only Dashboard + POS
- User management page (list, create, edit, delete) accessible to ADMIN
- Store user role in authStore from `/auth/me`
- Self-deletion and last-ADMIN protection

### Out of Scope
- Audit log of user changes
- Email-based password reset flow
- Cross-tenant user management
- Custom role creation (only ADMIN / VENDEDOR)

## Capabilities

### New Capabilities
- `user-admin`: CRUD de usuarios del tenant con soft-delete, restringido a ADMIN

### Modified Capabilities
- `auth`: Store user role after login; return `rol` in `/auth/me` response
- `products`: Protect POST/PUT/DELETE endpoints with `@PreAuthorize(ADMIN)`

## Approach

**Backend**: Create `UserController` (api/) and `UserService` (application/) with DTOs. Reuse existing `UserEntity` / `UserRepository`. Filter by `activo=true` for listing. Apply `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` on user endpoints and product write endpoints. Service-layer guard prevents self-deletion and last-ADMIN scenario.

**Frontend**: Create `modules/users/` with `UserListPage` (table + actions) and `UserForm` component. Extend `authStore` to hold user role from `/auth/me`. Add role-based rendering in `router.tsx`: ADMIN sees Dashboard, Products, POS, Users; VENDEDOR sees Dashboard and POS only. Login redirect targets role-specific default.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.../users/api/UserController.java` | New | 5 ADMIN-only user endpoints |
| `.../users/application/UserService.java` | New | Business logic + deletion guard |
| `.../users/domain/UserRepository.java` | Modified | Add `findAllByTenantIdAndActivoTrue` |
| `.../products/api/ProductController.java` | Modified | Add `@PreAuthorize` on write ops |
| `.../auth/api/AuthController.java` | Modified | Return `rol` in `/auth/me` |
| `frontend/src/modules/users/` | New | UserListPage, UserForm |
| `frontend/src/app/router.tsx` | Modified | Role-based nav + redirect |
| `frontend/src/shared/store/authStore.ts` | Modified | Store user role |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Self-deletion locks user | Low | Service layer prevents deleting own user |
| Orphan sales references | Low | Soft-delete preserves FK integrity |

## Rollback Plan

Revert `UserController`, `UserService`, and `UserRepository` additions. Remove `@PreAuthorize` annotations from `ProductController`. Revert `router.tsx` and `authStore` changes.

## Dependencies

- Existing JWT auth with role in principal (`JwtRequestPrincipal`)
- Existing `@EnableMethodSecurity` in `SecurityConfig`
- Existing `DevBootstrapSeeder` for initial ADMIN

## Success Criteria

- [ ] ADMIN can list, create, edit, and soft-delete users via API and UI
- [ ] VENDEDOR gets HTTP 403 on user endpoints and product write endpoints
- [ ] VENDEDOR sees only Dashboard + POS in navigation
- [ ] ADMIN cannot soft-delete own account (return 422)
- [ ] Login redirects ADMIN to Dashboard, VENDEDOR to POS
