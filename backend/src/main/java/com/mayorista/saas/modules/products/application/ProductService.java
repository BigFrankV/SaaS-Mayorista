package com.mayorista.saas.modules.products.application;

import com.mayorista.saas.modules.categories.domain.CategoryEntity;
import com.mayorista.saas.modules.categories.domain.CategoryRepository;
import com.mayorista.saas.modules.products.api.CreateProductRequest;
import com.mayorista.saas.modules.products.api.UpdateProductRequest;
import com.mayorista.saas.modules.products.domain.ProductEntity;
import com.mayorista.saas.modules.products.domain.ProductRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<ProductEntity> list(Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return productRepository.findAllByTenantId(tenantId, pageable);
    }

    public Page<ProductEntity> listByStockBajo(Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return productRepository.findByStockBajo(tenantId, pageable);
    }

    public Page<ProductEntity> listByCategoria(String categoria, Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        UUID categoryId = tryParseUuid(categoria.trim());
        if (categoryId != null) {
            return productRepository.findAllByTenantIdAndCategoryId(tenantId, categoryId, pageable);
        }
        // Legacy clients still filter by the free-text column (exact match).
        return productRepository.findAllByTenantIdAndCategoria(tenantId, categoria, pageable);
    }

    public Page<ProductEntity> searchByCodigo(String query, Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return productRepository.search(tenantId, query, pageable);
    }

    @Cacheable(value = "products", keyGenerator = "tenantAwareKeyGenerator")
    public ProductEntity getById(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        return productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado"));
    }

    public ProductEntity create(CreateProductRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        ProductEntity entity = new ProductEntity();
        entity.setId(UUID.randomUUID());
        entity.setTenantId(tenantId);
        entity.setCodigoBarras(request.codigoBarras());
        entity.setNombre(request.nombre());
        entity.setStockActual(request.stockActual());
        entity.setStockMinimo(request.stockMinimo());
        entity.setPrecioNeto(request.precioNeto());
        entity.setCategoria(request.categoria());
        entity.setCategory(resolveCategory(tenantId, request.categoriaId(), request.categoria()));
        entity.setDescripcion(request.descripcion());
        Instant now = Instant.now();
        entity.setCreadoEn(now);
        entity.setActualizadoEn(now);
        return productRepository.save(entity);
    }

    public ProductEntity update(UUID id, UpdateProductRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        ProductEntity entity = productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado"));
        entity.setNombre(request.nombre());
        entity.setStockActual(request.stockActual());
        entity.setStockMinimo(request.stockMinimo());
        entity.setPrecioNeto(request.precioNeto());
        entity.setCategoria(request.categoria());
        entity.setCategory(resolveCategory(tenantId, request.categoriaId(), request.categoria()));
        entity.setDescripcion(request.descripcion());
        entity.setActualizadoEn(Instant.now());
        return productRepository.save(entity);
    }

    public void delete(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        ProductEntity entity = productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado"));
        productRepository.delete(entity);
    }

    /**
     * Resolves the category for a product write. Precedence:
     * 1. Explicit {@code categoriaId} (new field).
     * 2. Legacy {@code categoria} text: if it parses as a UUID it is treated as
     *    a category id (what the current frontend sends); otherwise the
     *    category is looked up by name (case-insensitive) and created if it
     *    does not exist, mirroring the V6 data migration.
     * The legacy text column is still stored as sent, so existing clients keep
     * working unchanged.
     */
    private CategoryEntity resolveCategory(UUID tenantId, UUID categoriaId, String categoria) {
        if (categoriaId != null) {
            return categoryRepository.findByIdAndTenantId(categoriaId, tenantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Categoria no encontrada para el tenant: " + categoriaId));
        }
        if (categoria == null || categoria.isBlank()) {
            return null;
        }
        String trimmed = categoria.trim();
        UUID legacyUuid = tryParseUuid(trimmed);
        if (legacyUuid != null) {
            return categoryRepository.findByIdAndTenantId(legacyUuid, tenantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Categoria no encontrada para el tenant: " + legacyUuid));
        }
        return categoryRepository.findByTenantIdAndNombreIgnoreCase(tenantId, trimmed)
                .orElseGet(() -> {
                    CategoryEntity created = new CategoryEntity();
                    created.setId(UUID.randomUUID());
                    created.setTenantId(tenantId);
                    created.setNombre(trimmed);
                    created.setActivo(true);
                    created.setCreadoEn(Instant.now());
                    return categoryRepository.save(created);
                });
    }

    private static UUID tryParseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
