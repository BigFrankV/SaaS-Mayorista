package com.mayorista.saas.modules.products.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    Page<ProductEntity> findAllByTenantId(UUID tenantId, Pageable pageable);
    Optional<ProductEntity> findByIdAndTenantId(UUID id, UUID tenantId);

    // FUTURE: Use @EntityGraph(attributePaths = {"category", "supplier"}) when relations are added
}
