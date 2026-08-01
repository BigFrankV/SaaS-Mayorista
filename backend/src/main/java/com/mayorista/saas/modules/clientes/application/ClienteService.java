package com.mayorista.saas.modules.clientes.application;

import com.mayorista.saas.modules.clientes.api.ClienteResponse;
import com.mayorista.saas.modules.clientes.api.CreateClienteRequest;
import com.mayorista.saas.modules.clientes.api.UpdateClienteRequest;
import com.mayorista.saas.modules.clientes.domain.ClienteEntity;
import com.mayorista.saas.modules.clientes.domain.ClienteRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public Page<ClienteResponse> list(Pageable pageable) {
        UUID tenantId = requireTenant();
        return clienteRepository.findAllByTenantId(tenantId, pageable)
                .map(ClienteResponse::from);
    }

    public ClienteResponse getById(UUID id) {
        UUID tenantId = requireTenant();
        ClienteEntity entity = clienteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado: " + id));
        return ClienteResponse.from(entity);
    }

    public ClienteResponse create(CreateClienteRequest request) {
        UUID tenantId = requireTenant();

        if (clienteRepository.existsByTenantIdAndRut(tenantId, request.rut())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un cliente con ese RUT en este tenant");
        }

        ClienteEntity entity = new ClienteEntity();
        entity.setTenantId(tenantId);
        entity.setRut(request.rut());
        entity.setNombre(request.nombre());
        entity.setGiro(request.giro());
        entity.setDireccion(request.direccion());
        entity.setEmail(request.email());
        entity.setTelefono(request.telefono());

        ClienteEntity saved = clienteRepository.save(entity);
        return ClienteResponse.from(saved);
    }

    public ClienteResponse update(UUID id, UpdateClienteRequest request) {
        UUID tenantId = requireTenant();
        ClienteEntity entity = clienteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado: " + id));

        if (request.rut() != null) {
            if (clienteRepository.existsByTenantIdAndRutAndIdNot(tenantId, request.rut(), id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un cliente con ese RUT en este tenant");
            }
            entity.setRut(request.rut());
        }
        if (request.nombre() != null) entity.setNombre(request.nombre());
        if (request.giro() != null) entity.setGiro(request.giro());
        if (request.direccion() != null) entity.setDireccion(request.direccion());
        if (request.email() != null) entity.setEmail(request.email());
        if (request.telefono() != null) entity.setTelefono(request.telefono());

        ClienteEntity saved = clienteRepository.save(entity);
        return ClienteResponse.from(saved);
    }

    public void delete(UUID id) {
        UUID tenantId = requireTenant();
        ClienteEntity entity = clienteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado: " + id));
        entity.setActivo(false);
        clienteRepository.save(entity);
    }

    private UUID requireTenant() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant no resuelto en contexto");
        }
        return tenantId;
    }
}
