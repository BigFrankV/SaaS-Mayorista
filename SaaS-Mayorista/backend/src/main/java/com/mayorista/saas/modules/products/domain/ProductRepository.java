package com.mayorista.saas.modules.products.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    List<ProductEntity> findAllByTenantId(UUID tenantId);
    Optional<ProductEntity> findByIdAndTenantId(UUID id, UUID tenantId);
}
