package com.mayorista.saas.modules.categories.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
    List<CategoryEntity> findAllByTenantIdAndActivoTrue(UUID tenantId);
    Optional<CategoryEntity> findByIdAndTenantId(UUID id, UUID tenantId);
    boolean existsByTenantIdAndNombreIgnoreCase(UUID tenantId, String nombre);
}
