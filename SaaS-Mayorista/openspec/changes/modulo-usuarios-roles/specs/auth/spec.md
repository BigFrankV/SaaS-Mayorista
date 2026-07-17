# Auth Specification

**Context**: This is a MODIFIED capability — role support was added to the existing JWT auth flow.

## Purpose

Multi-tenant JWT authentication. Users authenticate with email+password and receive a JWT containing tenant ID and role. The `/auth/me` endpoint returns profile info including `rol`.

## Requirements

### Requirement: User Login

The system MUST authenticate users via email+password and return a JWT scoped to the user's tenant.

#### Scenario: Valid credentials return JWT with role

- GIVEN a user exists with email `vendor@example.com` and role `VENDEDOR`
- WHEN POST `/auth/login` is called with valid credentials
- THEN return 200 with JWT containing the tenant ID and `ROLE_VENDEDOR` authority

#### Scenario: Invalid credentials return 401

- GIVEN a user with email `admin@example.com`
- WHEN POST `/auth/login` is called with wrong password
- THEN return 401 Unauthorized

### Requirement: `/auth/me` Returns Role

The system MUST return the user's role (`rol`) in the `/auth/me` response. (Previously: no role was returned.)

#### Scenario: Authenticated user fetches profile

- GIVEN a valid JWT for user with role `ADMIN`
- WHEN GET `/auth/me` is called with the JWT
- THEN return 200 with `{email, nombre, tenantId, rol: "ADMIN"}`
- AND the `rol` field MUST be a non-null string

#### Scenario: Expired token on `/auth/me`

- GIVEN an expired JWT
- WHEN GET `/auth/me` is called
- THEN return 401 Unauthorized

### Requirement: Frontend Stores Role in authStore

The frontend SHOULD store the user's role from `/auth/me` in the Zustand authStore after login or page refresh.

#### Scenario: Login populates role in authStore

- GIVEN the login flow completes successfully
- WHEN the frontend calls `/auth/me` after login
- THEN `authStore.rol` is set to the role from the response
- AND `authStore.isAdmin` (or equivalent derived value) reflects `rol === "ADMIN"`

#### Scenario: Role survives page refresh

- GIVEN `authStore` already has a role from a previous session
- WHEN the page is refreshed and `/auth/me` returns a valid response
- THEN the role in `authStore` is updated from the refreshed response
