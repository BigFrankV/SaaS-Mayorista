package com.mayorista.saas.modules.clientes.api;

public record UpdateClienteRequest(
        String rut,
        String nombre,
        String giro,
        String direccion,
        String email,
        String telefono
) {
}
