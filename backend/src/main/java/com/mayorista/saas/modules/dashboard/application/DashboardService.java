package com.mayorista.saas.modules.dashboard.application;

import com.mayorista.saas.modules.dashboard.api.DashboardKpiResponse;
import com.mayorista.saas.modules.dashboard.api.VentaResumenResponse;
import com.mayorista.saas.modules.products.domain.ProductRepository;
import com.mayorista.saas.modules.sales.domain.VentaRepository;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    private final VentaRepository ventaRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public DashboardService(VentaRepository ventaRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.ventaRepository = ventaRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public DashboardKpiResponse getKpis() {
        UUID tenantId = requireTenant();
        ZoneOffset zone = ZoneOffset.UTC;

        LocalDate today = LocalDate.now(zone);
        Instant startOfToday = today.atStartOfDay(zone).toInstant();
        Instant startOfYesterday = today.minusDays(1).atStartOfDay(zone).toInstant();
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay(zone).toInstant();
        Instant startOfLastMonth = today.minusMonths(1).withDayOfMonth(1).atStartOfDay(zone).toInstant();

        BigDecimal totalVentasHoy = BigDecimal.valueOf(ventaRepository.sumTotalSince(tenantId, startOfToday));
        BigDecimal totalVentasAyer = BigDecimal.valueOf(ventaRepository.sumTotalBetween(tenantId, startOfYesterday, startOfToday));
        BigDecimal totalVentasEsteMes = BigDecimal.valueOf(ventaRepository.sumTotalSince(tenantId, startOfMonth));
        BigDecimal totalVentasMesAnterior = BigDecimal.valueOf(ventaRepository.sumTotalSince(tenantId, startOfLastMonth));
        // Subtract current month from last-month-and-current range for exact last month
        totalVentasMesAnterior = totalVentasMesAnterior.subtract(totalVentasEsteMes);

        long productosBajoStock = productRepository.countByStockBajo(tenantId);
        long usuariosActivos = userRepository.countByTenantIdAndActivoTrue(tenantId);
        long ventasDelMes = ventaRepository.countSince(tenantId, startOfMonth);

        BigDecimal cambioVsAyer = calcPercentageChange(totalVentasHoy, totalVentasAyer);
        BigDecimal cambioVsMesAnterior = calcPercentageChange(totalVentasEsteMes, totalVentasMesAnterior);

        return new DashboardKpiResponse(
                totalVentasHoy,
                productosBajoStock,
                usuariosActivos,
                ventasDelMes,
                cambioVsAyer,
                cambioVsMesAnterior
        );
    }

    public List<VentaResumenResponse> getRecentSales(int limit) {
        UUID tenantId = requireTenant();
        return ventaRepository.findRecentByTenantId(tenantId, PageRequest.of(0, limit))
                .stream()
                .map(VentaResumenResponse::from)
                .toList();
    }

    private BigDecimal calcPercentageChange(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(100)
                    : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP);
    }

    private UUID requireTenant() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant no resuelto en contexto");
        }
        return tenantId;
    }
}
