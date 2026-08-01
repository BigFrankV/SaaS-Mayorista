# SaaS Mayorista Multitenant

Monorepo base para SaaS de alimentos mayoristas con:
- Backend: Spring Boot + Maven
- DB: PostgreSQL
- Sesiones y revocacion: Redis
- Frontend: React + Vite + TypeScript
- Infra: Docker Compose (dev/prod)

## Inicio rapido (fase actual)

1. Copiar variables de entorno:
   - `copy .env.example .env`
2. Levantar infraestructura de desarrollo:
   - `docker compose -f infra/docker/dev/docker-compose.yml --env-file .env up -d --build`
3. Backend disponible en:
   - `http://localhost:8080/actuator/health`
4. Frontend disponible en:
   - `http://localhost:5173`

## Variables de entorno obligatorias

El backend **no arranca** con secrets debiles o faltantes:

- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: secrets JWT. Si quedan con el valor
  por defecto o con menos de 44 caracteres, el backend aborta el arranque
  (JwtService valida longitud y patrones conocidos).
- `APP_BOOTSTRAP_ADMIN_PASSWORD`: requerida fuera del perfil `dev` cuando el
  bootstrap esta habilitado (BootstrapAdminPasswordGuard aborta el arranque si
  esta vacia). En `dev` vacia se genera una password aleatoria que se loguea
  una sola vez en el arranque.
- `REDIS_PASSWORD` (**solo prod**): Redis se levanta con `--requirepass`. En
  `prod`, si la variable falta, `docker compose` falla al hacer parse del
  archivo (fail-fast seguro). En `dev` hay un default conocido
  (`mayorista_dev_redis`) que se usa si no esta definida.

El resto de variables tienen defaults en `.env.example` y se pueden ajustar.

## Acceso inicial (dev)

- Login UI: `http://localhost:5173`
- API base: `http://localhost:8080/api/v1`
- Usuario inicial: `admin@mayorista.local` (configurable con `APP_BOOTSTRAP_ADMIN_EMAIL`)
- Password inicial: la definida en `APP_BOOTSTRAP_ADMIN_PASSWORD`; si queda
  vacia en dev, el backend genera una password aleatoria y la imprime en el
  log del backend exactamente una vez en el arranque.

El backend crea automaticamente el tenant y admin inicial al iniciar en perfil `dev` si `APP_BOOTSTRAP_ENABLED=true`.

## pgAdmin (dev)

- UI: `http://localhost:5050` (login con `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`).
- La conexion "Mayorista Dev" apunta a la base `postgres` dentro de la red
  Docker. La password de la BD **no esta hardcodeada**: el compose renderiza un
  archivo `pgpass` desde las variables de entorno y `servers.json` lo referencia
  via `PassFile` (pgAdmin no expande env vars en `servers.json`).
- Nota: los servidores de `servers.json` solo se cargan en el primer arranque
  con una base de config nueva. Si ya existe el volumen `pgadmin_data`, se debe
  borrar (`docker compose down -v`) o importar el servidor manualmente.

## Notas

- Flyway aplica migraciones automaticamente al iniciar el backend
  (`backend/src/main/resources/db/migration/`).
- `spring.jpa.hibernate.ddl-auto=validate`: la entidades deben estar alineadas
  con el esquema producido por las migraciones.
- Deuda tecnica documentada y decidida: `docs/DEUDA-TECNICA.md`.
- Esta fase incluye la base estructural para seguir con autenticacion completa access + refresh token y multitenancy.
