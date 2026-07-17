# Comandos Docker — SaaS Mayorista

Todos los comandos se ejecutan desde la **raíz del proyecto** (`C:\Users\frank\Documents\GitHub\SaaS-Mayorista`).

## Comandos principales

| Qué querés hacer | Comando |
|---|---|
| **Iniciar todo** | `docker compose -f infra/docker/dev/docker-compose.yml --env-file .env up -d` |
| **Reiniciar sin rebuild** | `docker compose -f infra/docker/dev/docker-compose.yml --env-file .env restart` |
| **Solo reiniciar pgAdmin** | `docker restart mayorista_pgadmin` |
| **Ver logs del backend** | `docker logs mayorista_backend -f` |
| **Parar todo** | `docker compose -f infra/docker/dev/docker-compose.yml down` |
| **Parar y borrar volúmenes (datos)** | `docker compose -f infra/docker/dev/docker-compose.yml down -v` |

## Notas

- No uses `--build` a menos que hayas cambiado código Java del backend.
- Para cambios de configuración (como el `servers.json`), alcanza con `restart` — no se crea ninguna imagen nueva ni ocupa espacio extra.
- La primera vez, el backend tarda ~1-2 minutos en compilar e iniciar (Maven descarga dependencias). Después arranca más rápido.
