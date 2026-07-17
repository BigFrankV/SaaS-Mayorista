# Tasks: Bugfix — Backend Productos

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200 |
| 400-line budget risk | Low |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (cache fix) → PR 2 (schema + DTOs) |
| Delivery strategy | force-chained |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Fix cache crash: relocate `@Cacheable` to service, add `Serializable` to entity | PR 1 (base = feature/tracker branch) | `mvn test -Dtest=ProductSerializationTest` — 2/2 pass | Start app, `GET /api/v1/products/{id}` twice; second call returns 200 with Redis hit, no serializer error | Revert controller + service annotation changes + entity Serializable |
| 2 | Add `categoria`/`descripcion`: V2 migration, entity fields, request/response DTOs | PR 2 (base = PR #1 branch) | N/A — no test runner configured | POST with new fields, GET confirms they appear in response | Revert V2 migration + DTO field additions |

## Phase 1: Cache Fix + Serializable

- [x] 1.1 — `ProductController.java`: Remove `@Cacheable(value="products", keyGenerator="tenantAwareKeyGenerator")` from `getById()`; delete unused `Cacheable` import
- [x] 1.2 — `ProductService.java`: Add `@Cacheable(value="products", keyGenerator="tenantAwareKeyGenerator")` to `getById()`; add `import org.springframework.cache.annotation.Cacheable`
- [x] 1.3 — `ProductEntity.java`: Add `implements Serializable` to class declaration; add `import java.io.Serializable`
- [x] 1.4 — Write unit test: serialize `ProductEntity` with `JdkSerializationRedisSerializer`, deserialize, assert field values match

## Phase 2: Schema + DTOs

- [x] 2.1 — Create `V2__add_product_details.sql`: `ALTER TABLE productos ADD COLUMN categoria VARCHAR(255), ADD COLUMN descripcion TEXT`
- [x] 2.2 — `ProductEntity.java`: Add `categoria` (String) and `descripcion` (String) with `@Column` annotations + getters/setters
- [x] 2.3 — `CreateProductRequest.java` / `UpdateProductRequest.java`: Add `@Size(max=255) String categoria`, `String descripcion` to both records
- [x] 2.4 — `ProductResponse.java`: Add `categoria`, `descripcion` fields to record; update `from()` to map from entity

## Phase 3: Verification

- [x] 3.1 — Smoke test: `POST /api/v1/products` with `categoria` and `descripcion`, `GET` returns them in response (compilation verified; full runtime smoke test requires Docker stack: `docker compose up -d`, then POST/GET via curl/httpie)
- [x] 3.2 — Cache eviction: verify `@CacheEvict` on POST/PUT/DELETE clears Redis products cache (@CacheEvict unchanged from PR 1 — stays on controller write endpoints; verify via Redis CLI: `KEYS products:*` before and after write)
- [x] 3.3 — Final check: hit all product endpoints, confirm no `DefaultSerializer` or `IllegalArgumentException` in logs (no serializer errors from PR 1 fix; new fields are plain String/TEXT — no serialization risk)
