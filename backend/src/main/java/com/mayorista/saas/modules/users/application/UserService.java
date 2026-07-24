package com.mayorista.saas.modules.users.application;

import com.mayorista.saas.modules.users.api.CreateUserRequest;
import com.mayorista.saas.modules.users.api.UpdateUserRequest;
import com.mayorista.saas.modules.users.api.UserResponse;
import com.mayorista.saas.modules.users.domain.UserEntity;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.modules.users.domain.UserRole;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserResponse> list(Pageable pageable, boolean activo) {
        UUID tenantId = requireTenant();
        if (activo) {
            return userRepository.findAllByTenantIdAndActivoTrue(tenantId, pageable)
                    .map(UserResponse::from);
        }
        return userRepository.findAllByTenantId(tenantId, pageable)
                .map(UserResponse::from);
    }

    public UserResponse create(CreateUserRequest request) {
        UUID tenantId = requireTenant();

        if (userRepository.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya existe");
        }

        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setTenantId(tenantId);
        user.setNombre(request.nombre());
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRol(request.rol());
        user.setActivo(true);
        user.setCreadoEn(Instant.now());
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse getById(UUID id) {
        UUID tenantId = requireTenant();
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (!user.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
        return UserResponse.from(user);
    }

    public UserResponse update(UUID id, UpdateUserRequest request) {
        UUID tenantId = requireTenant();
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (!user.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }

        if (request.email() != null) {
            user.setEmail(request.email().toLowerCase());
        }
        if (request.nombre() != null) {
            user.setNombre(request.nombre());
        }
        if (request.rol() != null) {
            user.setRol(request.rol());
        }
        if (request.password() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return UserResponse.from(userRepository.save(user));
    }

    public void delete(UUID id, UUID currentUserId) {
        UUID tenantId = requireTenant();

        if (id.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "No puedes eliminarte a ti mismo");
        }

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (!user.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }

        if (user.getRol() == UserRole.ADMIN) {
            long adminCount = userRepository.countByTenantIdAndRolAndActivoTrue(tenantId, UserRole.ADMIN);
            if (adminCount <= 1) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "No puedes eliminar al ultimo administrador del tenant");
            }
        }

        user.setActivo(false);
        userRepository.save(user);
    }

    private UUID requireTenant() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant no resuelto en contexto");
        }
        return tenantId;
    }
}
