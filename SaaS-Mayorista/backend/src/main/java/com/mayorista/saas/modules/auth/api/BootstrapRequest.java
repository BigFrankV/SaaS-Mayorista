package com.mayorista.saas.modules.auth.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record BootstrapRequest(
        @NotBlank String nombreEmpresa,
        @NotBlank String rutEmpresa,
        @NotBlank String giroEmpresa,
        String direccionEmpresa,
        @NotBlank String nombreAdmin,
        @NotBlank @Email String emailAdmin,
        @NotBlank String passwordAdmin
) {
}
