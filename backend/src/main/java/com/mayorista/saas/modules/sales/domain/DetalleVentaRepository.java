package com.mayorista.saas.modules.sales.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DetalleVentaRepository extends JpaRepository<DetalleVentaEntity, UUID> {
    List<DetalleVentaEntity> findByVentaId(UUID ventaId);
}
