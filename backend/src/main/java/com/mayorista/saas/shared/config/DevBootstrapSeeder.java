package com.mayorista.saas.shared.config;

import com.mayorista.saas.modules.tenant.domain.TenantEntity;
import com.mayorista.saas.modules.tenant.domain.TenantRepository;
import com.mayorista.saas.modules.users.domain.UserEntity;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.modules.users.domain.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

@Component
@Profile("dev")
public class DevBootstrapSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevBootstrapSeeder.class);

    private static final String RANDOM_PASSWORD_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.bootstrap.enabled:true}")
    private boolean enabled;

    @Value("${app.bootstrap.tenant-name:Distribuidora Demo}")
    private String tenantName;

    @Value("${app.bootstrap.tenant-rut:76123456-7}")
    private String tenantRut;

    @Value("${app.bootstrap.tenant-giro:Comercializacion de alimentos}")
    private String tenantGiro;

    @Value("${app.bootstrap.tenant-address:Casa matriz}")
    private String tenantAddress;

    @Value("${app.bootstrap.admin-name:Administrador}")
    private String adminName;

    @Value("${app.bootstrap.admin-email:admin@mayorista.local}")
    private String adminEmail;

    @Value("${app.bootstrap.admin-password:}")
    private String adminPassword;

    public DevBootstrapSeeder(TenantRepository tenantRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        // S10: no known default password anymore. In dev, generate a random one
        // and log it exactly once (startup). Non-dev profiles fail fast instead
        // (BootstrapAdminPasswordGuard).
        if (adminPassword == null || adminPassword.isBlank()) {
            adminPassword = generateRandomPassword(24);
            log.warn("app.bootstrap.admin-password is empty. Generated a random bootstrap admin password "
                    + "(logged once at startup): {}", adminPassword);
        }

        if (tenantRepository.count() > 0 || userRepository.findByEmailIgnoreCase(adminEmail).isPresent()) {
            if (tenantRepository.count() > 0) {
                log.info("Tenants already exist, skipping bootstrap seeder.");
            }
            return;
        }

        TenantEntity tenant = new TenantEntity();
        tenant.setId(UUID.randomUUID());
        tenant.setNombreEmpresa(tenantName);
        tenant.setRut(tenantRut);
        tenant.setGiro(tenantGiro);
        tenant.setDireccion(tenantAddress);
        tenant.setCreadoEn(Instant.now());
        tenantRepository.save(tenant);

        UserEntity admin = new UserEntity();
        admin.setId(UUID.randomUUID());
        admin.setTenantId(tenant.getId());
        admin.setNombre(adminName);
        admin.setEmail(adminEmail.toLowerCase());
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRol(UserRole.ADMIN);
        admin.setActivo(true);
        admin.setCreadoEn(Instant.now());
        userRepository.save(admin);
    }

    private String generateRandomPassword(int length) {
        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            password.append(RANDOM_PASSWORD_CHARS.charAt(secureRandom.nextInt(RANDOM_PASSWORD_CHARS.length())));
        }
        return password.toString();
    }
}