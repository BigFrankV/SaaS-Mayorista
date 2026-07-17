# User Admin Specification

## Purpose

Tenant-scoped user management — ADMIN-only CRUD with soft-delete and protections against self-deletion and last-ADMIN removal.

## Requirements

### Requirement: ADMIN-scoped User CRUD

The system MUST expose five endpoints for user management, all restricted to ADMIN via `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.

| Operation | Method | Path | Description |
|-----------|--------|------|-------------|
| List | GET | `/api/users` | Paginated active users within tenant |
| Create | POST | `/api/users` | Create user with email, password, nombre, rol |
| Read | GET | `/api/users/{id}` | Single user details |
| Update | PUT | `/api/users/{id}` | Update email, nombre, rol (not password) |
| Delete | DELETE | `/api/users/{id}` | Soft-delete (set `activo=false`) |

#### Scenario: ADMIN lists active users

- GIVEN the requester is ADMIN of tenant T
- WHEN GET `/api/users` is called
- THEN return 200 with paginated list where all users have `activo=true`

#### Scenario: VENDEDOR cannot access user endpoints

- GIVEN the requester has role VENDEDOR
- WHEN any user endpoint is called
- THEN return 403 Forbidden

#### Scenario: ADMIN creates a user in own tenant

- GIVEN the requester is ADMIN
- WHEN POST `/api/users` is called with `{email, password, nombre, rol}`
- THEN return 201 with created user scoped to the ADMIN's tenant

#### Scenario: ADMIN soft-deletes a user

- GIVEN the target user is not the requester and is not the last ADMIN
- WHEN DELETE `/api/users/{id}` is called
- THEN set `activo=false` and return 200 or 204

### Requirement: Self-deletion Protection

The system SHALL reject deletion of the currently authenticated user with 422 Unprocessable Entity.

#### Scenario: ADMIN attempts self-deletion

- GIVEN the requester is ADMIN and `{id}` matches the requester's user ID
- WHEN DELETE `/api/users/{id}` is called
- THEN return 422 Unprocessable Entity with descriptive error

### Requirement: Last-ADMIN Protection

The system SHALL reject deletion if the tenant would have zero active ADMIN users after the operation.

#### Scenario: ADMIN attempts to delete last ADMIN

- GIVEN the tenant has exactly 1 active ADMIN and the target is not the requester
- WHEN DELETE `/api/users/{id}` is called
- THEN return 422 Unprocessable Entity with "cannot remove last ADMIN" error
