package com.mayorista.saas.modules.sales.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record CreateVentaRequest(
        @NotBlank String tipoDocumento,
        String rutCliente,
        String giroCliente,
        @NotNull @Size(min = 1) List<ItemVenta> items
) {
    public record ItemVenta(@NotNull UUID productoId, @Min(1) int cantidad) {}
}
