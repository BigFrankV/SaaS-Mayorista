# User Admin Specification

## Purpose

Tenant-scoped user management — ADMIN-only CRUD with soft-delete and protections against self-deletion and last-ADMIN removal.

## Requirements

### Requirement: ADMIN-scoped User CRUD

The system MUST expose five endpoints for user management, all restricted to ADMIN via `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.
(Previously: List only returned active users; Update did not support password)

| Operation | Method | Path | Description |
|-----------|--------|------|-------------|
| List | GET | `/api/users` | Paginated tenant users (active and inactive) |
| Create | POST | `/api/users` | Create user with email, password, nombre, rol |
| Read | GET | `/api/users/{id}` | Single user details |
| Update | PUT | `/api/users/{id}` | Update email, nombre, rol; password optional |
| Delete | DELETE | `/api/users/{id}` | Soft-delete (set `activo=false`) |

#### Scenario: ADMIN lists all users (active and inactive)

- GIVEN the requester is ADMIN of tenant T
- WHEN GET `/api/users` is called
- THEN return 200 with paginated list that includes both active and inactive users

#### Scenario: VENDEDOR cannot access user endpoints

- GIVEN the requester has role VENDEDOR
- WHEN any user endpoint is called
- THEN return 403 Forbidden

#### Scenario: ADMIN creates a user in own tenant

- GIVEN the requester is ADMIN
- WHEN POST `/api/users` is called with `{email, password, nombre, rol}`
- THEN return 201 with created user scoped to the ADMIN's tenant

#### Scenario: ADMIN updates user without password

- GIVEN the ADMIN and the target user exist
- WHEN PUT `/api/users/{id}` is called with `{email, nombre, rol}` without password
- THEN return 200 with updated user and the password remains unchanged

#### Scenario: ADMIN updates user including password

- GIVEN the ADMIN and the target user exist
- WHEN PUT `/api/users/{id}` is called with `{email, nombre, rol, password: "newPass123"}`
- THEN return 200 with updated fields and the password is re-hashed

#### Scenario: ADMIN soft-deletes a user

- GIVEN the target user is not the requester and is not the last ADMIN
- WHEN DELETE `/api/users/{id}` is called
- THEN set `activo=false` and return 200 or 204

### Requirement: UI — Create User via Modal

The frontend MUST display a modal for creating users. The existing inline form MUST be replaced with a modal.

#### Scenario: ADMIN opens creation modal

- GIVEN the ADMIN is on the user list page
- WHEN the ADMIN clicks "Create User" button
- THEN a modal opens with fields: email, password, nombre, rol

#### Scenario: ADMIN creates user successfully from modal

- GIVEN the creation modal is open and fields are valid
- WHEN the ADMIN clicks "Save"
- THEN the modal closes, the user appears in the list, and a success notification is shown

### Requirement: UI — Edit User via Modal

The frontend MUST display a modal for editing users. The password field MUST be optional in the edit form.

#### Scenario: ADMIN opens edit modal

- GIVEN the ADMIN is on the user list page
- WHEN the ADMIN clicks "Edit" on a user
- THEN a pre-populated modal opens with email, nombre, rol and an empty optional password field

#### Scenario: ADMIN updates user without changing password

- GIVEN the edit modal is open
- WHEN the ADMIN modifies email or nombre and does not enter a password
- THEN upon saving, the password remains unchanged

### Requirement: UI — Status Badge (Active/Inactive)

The user list MUST display a visual badge indicating whether the user is active or inactive.

#### Scenario: Active user shows green badge

- GIVEN a user with `activo=true`
- WHEN the row is rendered in the table
- THEN a green badge with text "Active" is shown

#### Scenario: Inactive user shows gray badge

- GIVEN a user with `activo=false`
- WHEN the row is rendered in the table
- THEN a gray badge with text "Inactive" is shown

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
