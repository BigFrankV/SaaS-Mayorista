package com.mayorista.saas.modules.tenant.application;

import com.mayorista.saas.modules.tenant.api.TenantRegistrationRequest;
import com.mayorista.saas.modules.tenant.api.TenantRegistrationResponse;
import com.mayorista.saas.modules.tenant.api.TenantResponse;
import com.mayorista.saas.modules.tenant.api.TenantUpdateRequest;
import com.mayorista.saas.modules.tenant.domain.TenantEntity;
import com.mayorista.saas.modules.tenant.domain.TenantRepository;
import com.mayorista.saas.modules.users.domain.UserEntity;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.modules.users.domain.UserRole;
import com.mayorista.saas.shared.security.SecurityUtils;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TenantService(TenantRepository tenantRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public TenantRegistrationResponse register(TenantRegistrationRequest request) {
        if (tenantRepository.existsByRut(request.rut())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El RUT ya está registrado");
        }

        TenantEntity tenant = new TenantEntity();
        tenant.setId(UUID.randomUUID());
        tenant.setNombreEmpresa(request.nombreEmpresa());
        tenant.setRut(request.rut());
        tenant.setGiro(request.giro() != null ? request.giro() : "");
        tenant.setDireccion(request.direccion());
        tenant.setCreadoEn(Instant.now());
        tenant = tenantRepository.save(tenant);

        String hashed = passwordEncoder.encode(request.adminPassword());
        UserEntity admin = new UserEntity();
        admin.setId(UUID.randomUUID());
        admin.setTenantId(tenant.getId());
        admin.setNombre(request.adminNombre());
        admin.setEmail(request.adminEmail().toLowerCase().trim());
        admin.setPasswordHash(hashed);
        admin.setRol(UserRole.ADMIN);
        admin.setActivo(true);
        admin.setCreadoEn(Instant.now());
        userRepository.save(admin);

        return new TenantRegistrationResponse(
                tenant.getId(),
                admin.getId(),
                "Empresa registrada exitosamente"
        );
    }

    @Transactional(readOnly = true)
    public List<TenantResponse> list() {
        if (SecurityUtils.isSuperAdmin()) {
            return tenantRepository.findAll()
                    .stream()
                    .map(TenantResponse::from)
                    .toList();
        }
        return tenantRepository.findById(requireTenant())
                .map(entity -> List.of(TenantResponse.from(entity)))
                .orElseGet(List::of);
    }

    @Transactional(readOnly = true)
    public TenantResponse getById(UUID id) {
        return TenantResponse.from(findAccessibleTenant(id));
    }

    public TenantResponse update(UUID id, TenantUpdateRequest request) {
        TenantEntity entity = findAccessibleTenant(id);

        if (request.nombreEmpresa() != null) {
            entity.setNombreEmpresa(request.nombreEmpresa());
        }
        if (request.giro() != null) {
            entity.setGiro(request.giro());
        }
        if (request.direccion() != null) {
            entity.setDireccion(request.direccion());
        }
        return TenantResponse.from(tenantRepository.save(entity));
    }

    public void delete(UUID id) {
        TenantEntity entity = findAccessibleTenant(id);
        tenantRepository.delete(entity);
    }

    private TenantEntity findAccessibleTenant(UUID id) {
        TenantEntity entity = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found: " + id));
        if (!SecurityUtils.isSuperAdmin() && !entity.getId().equals(requireTenant())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found: " + id);
        }
        return entity;
    }

    private UUID requireTenant() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context not resolved for request");
        }
        return tenantId;
    }
}
