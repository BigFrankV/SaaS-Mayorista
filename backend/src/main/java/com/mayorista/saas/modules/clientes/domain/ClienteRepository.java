package com.mayorista.saas.modules.clientes.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClienteRepository extends JpaRepository<ClienteEntity, UUID> {

    List<ClienteEntity> findAllByTenantIdAndActivoTrue(UUID tenantId);

    Optional<ClienteEntity> findByIdAndTenantId(UUID id, UUID tenantId);

    boolean existsByTenantIdAndRut(UUID tenantId, String rut);

    boolean existsByTenantIdAndRutAndIdNot(UUID tenantId, String rut, UUID id);

    Page<ClienteEntity> findAllByTenantId(UUID tenantId, Pageable pageable);
}
