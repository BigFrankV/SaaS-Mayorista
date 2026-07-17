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

## Acceso inicial (dev)

- Login UI: `http://localhost:5173`
- API base: `http://localhost:8080/api/v1`
- Usuario inicial: `admin@mayorista.local`
- Password inicial: `Admin123!`

El backend crea automaticamente el tenant y admin inicial al iniciar en perfil `dev` si `APP_BOOTSTRAP_ENABLED=true`.

## Notas

- Flyway aplica migraciones automaticamente al iniciar el backend.
- Esta fase incluye la base estructural para seguir con autenticacion completa access + refresh token y multitenancy.
