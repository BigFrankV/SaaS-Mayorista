package com.mayorista.saas.modules.products.application;

import com.mayorista.saas.modules.products.api.CreateProductRequest;
import com.mayorista.saas.modules.products.api.UpdateProductRequest;
import com.mayorista.saas.modules.products.domain.ProductEntity;
import com.mayorista.saas.modules.products.domain.ProductRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
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
}
