package com.mayorista.saas.modules.clientes.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateClienteRequest(
        @NotBlank @Pattern(regexp = "\\d{1,2}\\.?\\d{3}\\.?\\d{3}[-]?[0-9kK]") String rut,
        @NotBlank String nombre,
        String giro,
        String direccion,
        String email,
        String telefono
) {
}
