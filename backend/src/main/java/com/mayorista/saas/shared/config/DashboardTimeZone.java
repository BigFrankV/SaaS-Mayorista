package com.mayorista.saas.shared.config;

import java.time.ZoneId;

/**
 * Resolves the time zone used by dashboard KPIs and sale-list date filters.
 * <p>
 * The {@code app.dashboard.time-zone} property accepts either a real zone id
 * (e.g. {@code America/Santiago}) or the special value {@code systemDefault},
 * which keeps both sides of the time computation aligned with the host JVM
 * (the pre-existing behavior of the sale listing).
 */
public final class DashboardTimeZone {

    public static final String SYSTEM_DEFAULT = "systemDefault";

    private DashboardTimeZone() {
    }

    public static ZoneId resolve(String configured) {
        if (configured == null || configured.isBlank() || SYSTEM_DEFAULT.equalsIgnoreCase(configured)) {
            return ZoneId.systemDefault();
        }
        return ZoneId.of(configured);
    }
}
