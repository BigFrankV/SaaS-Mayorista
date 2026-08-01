# MCPs instalados — Guía de uso (SaaS-Mayorista)

> Config: `C:\Users\frank\.config\opencode\opencode.json`
> Los MCPs se activan al **reiniciar opencode**. No hay comandos de terminal para usarlos:
> se los pedís al agente en el chat y él los invoca como herramientas.
> Requisito general: **Docker Desktop corriendo** para los que usan Docker (el primer uso descarga la imagen automáticamente).

---

## 1. Resumen

| MCP | Categoría | Estado | ¿Qué analiza? | ¿Necesita algo corriendo? |
|---|---|---|---|---|
| `semgrep` | 🔐 Seguridad (estático) | ✅ Activo | El código fuente (Java + TypeScript) | Nada (Docker solo) |
| `zap` | 🔐 Seguridad (dinámico) | ⏸️ Desactivado | La app CORRIENDO (ataques reales) | ZAP Desktop + add-on (pasos abajo) |
| `sonarqube` | ✅ Calidad | ⏸️ Desactivado | El código (code smells, bugs, coverage) | Server SonarQube + token (pasos abajo) |
| `k6` | ⚡ Rendimiento | ✅ Activo | La API bajo carga (latencia, VUs) | Backend levantado (`localhost:8080`) |
| `lighthouse` | ⚡ Rendimiento (frontend) | ✅ Activo | El frontend (performance, SEO, accesibilidad) | Frontend levantado (`localhost:5173`) |
| `postgres` | 🗄️ Utilidad | ✅ Activo | Tu base `mayorista_db` | Postgres levantado (compose dev) |

---

## 2. Cómo pedirlos al agente (ejemplos)

### 🔐 semgrep — seguridad estática
```text
Corré semgrep sobre backend/src y frontend/src y listame los hallazgos por severidad.
Escanéa el repo con semgrep buscando SQL injection, secrets hardcodeados y XSS.
Decime qué reglas de seguridad encuentra semgrep en los controllers de Spring.
```

### ⚡ k6 — load testing de la API
```text
Hacé un test de carga con k6 a POST /api/v1/auth/login con 50 usuarios virtuales durante 30 segundos.
Probá con k6 cuántas requests por segundo aguanta GET /api/v1/products.
Corré k6 contra el flujo completo: login → crear venta → listar ventas, con 20 VUs.
```

### ⚡ lighthouse — performance del frontend
```text
Pasale lighthouse a http://localhost:5173 y mostrame los puntajes.
Corré lighthouse en la página de login y decime qué puedo mejorar en performance.
```

### 🗄️ postgres — consultas a la base
```text
Consultá en la base cuántos productos tienen stock bajo.
Mostrame las últimas 10 ventas de la DB con su total.
Listame las tablas del esquema y sus cantidades de registros.
```

### 🔐 zap — escaneo dinámico (cuando esté activo)
```text
Importá la spec de http://localhost:8080/v3/api-docs en ZAP y hacé un escaneo activo.
Corré un spider + active scan de ZAP sobre el login y el POST de ventas.
```

### ✅ sonarqube — calidad (cuando esté activo)
```text
Corré un análisis de SonarQube sobre el backend y mostrame los code smells y bugs.
```

---

## 3. Activar ZAP (pendiente)

1. Instalá **ZAP Desktop** (gratis): https://www.zaproxy.org/download/
2. Abrí ZAP → **Marketplace** → buscá e instalá el add-on **"MCP Integration"**
3. **Options → MCP Integration**:
   - Puerto: `8282` (default)
   - **Secure Only: DESACTIVADO** (para usar http:// local y evitar problemas de certificado)
   - **Generate** una Security Key
4. Seteá la variable de entorno del sistema: `ZAP_MCP_API_KEY` = la key generada
5. En `opencode.json`, bloque `zap` → `"enabled": true`
6. Reiniciá opencode
7. Dejá ZAP Desktop abierto cuando lo quieras usar (el add-on atiende en `http://localhost:8282`)

---

## 4. Activar SonarQube (pendiente)

1. Levantá el server (Docker):
   ```bash
   docker run -d --name sonarqube -p 9000:9000 sonarqube:community
   ```
   (default: admin/admin — te pide cambiar la password en el primer login)
2. Entrá a `http://localhost:9000` → **My Account → Security → Generate Token** → copialo
3. Seteá la variable de entorno del sistema: `SONARQUBE_TOKEN` = el token
4. En `opencode.json`, bloque `sonarqube` → `"enabled": true`
5. Reiniciá opencode

---

## 5. Notas

- **Reinicio**: opencode carga la config al iniciar. Cualquier cambio en `opencode.json` requiere reiniciarlo.
- **Primer uso lento**: el primer `docker run` de cada MCP descarga su imagen (semgrep ~1GB tarda unos minutos; k6 y postgres-mcp son rápidas). Después es instantáneo.
- **Postgres**: el MCP apunta a `host.docker.internal:5432` (tu compose dev en el host). Si cambiás la password en `.env`, actualizá la URI en `opencode.json`.
- **Swagger**: si `http://localhost:8080/v3/api-docs` da 403 (Spring Security), avisale a tu otro agente que permita `/v3/api-docs` y `/swagger-ui/**` en el `SecurityFilterChain` — sin eso ZAP no puede importar la spec.
- **Contexto**: `context7` (docs de librerías) y `engram` (memoria) ya estaban instalados y no necesitan nada.
