package com.mayorista.saas.modules.users.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    Page<UserEntity> findAllByTenantIdAndActivoTrue(UUID tenantId, Pageable pageable);
    Page<UserEntity> findAllByTenantId(UUID tenantId, Pageable pageable);
    long countByTenantIdAndRolAndActivoTrue(UUID tenantId, UserRole rol);
}
