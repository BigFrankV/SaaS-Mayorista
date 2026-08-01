# Deuda tecnica (decidida)

Lista de deuda tecnica conocida. **Decidida**: se documenta y se acepta
conscientemente, no es un backlog de cosas olvidadas. Cada entrada indica el
porque y la mitigacion actual.

## 1. FKs sin scoping multitenant a nivel de BD

- **Que**: las FKs (p.ej. `productos.categoria_id REFERENCES categorias(id)`)
  no restringen que la categoria pertenezca al mismo tenant del producto. Un
  `categoria_id` de otro tenant es validamente insertable a nivel de BD.
- **Por que**: la validacion por tenant se hace en la capa de aplicacion
  (cada servicio resuelve siempre con `TenantContext` + `tenant_id`).
  Hacerlo en BD exigiria composite keys o triggers por tabla — decision de
  diseno 2026: se mitiga en aplicacion.
- **Riesgo**: un bug en la capa de aplicacion podria cruzar datos entre
  tenants. Contramedida actual: repositorios filtran SIEMPRE por
  `tenantId` + `TenantContext.getTenantId()`.

## 2. Email de usuario UNIQUE global

- **Que**: `usuarios.email` tiene `UNIQUE` a nivel global (no por tenant).
- **Por que**: el flujo de login es email+password y no existe tenant en el
  momento del login; el email debe ser resoluble sin conocer el tenant.
- **Mitigacion**: la validacion de duplicados por tenant se hace en la capa de
  aplicacion (case-insensitive). Quitar el UNIQUE global exigiria resolver el
  tenant antes del login.

## 3. Naming mixto espanol/ingles en el backend

- **Que**: `ClienteEntity`, `VentaEntity` (espanol) vs `ProductEntity`,
  `CategoryEntity`, `UserEntity` (ingles).
- **Por que**: crecimiento organico del codigo sin convencion uniforme.
- **Impacto**: puramente cosmetico; no genera bugs. Migrar los nombres
  existentes romperia el historial y no aporta valor.

## 4. Dinero en INT

- **Que**: montos en `INT` (`precio_neto`, `total`, `total_neto`, `iva`),
  CLP sin decimales.
- **Por que**: los CLP no tienen decimales; INT es simple y suficiente hoy.
  Migrar a `NUMERIC(12,2)` seria rompedor (entidades, API, frontend,
  redondeos) sin beneficio real para la moneda actual.

## 5. Commits basura en el historial

- **Que**: commits sin contenido significativo (`as`, `l`, `vbn`, `ghh`,
  `update productos`, etc.).
- **Por que**: sesiones tempranas de desarrollo sin disciplina de mensajes.
- **Impacto**: historial dificil de leer. No se reescribira la historia
  compartida; se exige conventional commits hacia adelante.

## 6. `productos.categoria` VARCHAR (texto libre) + `categoria_id` FK

- **Que**: desde V6 conviven la columna legacy `categoria` (VARCHAR, texto
  libre) y la FK `categoria_id`. La entidad mapea ambas; el frontend envia el
  UUID de la categoria como texto en el campo `categoria`.
- **Por que**: compatibilidad con el frontend y clientes que ya enviaban texto.
  V6 creo categorias desde los valores legacy y enlazo los productos; el
  servicio resuelve `categoriaId` o el texto (UUID o nombre, find-or-create).
- **Plan**: dropear la columna `categoria` en una migracion V7+ cuando la FK
  sea la unica fuente de verdad y ningun cliente use el texto.

## 7. Tokens access en memoria JS (frontend)

- **Que**: el access token vive en memoria (zustand `authStore`), el refresh
  en cookie httpOnly.
- **Por que**: es el patron recomendado contra XSS; el refresh token no es
  accesible desde JS.
- **Riesgo**: el access token se pierde al recargar la pagina y el usuario
  debe re-autenticarse (o usar refresh). Aceptado por seguridad.

## 8. pgAdmin: carga de servidores solo en primer arranque

- **Que**: `servers.json` (dev) solo se importa al crear la base de config de
  pgAdmin (primer arranque con volumen limpio).
- **Mitigacion**: documentado en README; si cambian los servers hay que
  `docker compose down -v` o importar manualmente (Tools > Import/Export).

## 9. Advisory de react-router-dom

- **Que**: el scanner de dependencias marco un advisory de `react-router-dom`
  en alguna pasada.
- **Decision**: evaluado como NO aplicable al uso actual (SPA sin Server
  Components ni APIs afectadas). Se revisa al actualizar la dependencia
  (Dependabot, semanal).

## 10. Indice redundante en categorias

- **Que**: `idx_categorias_tenant` (V6) duplica el prefijo izquierdo del
  UNIQUE `(tenant_id, nombre)`.
- **Por que**: claridad y consistencia con el resto de los indices
  `idx_*_tenant`. Costo marginal aceptable.
