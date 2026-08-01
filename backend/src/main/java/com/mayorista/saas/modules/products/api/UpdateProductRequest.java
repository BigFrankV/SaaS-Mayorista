package com.mayorista.saas.modules.products.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateProductRequest(
        @NotBlank String nombre,
        @NotNull @Min(0) Integer stockActual,
        @NotNull @Min(0) Integer stockMinimo,
        @NotNull @Min(1) Integer precioNeto,
        @Size(max = 255) String categoria,
        UUID categoriaId,
        String descripcion
) {
}
