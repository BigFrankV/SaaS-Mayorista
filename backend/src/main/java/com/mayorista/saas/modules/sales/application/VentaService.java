package com.mayorista.saas.modules.sales.application;

import com.mayorista.saas.modules.clientes.domain.ClienteEntity;
import com.mayorista.saas.modules.clientes.domain.ClienteRepository;
import com.mayorista.saas.modules.products.domain.ProductEntity;
import com.mayorista.saas.modules.products.domain.ProductRepository;
import com.mayorista.saas.modules.sales.api.CreateVentaRequest;
import com.mayorista.saas.modules.sales.api.VentaResponse;
import com.mayorista.saas.modules.sales.domain.DetalleVentaEntity;
import com.mayorista.saas.modules.sales.domain.VentaEntity;
import com.mayorista.saas.modules.sales.domain.VentaRepository;
import com.mayorista.saas.modules.users.domain.UserEntity;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductRepository productRepository;
    private final ClienteRepository clienteRepository;
    private final UserRepository userRepository;

    public VentaService(VentaRepository ventaRepository, ProductRepository productRepository,
                        ClienteRepository clienteRepository, UserRepository userRepository) {
        this.ventaRepository = ventaRepository;
        this.productRepository = productRepository;
        this.clienteRepository = clienteRepository;
        this.userRepository = userRepository;
    }

    public VentaResponse crear(CreateVentaRequest request, UUID usuarioId) {
        UUID tenantId = requireTenant();

        VentaEntity venta = new VentaEntity();
        venta.setId(UUID.randomUUID());
        venta.setTenantId(tenantId);
        venta.setUsuarioId(usuarioId);
        venta.setTipoDocumento(request.tipoDocumento());
        venta.setFechaVenta(Instant.now());

        // Resolve cliente if clienteId is provided
        if (request.clienteId() != null) {
            ClienteEntity cliente = clienteRepository.findByIdAndTenantId(request.clienteId(), tenantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Cliente no encontrado: " + request.clienteId()));
            venta.setCliente(cliente);
            venta.setRutCliente(cliente.getRut());
            venta.setGiroCliente(cliente.getGiro());
            venta.setNombreCliente(cliente.getNombre());
        } else {
            venta.setRutCliente(request.rutCliente());
            venta.setGiroCliente(request.giroCliente());
            venta.setNombreCliente(request.nombreCliente() != null ? request.nombreCliente() : request.rutCliente());
        }

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
        return list(tenantId, pageable, null, null, null, null, null);
    }

    public Page<VentaResponse> list(UUID tenantId, Pageable pageable,
                                     LocalDate fechaDesde, LocalDate fechaHasta,
                                     String search, String tipoDocumento, Boolean anulada) {
        // Convert LocalDate to Instant for query comparison
        Instant desde = fechaDesde != null ? fechaDesde.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant hasta = fechaHasta != null ? fechaHasta.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;

        Page<VentaEntity> page = ventaRepository.findAllByTenantIdWithFilters(tenantId, desde, hasta, cleanSearch(search), tipoDocumento, anulada, pageable);

        List<VentaEntity> ventas = page.getContent();

        // Batch-load product names
        Map<UUID, ProductEntity> allProducts = new HashMap<>();
        Set<UUID> productIds = new HashSet<>();
        for (VentaEntity v : ventas) {
            for (DetalleVentaEntity d : v.getDetalles()) {
                productIds.add(d.getProductoId());
            }
        }
        if (!productIds.isEmpty()) {
            for (ProductEntity p : productRepository.findAllById(productIds)) {
                allProducts.put(p.getId(), p);
            }
        }

        // Batch-load user names
        Set<UUID> userIds = ventas.stream().map(VentaEntity::getUsuarioId).collect(Collectors.toSet());
        Map<UUID, String> userNames = new HashMap<>();
        if (!userIds.isEmpty()) {
            for (UserEntity u : userRepository.findAllById(userIds)) {
                userNames.put(u.getId(), u.getNombre());
            }
        }

        Map<UUID, ProductEntity> productMap = allProducts;
        Map<UUID, String> nameMap = userNames;
        return page.map(v -> VentaMapper.toResponseWithProductNames(v, productMap,
                nameMap.getOrDefault(v.getUsuarioId(), "Desconocido"),
                v.getNombreCliente() != null ? v.getNombreCliente() : v.getRutCliente()));
    }

    public VentaResponse getById(UUID id) {
        UUID tenantId = requireTenant();
        VentaEntity venta = ventaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venta no encontrada: " + id));

        // Enrich with user name
        String usuarioNombre = userRepository.findById(venta.getUsuarioId())
                .map(UserEntity::getNombre)
                .orElse("Desconocido");
        String nombreCliente = venta.getNombreCliente() != null ? venta.getNombreCliente() : venta.getRutCliente();

        // Batch-load product names
        Map<UUID, ProductEntity> productMap = new HashMap<>();
        Set<UUID> productIds = new HashSet<>();
        for (DetalleVentaEntity d : venta.getDetalles()) {
            productIds.add(d.getProductoId());
        }
        if (!productIds.isEmpty()) {
            for (ProductEntity p : productRepository.findAllById(productIds)) {
                productMap.put(p.getId(), p);
            }
        }

        return VentaMapper.toResponseWithProductNames(venta, productMap, usuarioNombre, nombreCliente);
    }

    @Transactional
    public void cancelar(UUID id) {
        UUID tenantId = requireTenant();
        VentaEntity venta = ventaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venta no encontrada: " + id));
        if (venta.isAnulada()) {
            throw new IllegalStateException("La venta ya está anulada");
        }
        // Restore stock for each detail
        for (DetalleVentaEntity detalle : venta.getDetalles()) {
            ProductEntity producto = productRepository.findByIdAndTenantIdWithLock(detalle.getProductoId(), tenantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Producto no encontrado: " + detalle.getProductoId()));
            producto.setStockActual(producto.getStockActual() + detalle.getCantidad());
            productRepository.save(producto);
        }
        venta.setAnulada(true);
    }

    private static String cleanSearch(String search) {
        return (search != null && !search.isBlank()) ? search.trim() : null;
    }

    private UUID requireTenant() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant no resuelto en contexto");
        }
        return tenantId;
    }
}
