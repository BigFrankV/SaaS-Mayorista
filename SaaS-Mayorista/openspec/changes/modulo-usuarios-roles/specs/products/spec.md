# Products Specification

**Context**: This is a MODIFIED capability — write endpoints were protected with `@PreAuthorize(ADMIN)`.

## Purpose

Product CRUD with role-based write protection. Read operations are accessible to all authenticated users; create, update, and delete operations require ADMIN role.

## Requirements

### Requirement: Product Read Access

GET endpoints SHALL be accessible to any authenticated user regardless of role.

#### Scenario: Any user lists products

- GIVEN an authenticated user (ADMIN or VENDEDOR)
- WHEN GET `/api/products` is called
- THEN return 200 with a paginated product list

#### Scenario: Any user reads product by ID

- GIVEN an authenticated user
- WHEN GET `/api/products/{id}` is called
- THEN return 200 with the product details

### Requirement: Product Write Protected by @PreAuthorize

POST, PUT, and DELETE endpoints MUST require `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.

#### Scenario: ADMIN creates a product

- GIVEN the requester has role ADMIN
- WHEN POST `/api/products` is called with valid product data
- THEN return 201 with the created product

#### Scenario: VENDEDOR cannot create products

- GIVEN the requester has role VENDEDOR
- WHEN POST `/api/products` is called
- THEN return 403 Forbidden

#### Scenario: ADMIN updates a product

- GIVEN the requester has role ADMIN and product exists
- WHEN PUT `/api/products/{id}` is called with updated fields
- THEN return 200 with the updated product

#### Scenario: VENDEDOR cannot update products

- GIVEN the requester has role VENDEDOR
- WHEN PUT `/api/products/{id}` is called
- THEN return 403 Forbidden

#### Scenario: ADMIN deletes a product

- GIVEN the requester has role ADMIN and product exists
- WHEN DELETE `/api/products/{id}` is called
- THEN return 204 No Content

#### Scenario: VENDEDOR cannot delete products

- GIVEN the requester has role VENDEDOR
- WHEN DELETE `/api/products/{id}` is called
- THEN return 403 Forbidden
