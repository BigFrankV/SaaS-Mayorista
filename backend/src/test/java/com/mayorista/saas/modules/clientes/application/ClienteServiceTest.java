package com.mayorista.saas.modules.clientes.application;

import com.mayorista.saas.AbstractIntegrationTest;
import com.mayorista.saas.modules.clientes.api.ClienteResponse;
import com.mayorista.saas.modules.clientes.api.CreateClienteRequest;
import com.mayorista.saas.modules.clientes.api.UpdateClienteRequest;
import com.mayorista.saas.modules.tenant.domain.TenantEntity;
import com.mayorista.saas.modules.tenant.domain.TenantRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Verifies B5: update rejects a RUT that belongs to ANOTHER client of the same
 * tenant (the same client keeping its own RUT is allowed, and the same RUT is
 * still valid in a different tenant).
 */
class ClienteServiceTest extends AbstractIntegrationTest {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private TenantRepository tenantRepository;

    @AfterEach
    void clearTenantContext() {
        TenantContext.clear();
    }

    @Test
    void update_withRutOfAnotherClientInSameTenant_throwsConflict() {
        createTenant();
        ClienteResponse c1 = clienteService.create(
                new CreateClienteRequest("11111111-1", "Cliente Uno", null, null, null, null));
        ClienteResponse c2 = clienteService.create(
                new CreateClienteRequest("22222222-2", "Cliente Dos", null, null, null, null));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                clienteService.update(c2.id(),
                        new UpdateClienteRequest(c1.rut(), null, null, null, null, null)));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void update_keepingOwnRut_isAllowed() {
        createTenant();
        ClienteResponse c1 = clienteService.create(
                new CreateClienteRequest("11111111-1", "Cliente Uno", null, null, null, null));

        ClienteResponse updated = assertDoesNotThrow(() ->
                clienteService.update(c1.id(),
                        new UpdateClienteRequest("11111111-1", "Cliente Uno Renombrado", null, null, null, null)));

        assertEquals("11111111-1", updated.rut());
        assertEquals("Cliente Uno Renombrado", updated.nombre());
    }

    @Test
    void update_withRutUsedInAnotherTenant_isAllowed() {
        createTenant();
        ClienteResponse c1 = clienteService.create(
                new CreateClienteRequest("11111111-1", "Cliente Uno", null, null, null, null));
        createTenant();
        ClienteResponse c2 = clienteService.create(
                new CreateClienteRequest("22222222-2", "Cliente Dos", null, null, null, null));

        ClienteResponse updated = assertDoesNotThrow(() ->
                clienteService.update(c2.id(),
                        new UpdateClienteRequest(c1.rut(), null, null, null, null, null)));

        assertEquals(c1.rut(), updated.rut());
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
