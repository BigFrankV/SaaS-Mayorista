# Sales POS Specification

## Purpose

Módulo de ventas con POS (Point of Sale) que permite crear ventas con bloqueo de stock pesimista, carrito de compras editable, y listado histórico. Backend completo (entity → controller) más frontend POS.

## Requirements

### Requirement: Create Sale with Stock Blocking

El sistema DEBE crear una venta con cabecera (`ventas`) y líneas de detalle (`detalle_ventas`). Cada línea DEBE descontar el stock del producto usando bloqueo pesimista para evitar condiciones de carrera.

#### Scenario: ADMIN creates sale with sufficient stock

- GIVEN un producto tiene `stockActual=20` y se venden 5 unidades
- WHEN se llama POST `/api/sales` con `{productos: [{productoId, cantidad: 5}], ...}`
- THEN retorna 201 con la venta creada y el producto queda con `stockActual=15`

#### Scenario: Multiple products in one sale

- GIVEN tres productos con stock suficiente
- WHEN se crea una venta con los tres productos en el detalle
- THEN retorna 201 y cada producto ve su stock descontado proporcionalmente

### Requirement: Insufficient Stock Rejection

El sistema DEBE rechazar una venta si algún producto en el detalle no tiene stock suficiente. El bloqueo pesimista DEBE aplicarse antes de verificar stock.

#### Scenario: Sale rejected when stock insufficient

- GIVEN un producto tiene `stockActual=3` y se intentan vender 10 unidades
- WHEN se llama POST `/api/sales` con cantidad mayor al stock disponible
- THEN retorna 422 Unprocessable Entity con mensaje indicando producto y stock disponible
- AND el stock de ningún producto se modifica (rollback total)

#### Scenario: Partial stock failure rolls back entire sale

- GIVEN productos A (stock=10, se venden 2) y B (stock=1, se venden 5)
- WHEN se llama POST `/api/sales` con ambos productos
- THEN retorna 422 indicando que B tiene stock insuficiente
- AND el stock de A no se descuenta (rollback de la transacción completa)

### Requirement: List Sales

El sistema DEBE exponer un endpoint GET paginado para listar ventas del tenant.

#### Scenario: ADMIN lists sales paginated

- GIVEN existen ventas registradas en el tenant
- WHEN se llama GET `/api/sales?page=0&size=10`
- THEN retorna 200 con lista paginada de ventas incluyendo total, fecha, y estado

### Requirement: POS — Cart Management

El frontend POS DEBE permitir agregar productos al carrito, modificar cantidades, y eliminar líneas antes de confirmar la venta.

#### Scenario: Product added to cart

- GIVEN el VENDEDOR está en la pantalla POS
- WHEN selecciona un producto de la lista de búsqueda
- THEN el producto se agrega al carrito con cantidad 1 y se actualiza el total

#### Scenario: Quantity updated in cart

- GIVEN un producto está en el carrito con cantidad 1
- WHEN el VENDEDOR cambia la cantidad a 3
- THEN el subtotal del producto y el total de la venta se recalculan

#### Scenario: Product removed from cart

- GIVEN hay 2 productos en el carrito
- WHEN el VENDEDOR elimina uno
- THEN el carrito queda con 1 producto y el total se actualiza

### Requirement: POS — Product Search

El POS DEBE permitir buscar productos por nombre o código de barras mientras se arma la venta.

#### Scenario: Search finds matching products

- GIVEN productos con nombres que contienen "Leche"
- WHEN el VENDEDOR escribe "Leche" en el campo de búsqueda
- THEN se muestra una lista filtrada de productos que coinciden

#### Scenario: Search with no results

- GIVEN ningún producto coincide con el término "XYZ999"
- WHEN el VENDEDOR escribe "XYZ999" en la búsqueda
- THEN se muestra mensaje "Sin resultados" y el carrito permanece sin cambios

### Requirement: POS — Sale Confirmation

El POS DEBE mostrar un resumen de la venta antes de confirmar y DEBE enviar la creación al backend al confirmar.

#### Scenario: VENDEDOR confirms sale

- GIVEN el carrito tiene productos con cantidades válidas
- WHEN el VENDEDOR hace clic en "Confirmar Venta"
- THEN se llama POST `/api/sales`, se muestra notificación de éxito, el carrito se limpia, y se redirige al listado

#### Scenario: VENDEDOR confirms with empty cart

- GIVEN el carrito está vacío
- WHEN el VENDEDOR hace clic en "Confirmar Venta"
- THEN se muestra error "Carrito vacío" y no se envía la petición al backend
