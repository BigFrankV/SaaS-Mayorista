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

    @Query("""
        SELECT v FROM VentaEntity v
        WHERE v.tenantId = :tenantId
        AND (:fechaDesde IS NULL OR v.fechaVenta >= :fechaDesde)
        AND (:fechaHasta IS NULL OR v.fechaVenta <= :fechaHasta)
        AND (:search IS NULL OR LOWER(v.rutCliente) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(v.nombreCliente) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:tipoDocumento IS NULL OR v.tipoDocumento = :tipoDocumento)
        AND (:anulada IS NULL OR v.anulada = :anulada)
        ORDER BY v.fechaVenta DESC
    """)
    Page<VentaEntity> findAllByTenantIdWithFilters(
            @Param("tenantId") UUID tenantId,
            @Param("fechaDesde") Instant fechaDesde,
            @Param("fechaHasta") Instant fechaHasta,
            @Param("search") String search,
            @Param("tipoDocumento") String tipoDocumento,
            @Param("anulada") Boolean anulada,
            Pageable pageable);

    // Cancelled sales are excluded from money/count metrics: cancellation restores
    // stock, so from a business standpoint the sale never happened.
    @Query("SELECT COALESCE(SUM(v.total), 0) FROM VentaEntity v WHERE v.tenantId = :tenantId AND v.anulada = false AND v.fechaVenta >= :since")
    Long sumTotalSince(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM VentaEntity v WHERE v.tenantId = :tenantId AND v.anulada = false AND v.fechaVenta >= :from AND v.fechaVenta < :to")
    Long sumTotalBetween(@Param("tenantId") UUID tenantId, @Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT COUNT(v) FROM VentaEntity v WHERE v.tenantId = :tenantId AND v.anulada = false AND v.fechaVenta >= :since")
    long countSince(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    @Query("SELECT v FROM VentaEntity v WHERE v.tenantId = :tenantId ORDER BY v.fechaVenta DESC")
    List<VentaEntity> findRecentByTenantId(@Param("tenantId") UUID tenantId, Pageable pageable);
}
