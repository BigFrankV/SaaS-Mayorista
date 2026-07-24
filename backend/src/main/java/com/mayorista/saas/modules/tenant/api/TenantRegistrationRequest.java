package com.mayorista.saas.modules.tenant.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TenantRegistrationRequest(
    @NotBlank String nombreEmpresa,
    @NotBlank @Pattern(regexp = "\\d{1,2}\\.?\\d{3}\\.?\\d{3}[-]?[0-9kK]") String rut,
    String giro,
    String direccion,
    @NotBlank @Email String adminEmail,
    @NotBlank @Size(min = 6) String adminPassword,
    @NotBlank String adminNombre
) {}
