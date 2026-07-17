package com.mayorista.saas.modules.products.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    Page<ProductEntity> findAllByTenantId(UUID tenantId, Pageable pageable);
    Optional<ProductEntity> findByIdAndTenantId(UUID id, UUID tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductEntity p WHERE p.id = :id AND p.tenantId = :tenantId")
    Optional<ProductEntity> findByIdAndTenantIdWithLock(@Param("id") UUID id, @Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM ProductEntity p WHERE p.tenantId = :tenantId AND p.stockActual <= p.stockMinimo")
    Page<ProductEntity> findByStockBajo(@Param("tenantId") UUID tenantId, Pageable pageable);

    @Query("SELECT p FROM ProductEntity p WHERE p.tenantId = :tenantId AND (LOWER(p.codigoBarras) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ProductEntity> search(@Param("tenantId") UUID tenantId, @Param("query") String query, Pageable pageable);

    // FUTURE: Use @EntityGraph(attributePaths = {"category", "supplier"}) when relations are added
}
