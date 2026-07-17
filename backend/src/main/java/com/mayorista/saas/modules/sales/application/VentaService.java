package com.mayorista.saas.modules.sales.application;

import com.mayorista.saas.modules.products.domain.ProductEntity;
import com.mayorista.saas.modules.products.domain.ProductRepository;
import com.mayorista.saas.modules.sales.api.CreateVentaRequest;
import com.mayorista.saas.modules.sales.api.VentaResponse;
import com.mayorista.saas.modules.sales.domain.DetalleVentaEntity;
import com.mayorista.saas.modules.sales.domain.VentaEntity;
import com.mayorista.saas.modules.sales.domain.VentaRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductRepository productRepository;

    public VentaService(VentaRepository ventaRepository, ProductRepository productRepository) {
        this.ventaRepository = ventaRepository;
        this.productRepository = productRepository;
    }

    public VentaResponse crear(CreateVentaRequest request, UUID usuarioId) {
        UUID tenantId = requireTenant();

        VentaEntity venta = new VentaEntity();
        venta.setId(UUID.randomUUID());
        venta.setTenantId(tenantId);
        venta.setUsuarioId(usuarioId);
        venta.setTipoDocumento(request.tipoDocumento());
        venta.setRutCliente(request.rutCliente());
        venta.setGiroCliente(request.giroCliente());
        venta.setFechaVenta(Instant.now());

        int totalNeto = 0;
        List<DetalleVentaEntity> detalles = new ArrayList<>();
        Map<UUID, ProductEntity> productMap = new HashMap<>();

        for (CreateVentaRequest.ItemVenta item : request.items()) {
            // Lock pesimista para evitar race conditions en stock
            ProductEntity producto = productRepository.findByIdAndTenantIdWithLock(item.productoId(), tenantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Producto no encontrado: " + item.productoId()));

            // Validar stock suficiente
            if (producto.getStockActual() < item.cantidad()) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Stock insuficiente para: " + producto.getNombre()
                                + " (disponible: " + producto.getStockActual()
                                + ", solicitado: " + item.cantidad() + ")");
            }

            // Decrementar stock
            producto.setStockActual(producto.getStockActual() - item.cantidad());
            productRepository.save(producto);

            // Crear detalle con relación bidireccional
            DetalleVentaEntity detalle = new DetalleVentaEntity();
            detalle.setId(UUID.randomUUID());
            detalle.setProductoId(item.productoId());
            detalle.setCantidad(item.cantidad());
            detalle.setPrecioNetoHistorico(producto.getPrecioNeto());
            detalle.setVenta(venta);
            detalles.add(detalle);

            productMap.put(item.productoId(), producto);
            totalNeto += producto.getPrecioNeto() * item.cantidad();
        }

        venta.setDetalles(detalles);

        // Calcular IVA 19%
        int iva = (int) Math.round(totalNeto * 0.19);
        int total = totalNeto + iva;

        venta.setTotalNeto(totalNeto);
        venta.setIva(iva);
        venta.setTotal(total);

        VentaEntity saved = ventaRepository.save(venta);

        // Usar overload con nombres de producto para la respuesta
        return VentaMapper.toResponseWithProductNames(saved, productMap);
    }

    public Page<VentaResponse> list(Pageable pageable) {
        UUID tenantId = requireTenant();
        Page<VentaEntity> page = ventaRepository.findAllByTenantId(tenantId, pageable);

        // Cargar nombres de productos para toda la página
        List<VentaEntity> ventas = page.getContent();
        Map<UUID, ProductEntity> allProducts = new HashMap<>();
        for (VentaEntity v : ventas) {
            for (DetalleVentaEntity d : v.getDetalles()) {
                if (!allProducts.containsKey(d.getProductoId())) {
                    productRepository.findByIdAndTenantId(d.getProductoId(), tenantId)
                            .ifPresent(p -> allProducts.put(d.getProductoId(), p));
                }
            }
        }

        Map<UUID, ProductEntity> finalMap = allProducts;
        return page.map(v -> VentaMapper.toResponseWithProductNames(v, finalMap));
    }

    private UUID requireTenant() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant no resuelto en contexto");
        }
        return tenantId;
    }
}
