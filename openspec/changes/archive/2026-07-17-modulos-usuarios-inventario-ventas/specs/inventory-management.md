# Inventory Management Specification

## Purpose

Gestión completa de productos (inventario) con operaciones CRUD, paginación, consulta de stock bajo, y control de acceso por roles. Extiende el CRUD backend existente con funcionalidad frontend completa.

## Requirements

### Requirement: Product Paginated Read

Los endpoints GET DEBEN ser accesibles para cualquier usuario autenticado. El listado DEBE retornar datos paginados.

#### Scenario: Any user lists products paginated

- GIVEN un usuario autenticado (ADMIN o VENDEDOR)
- WHEN se llama GET `/api/products?page=0&size=20`
- THEN retorna 200 con `Page<ProductResponse>` incluyendo total de páginas y elementos

#### Scenario: Any user reads product by ID

- GIVEN un usuario autenticado y un producto existente
- WHEN se llama GET `/api/products/{id}`
- THEN retorna 200 con los detalles del producto

### Requirement: Product Write Protected by ADMIN

Los endpoints POST, PUT y DELETE DEBEN requerir `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.

#### Scenario: ADMIN creates a product

- GIVEN el usuario autenticado tiene rol ADMIN
- WHEN se llama POST `/api/products` con datos de producto válidos
- THEN retorna 201 con el producto creado

#### Scenario: VENDEDOR cannot create products

- GIVEN el usuario autenticado tiene rol VENDEDOR
- WHEN se llama POST `/api/products`
- THEN retorna 403 Forbidden

#### Scenario: ADMIN updates a product

- GIVEN el usuario tiene rol ADMIN y el producto existe
- WHEN se llama PUT `/api/products/{id}` con campos actualizados
- THEN retorna 200 con el producto actualizado

#### Scenario: ADMIN deletes a product

- GIVEN el usuario tiene rol ADMIN y el producto existe
- WHEN se llama DELETE `/api/products/{id}`
- THEN retorna 204 No Content y el producto ya no existe en BD

### Requirement: Low Stock Query

El sistema DEBE exponer un filtro `?stockBajo=true` para consultar productos cuyo `stockActual` sea menor o igual a `stockMinimo`.

#### Scenario: ADMIN filters low stock products

- GIVEN existen productos con `stockActual <= stockMinimo` y otros con stock suficiente
- WHEN se llama GET `/api/products?stockBajo=true`
- THEN retorna solo los productos que cumplen la condición de stock bajo

#### Scenario: No low stock products returns empty list

- GIVEN todos los productos tienen `stockActual > stockMinimo`
- WHEN se llama GET `/api/products?stockBajo=true`
- THEN retorna 200 con lista vacía y `totalElements=0`

### Requirement: UI — Product Table with Pagination

El frontend DEBE mostrar una tabla paginada de productos con columnas: Código, Nombre, Stock actual, Stock mínimo, Precio neto, y Estado (stock bajo badge).

#### Scenario: Table renders paginated products

- GIVEN existen productos en el tenant
- WHEN se carga la página de productos
- THEN se muestra tabla paginada con controles de página anterior/siguiente

#### Scenario: Low stock badge is shown

- GIVEN un producto con `stockActual <= stockMinimo`
- WHEN se renderiza la fila del producto
- THEN se muestra un badge rojo "Stock bajo" en la columna Estado

### Requirement: UI — Create and Edit Product via Modal

El frontend DEBE usar modales para crear y editar productos, reemplazando el formulario inline existente.

#### Scenario: ADMIN creates product via modal

- GIVEN el ADMIN está en la página de productos
- WHEN hace clic en "Crear Producto", completa el modal y presiona Guardar
- THEN el modal se cierra, el producto aparece en la tabla y se muestra notificación

#### Scenario: ADMIN edits product via modal

- GIVEN el ADMIN está en la página de productos
- WHEN hace clic en "Editar" en un producto, modifica campos y presiona Guardar
- THEN el modal se cierra y la tabla refleja los cambios

### Requirement: UI — Delete with Confirmation

El frontend DEBE solicitar confirmación antes de eliminar un producto.

#### Scenario: ADMIN confirms deletion

- GIVEN el ADMIN hace clic en "Eliminar" en un producto
- WHEN se muestra un diálogo de confirmación y el ADMIN confirma
- THEN el producto desaparece de la tabla y se muestra notificación de éxito

#### Scenario: ADMIN cancels deletion

- GIVEN el ADMIN hace clic en "Eliminar" en un producto
- WHEN se muestra un diálogo de confirmación y el ADMIN cancela
- THEN el producto permanece en la tabla sin cambios
