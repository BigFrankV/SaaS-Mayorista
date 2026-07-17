# Delta para User Admin

## MODIFIED Requirements

### Requirement: ADMIN-scoped User CRUD

El sistema DEBE exponer cinco endpoints para gestión de usuarios, todos restringidos a ADMIN vía `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.
(Previously: List solo retornaba usuarios activos; Update no soportaba password)

| Operación | Método | Path | Descripción |
|-----------|--------|------|-------------|
| List | GET | `/api/users` | Usuarios paginados del tenant (activos e inactivos) |
| Create | POST | `/api/users` | Crear usuario con email, password, nombre, rol |
| Read | GET | `/api/users/{id}` | Detalle de un usuario |
| Update | PUT | `/api/users/{id}` | Actualizar email, nombre, rol; password opcional |
| Delete | DELETE | `/api/users/{id}` | Soft-delete (set `activo=false`) |

#### Scenario: ADMIN lista todos los usuarios

- GIVEN el usuario autenticado es ADMIN del tenant T
- WHEN se llama GET `/api/users`
- THEN retorna 200 con lista paginada que incluye usuarios activos e inactivos

#### Scenario: VENDEDOR no puede acceder a endpoints de usuario

- GIVEN el usuario autenticado tiene rol VENDEDOR
- WHEN se llama a cualquier endpoint de usuario
- THEN retorna 403 Forbidden

#### Scenario: ADMIN crea un usuario en su propio tenant

- GIVEN el usuario autenticado es ADMIN
- WHEN se llama POST `/api/users` con `{email, password, nombre, rol}`
- THEN retorna 201 con el usuario creado asociado al tenant del ADMIN

#### Scenario: ADMIN actualiza usuario sin password

- GIVEN el ADMIN autenticado y el usuario destino existen
- WHEN se llama PUT `/api/users/{id}` con `{email, nombre, rol}` sin incluir password
- THEN retorna 200 con el usuario actualizado y el password no se modifica

#### Scenario: ADMIN actualiza usuario incluyendo password

- GIVEN el ADMIN autenticado y el usuario destino existen
- WHEN se llama PUT `/api/users/{id}` con `{email, nombre, rol, password: "nuevoPass123"}`
- THEN retorna 200 con los campos actualizados y el password re-hasheado

#### Scenario: ADMIN soft-deletea un usuario

- GIVEN el usuario destino no es el solicitante ni es el último ADMIN
- WHEN se llama DELETE `/api/users/{id}`
- THEN se setea `activo=false` y retorna 200 o 204

## ADDED Requirements

### Requirement: UI — Create User via Modal

El frontend DEBE mostrar un modal para crear usuarios. El formulario inline existente DEBE ser reemplazado por un modal.

#### Scenario: ADMIN abre modal de creación

- GIVEN el ADMIN está en la página de lista de usuarios
- WHEN hace clic en botón "Crear Usuario"
- THEN se abre un modal con campos: email, password, nombre, rol

#### Scenario: ADMIN crea usuario exitosamente desde modal

- GIVEN el modal de creación está abierto y los campos son válidos
- WHEN el ADMIN hace clic en "Guardar"
- THEN el modal se cierra, el usuario aparece en la lista y se muestra notificación de éxito

### Requirement: UI — Edit User via Modal

El frontend DEBE mostrar un modal para editar usuarios. El campo password DEBE ser opcional en el formulario de edición.

#### Scenario: ADMIN abre modal de edición

- GIVEN el ADMIN está en la página de lista de usuarios
- WHEN hace clic en botón "Editar" de un usuario
- THEN se abre un modal pre-poblado con email, nombre, rol y un campo password vacío y opcional

#### Scenario: ADMIN actualiza usuario sin cambiar password

- GIVEN el modal de edición está abierto
- WHEN el ADMIN modifica email o nombre y no ingresa password
- THEN al guardar, el password permanece sin cambios

### Requirement: UI — Status Badge Activo/Inactivo

La lista de usuarios DEBE mostrar un badge visual que indique si el usuario está activo o inactivo.

#### Scenario: Usuario activo muestra badge verde

- GIVEN un usuario con `activo=true`
- WHEN se renderiza la fila en la tabla
- THEN se muestra un badge verde con texto "Activo"

#### Scenario: Usuario inactivo muestra badge gris

- GIVEN un usuario con `activo=false`
- WHEN se renderiza la fila en la tabla
- THEN se muestra un badge gris con texto "Inactivo"
