package com.mayorista.saas.modules.sales.domain;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VentaRepository extends JpaRepository<VentaEntity, UUID> {
    Page<VentaEntity> findAllByTenantId(UUID tenantId, Pageable pageable);

    Optional<VentaEntity> findByIdAndTenantId(UUID id, UUID tenantId);

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM VentaEntity v WHERE v.tenantId = :tenantId AND v.fechaVenta >= :since")
    Long sumTotalSince(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    @Query("SELECT COUNT(v) FROM VentaEntity v WHERE v.tenantId = :tenantId AND v.fechaVenta >= :since")
    long countSince(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    @Query("SELECT v FROM VentaEntity v WHERE v.tenantId = :tenantId ORDER BY v.fechaVenta DESC")
    List<VentaEntity> findRecentByTenantId(@Param("tenantId") UUID tenantId, Pageable pageable);
}
