package com.mayorista.saas.modules.dashboard.application;

import com.mayorista.saas.AbstractIntegrationTest;
import com.mayorista.saas.modules.dashboard.api.DashboardKpiResponse;
import com.mayorista.saas.modules.sales.domain.VentaEntity;
import com.mayorista.saas.modules.sales.domain.VentaRepository;
import com.mayorista.saas.modules.tenant.domain.TenantEntity;
import com.mayorista.saas.modules.tenant.domain.TenantRepository;
import com.mayorista.saas.modules.users.domain.UserEntity;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.modules.users.domain.UserRole;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Verifies B2: dashboard KPIs (today / yesterday / month totals and counts)
 * exclude cancelled sales, and the time windows use the configured zone that
 * also drives the sale listing (B3).
 */
class DashboardServiceTest extends AbstractIntegrationTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void clearTenantContext() {
        TenantContext.clear();
    }

    @Test
    void kpis_excludeCancelledSales_fromTodayTotalsAndMonthCount() {
        UUID tenantId = createTenant();
        UUID userId = createUser(tenantId);
        Instant noonToday = LocalDate.now(ZoneId.systemDefault()).atStartOfDay(ZoneId.systemDefault())
                .plusSeconds(12 * 3600).toInstant();
        createVenta(tenantId, userId, noonToday, 100_000, false);
        createVenta(tenantId, userId, noonToday, 999_999, true);

        DashboardKpiResponse kpis = dashboardService.getKpis();

        assertEquals(BigDecimal.valueOf(100_000), kpis.totalVentasHoy());
        assertEquals(1, kpis.ventasDelMes());
    }

    @Test
    void kpis_excludeCancelledSales_fromYesterdayAndLastMonthComparisons() {
        UUID tenantId = createTenant();
        UUID userId = createUser(tenantId);
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        Instant startOfToday = today.atStartOfDay(zone).toInstant();
        Instant startOfYesterday = today.minusDays(1).atStartOfDay(zone).toInstant();
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay(zone).toInstant();
        Instant startOfLastMonth = today.minusMonths(1).withDayOfMonth(1).atStartOfDay(zone).toInstant();

        // Mid-day instants are always inside their target window, whatever the
        // hour the test runs at.
        createVenta(tenantId, userId, startOfToday.plusSeconds(12 * 3600), 100_000, false);
        createVenta(tenantId, userId, startOfYesterday.plusSeconds(6 * 3600), 50_000, false);
        createVenta(tenantId, userId, startOfYesterday.plusSeconds(7 * 3600), 100_000, true);
        createVenta(tenantId, userId, startOfLastMonth.plusSeconds(6 * 3600), 200_000, false);
        createVenta(tenantId, userId, startOfLastMonth.plusSeconds(7 * 3600), 777_777, true);

        DashboardKpiResponse kpis = dashboardService.getKpis();

        // Yesterday total = 50_000 (cancelled 100_000 excluded): change vs today
        // (100_000) is +100.00. If the cancelled sale were counted, the change
        // would be -33.33 instead.
        assertEquals(BigDecimal.valueOf(100).setScale(2), kpis.cambioVsAyer());

        // Recomputed in pure Java over the seeded ventas (cancelled excluded),
        // so the assertion is independent of where the month boundaries fall.
        List<VentaEntity> ventas = ventaRepository
                .findAllByTenantId(tenantId, PageRequest.of(0, 100))
                .getContent();
        long currentMonth = ventas.stream()
                .filter(v -> !v.isAnulada() && !v.getFechaVenta().isBefore(startOfMonth))
                .mapToLong(VentaEntity::getTotal)
                .sum();
        long lastMonth = ventas.stream()
                .filter(v -> !v.isAnulada()
                        && !v.getFechaVenta().isBefore(startOfLastMonth)
                        && v.getFechaVenta().isBefore(startOfMonth))
                .mapToLong(VentaEntity::getTotal)
                .sum();
        BigDecimal expectedChange = calcPercentageChange(
                BigDecimal.valueOf(currentMonth), BigDecimal.valueOf(lastMonth));

        assertEquals(expectedChange, kpis.cambioVsMesAnterior());
    }

    private static BigDecimal calcPercentageChange(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(100)
                    : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP);
    }

    private UUID createTenant() {
        TenantEntity tenant = new TenantEntity();
        tenant.setId(UUID.randomUUID());
        tenant.setNombreEmpresa("Test Empresa");
        tenant.setRut("76" + UUID.randomUUID().toString().replace("-", "").substring(0, 9));
        tenant.setGiro("Comercio");
        tenant.setDireccion("Direccion");
        tenant.setCreadoEn(Instant.now());
        TenantEntity saved = tenantRepository.save(tenant);
        TenantContext.setTenantId(saved.getId());
        return saved.getId();
    }

    private UUID createUser(UUID tenantId) {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setTenantId(tenantId);
        user.setNombre("Test User");
        user.setEmail("user-" + UUID.randomUUID() + "@test.com");
        user.setPasswordHash("hash");
        user.setRol(UserRole.ADMIN);
        user.setActivo(true);
        user.setCreadoEn(Instant.now());
        return userRepository.save(user).getId();
    }

    private void createVenta(UUID tenantId, UUID userId, Instant fechaVenta, int total, boolean anulada) {
        VentaEntity venta = new VentaEntity();
        venta.setId(UUID.randomUUID());
        venta.setTenantId(tenantId);
        venta.setUsuarioId(userId);
        venta.setTipoDocumento("BOLETA");
        venta.setRutCliente("11111111-1");
        venta.setNombreCliente("Cliente");
        venta.setFechaVenta(fechaVenta);
        venta.setTotalNeto(total);
        venta.setIva(0);
        venta.setTotal(total);
        venta.setAnulada(anulada);
        ventaRepository.save(venta);
    }
}
