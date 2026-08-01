package com.mayorista.saas.modules.users.application;

import com.mayorista.saas.AbstractIntegrationTest;
import com.mayorista.saas.modules.users.api.CreateUserRequest;
import com.mayorista.saas.modules.users.api.UpdateUserRequest;
import com.mayorista.saas.modules.users.api.UserResponse;
import com.mayorista.saas.modules.users.domain.UserRole;
import com.mayorista.saas.modules.tenant.domain.TenantEntity;
import com.mayorista.saas.modules.tenant.domain.TenantRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Verifies B4: duplicate-email validation is scoped to the tenant. An admin of
 * one tenant must not be told that an email exists in another tenant.
 */
class UserServiceTest extends AbstractIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private TenantRepository tenantRepository;

    @AfterEach
    void clearTenantContext() {
        TenantContext.clear();
    }

    @Test
    void create_duplicateEmailInSameTenant_throwsConflict() {
        createTenant();
        userService.create(new CreateUserRequest("dup@test.com", "Pass1234!", "User A", UserRole.ADMIN));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.create(new CreateUserRequest("dup@test.com", "Pass1234!", "User B", UserRole.ADMIN)));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void create_emailUsedInAnotherTenant_isNotRejectedByApplicationValidation() {
        createTenant();
        userService.create(new CreateUserRequest("cross@test.com", "Pass1234!", "User A", UserRole.ADMIN));
        createTenant();

        // The tenant-scoped validation no longer fires (no 409): the only thing
        // standing in the way is the intentionally-kept global UNIQUE constraint
        // on usuarios.email, which blocks the insert at the database level.
        assertThrows(DataIntegrityViolationException.class, () ->
                userService.create(new CreateUserRequest("cross@test.com", "Pass1234!", "User B", UserRole.ADMIN)));
    }

    @Test
    void update_emailOfAnotherUserInSameTenant_throwsConflict() {
        createTenant();
        UserResponse u1 = userService.create(
                new CreateUserRequest("one@test.com", "Pass1234!", "User One", UserRole.ADMIN));
        UserResponse u2 = userService.create(
                new CreateUserRequest("two@test.com", "Pass1234!", "User Two", UserRole.ADMIN));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.update(u2.id(), new UpdateUserRequest(u1.email(), null, null, null)));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void update_keepingOwnEmail_isAllowed() {
        createTenant();
        UserResponse u1 = userService.create(
                new CreateUserRequest("own@test.com", "Pass1234!", "User Own", UserRole.ADMIN));

        UserResponse updated = assertDoesNotThrow(() ->
                userService.update(u1.id(), new UpdateUserRequest("own@test.com", "User Renamed", null, null)));

        assertEquals("own@test.com", updated.email());
        assertEquals("User Renamed", updated.nombre());
    }

    private void createTenant() {
        TenantEntity tenant = new TenantEntity();
        tenant.setId(UUID.randomUUID());
        tenant.setNombreEmpresa("Test Empresa");
        tenant.setRut("76" + UUID.randomUUID().toString().replace("-", "").substring(0, 9));
        tenant.setGiro("Comercio");
        tenant.setDireccion("Direccion");
        tenant.setCreadoEn(Instant.now());
        TenantEntity saved = tenantRepository.save(tenant);
        TenantContext.setTenantId(saved.getId());
    }
}
