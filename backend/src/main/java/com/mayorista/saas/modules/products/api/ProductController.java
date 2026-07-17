package com.mayorista.saas.modules.products.api;

import com.mayorista.saas.modules.products.application.ProductService;
import com.mayorista.saas.modules.products.domain.ProductEntity;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Cacheable(value = "products", keyGenerator = "tenantAwareKeyGenerator")
    public ResponseEntity<Page<ProductResponse>> list(@PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        Page<ProductResponse> data = productService.list(pageable)
                .map(ProductResponse::from);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    @Cacheable(value = "products", keyGenerator = "tenantAwareKeyGenerator")
    public ResponseEntity<ProductResponse> getById(@PathVariable UUID id) {
        ProductEntity entity = productService.getById(id);
        return ResponseEntity.ok(ProductResponse.from(entity));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        ProductEntity saved = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.from(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<ProductResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        ProductEntity saved = productService.update(id, request);
        return ResponseEntity.ok(ProductResponse.from(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
