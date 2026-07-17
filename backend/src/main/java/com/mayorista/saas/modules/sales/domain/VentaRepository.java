package com.mayorista.saas.modules.sales.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VentaRepository extends JpaRepository<VentaEntity, UUID> {
    Page<VentaEntity> findAllByTenantId(UUID tenantId, Pageable pageable);
}
