package com.mayorista.saas.modules.products.api;

import com.mayorista.saas.modules.products.domain.ProductEntity;

import java.util.UUID;

public record ProductResponse(
        UUID id,
        String codigoBarras,
        String nombre,
        int stockActual,
        int stockMinimo,
        int precioNeto,
        boolean stockBajo,
        String categoria,
        UUID categoriaId,
        String descripcion
) {
    public static ProductResponse from(ProductEntity entity) {
        return new ProductResponse(
                entity.getId(),
                entity.getCodigoBarras(),
                entity.getNombre(),
                entity.getStockActual(),
                entity.getStockMinimo(),
                entity.getPrecioNeto(),
                entity.getStockActual() <= entity.getStockMinimo(),
                entity.getCategoria(),
                entity.getCategory() != null ? entity.getCategory().getId() : null,
                entity.getDescripcion()
        );
    }
}
