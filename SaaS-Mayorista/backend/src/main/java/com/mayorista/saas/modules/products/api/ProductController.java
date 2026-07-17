package com.mayorista.saas.modules.products.api;

import com.mayorista.saas.modules.products.domain.ProductEntity;
import com.mayorista.saas.modules.products.domain.ProductRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> list() {
        UUID tenantId = requireTenant();
        List<ProductResponse> data = productRepository.findAllByTenantId(tenantId)
                .stream()
                .map(ProductResponse::from)
                .toList();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable UUID id) {
        UUID tenantId = requireTenant();
        ProductEntity entity = productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado"));
        return ResponseEntity.ok(ProductResponse.from(entity));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        UUID tenantId = requireTenant();
        ProductEntity entity = new ProductEntity();
        entity.setId(UUID.randomUUID());
        entity.setTenantId(tenantId);
        entity.setCodigoBarras(request.codigoBarras());
        entity.setNombre(request.nombre());
        entity.setStockActual(request.stockActual());
        entity.setStockMinimo(request.stockMinimo());
        entity.setPrecioNeto(request.precioNeto());
        entity.setActualizadoEn(Instant.now());

        ProductEntity saved = productRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.from(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        UUID tenantId = requireTenant();
        ProductEntity entity = productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado"));

        entity.setNombre(request.nombre());
        entity.setStockActual(request.stockActual());
        entity.setStockMinimo(request.stockMinimo());
        entity.setPrecioNeto(request.precioNeto());
        entity.setActualizadoEn(Instant.now());

        ProductEntity saved = productRepository.save(entity);
        return ResponseEntity.ok(ProductResponse.from(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID tenantId = requireTenant();
        ProductEntity entity = productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado"));
        productRepository.delete(entity);
        return ResponseEntity.noContent().build();
    }

    private UUID requireTenant() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant no resuelto en contexto");
        }
        return tenantId;
    }
}
