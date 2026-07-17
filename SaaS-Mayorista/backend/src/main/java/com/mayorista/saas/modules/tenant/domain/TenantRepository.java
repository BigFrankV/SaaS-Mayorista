package com.mayorista.saas.modules.tenant.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TenantRepository extends JpaRepository<TenantEntity, UUID> {
}
