package com.mayorista.saas.modules.sales.application;

import com.mayorista.saas.modules.products.domain.ProductEntity;
import com.mayorista.saas.modules.sales.api.DetalleResponse;
import com.mayorista.saas.modules.sales.api.VentaResponse;
import com.mayorista.saas.modules.sales.domain.DetalleVentaEntity;
import com.mayorista.saas.modules.sales.domain.VentaEntity;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

public final class VentaMapper {

    private VentaMapper() {
    }

    public static VentaResponse toResponse(VentaEntity entity) {
        return toResponseWithProductNames(entity, Map.of(), null, entity.getNombreCliente());
    }

    public static VentaResponse toResponseWithProductNames(
            VentaEntity entity,
            Map<UUID, ProductEntity> productMap
    ) {
        return toResponseWithProductNames(entity, productMap, null, entity.getNombreCliente());
    }

    public static VentaResponse toResponseWithProductNames(
            VentaEntity entity,
            Map<UUID, ProductEntity> productMap,
            String usuarioNombre,
            String nombreCliente
    ) {
        return new VentaResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getUsuarioId(),
                usuarioNombre,
                entity.getTipoDocumento(),
                entity.getRutCliente(),
                entity.getGiroCliente(),
                nombreCliente,
                entity.getTotalNeto(),
                entity.getIva(),
                entity.getTotal(),
                entity.getFechaVenta(),
                entity.isAnulada(),
                entity.getDetalles().stream()
                        .map(d -> {
                            ProductEntity p = productMap.get(d.getProductoId());
                            String nombre = p != null ? p.getNombre() : "Desconocido";
                            return toDetalleResponse(d, nombre);
                        })
                        .toList()
        );
    }

    private static DetalleResponse toDetalleResponse(DetalleVentaEntity detalle, String nombreProducto) {
        return new DetalleResponse(
                detalle.getId(),
                detalle.getProductoId(),
                nombreProducto != null ? nombreProducto : "Desconocido",
                detalle.getCantidad(),
                detalle.getPrecioNetoHistorico()
        );
    }
}
