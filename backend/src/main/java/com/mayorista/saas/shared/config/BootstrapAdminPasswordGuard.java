package com.mayorista.saas.shared.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * S10: bootstrap must never run with a known/empty admin password outside dev.
 * If bootstrap is enabled but no admin password was configured, the
 * application aborts startup instead of silently creating an admin with a
 * predictable credential. In dev, DevBootstrapSeeder generates a random
 * password instead, so this guard is skipped there.
 */
@Component
@Profile("!dev")
public class BootstrapAdminPasswordGuard implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapAdminPasswordGuard.class);

    private final boolean bootstrapEnabled;
    private final String adminPassword;

    public BootstrapAdminPasswordGuard(
            @Value("${app.bootstrap.enabled:false}") boolean bootstrapEnabled,
            @Value("${app.bootstrap.admin-password:}") String adminPassword
    ) {
        this.bootstrapEnabled = bootstrapEnabled;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!bootstrapEnabled) {
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.error("app.bootstrap.enabled=true but app.bootstrap.admin-password is empty. "
                    + "Set APP_BOOTSTRAP_ADMIN_PASSWORD or disable bootstrap (APP_BOOTSTRAP_ENABLED=false). "
                    + "Application will not start: refusing to create an admin with a known/empty password.");
            throw new IllegalStateException(
                    "app.bootstrap.admin-password is empty while app.bootstrap.enabled=true. "
                            + "Set APP_BOOTSTRAP_ADMIN_PASSWORD or disable bootstrap (APP_BOOTSTRAP_ENABLED=false)."
            );
        }
    }
}
