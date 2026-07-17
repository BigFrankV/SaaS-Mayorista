package com.mayorista.saas.modules.products.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateProductRequest(
        @NotBlank String codigoBarras,
        @NotBlank String nombre,
        @NotNull @Min(0) Integer stockActual,
        @NotNull @Min(0) Integer stockMinimo,
        @NotNull @Min(1) Integer precioNeto
) {
}
