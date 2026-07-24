package com.mayorista.saas.shared.config;

import com.mayorista.saas.modules.tenant.domain.TenantEntity;
import com.mayorista.saas.modules.tenant.domain.TenantRepository;
import com.mayorista.saas.modules.users.domain.UserEntity;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.modules.users.domain.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Component
@Profile("demo")
@Transactional
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(TenantRepository tenantRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (tenantRepository.existsByRut("11111111-1")) {
            log.info("Demo tenant already seeded, skipping.");
            return;
        }

        // Create demo tenant with demo=true
        TenantEntity tenant = new TenantEntity();
        tenant.setId(UUID.randomUUID());
        tenant.setNombreEmpresa("Demo Mayorista SPA");
        tenant.setRut("11111111-1");
        tenant.setGiro("Demostración");
        tenant.setDireccion("Av. Principal 123, Santiago");
        tenant.setDemo(true);
        tenant.setCreadoEn(Instant.now());
        tenant = tenantRepository.save(tenant);

        // Create admin user
        UserEntity admin = new UserEntity();
        admin.setId(UUID.randomUUID());
        admin.setTenantId(tenant.getId());
        admin.setNombre("Administrador Demo");
        admin.setEmail("admin@demo.cl");
        admin.setPasswordHash(passwordEncoder.encode("Demo123!"));
        admin.setRol(UserRole.ADMIN);
        admin.setActivo(true);
        admin.setCreadoEn(Instant.now());
        userRepository.save(admin);

        // Create vendor user
        UserEntity vendor = new UserEntity();
        vendor.setId(UUID.randomUUID());
        vendor.setTenantId(tenant.getId());
        vendor.setNombre("Vendedor Demo");
        vendor.setEmail("vendedor@demo.cl");
        vendor.setPasswordHash(passwordEncoder.encode("Demo123!"));
        vendor.setRol(UserRole.VENDEDOR);
        vendor.setActivo(true);
        vendor.setCreadoEn(Instant.now());
        userRepository.save(vendor);

        log.info("Demo tenant seeded successfully. Admin: admin@demo.cl / Demo123! | Vendor: vendedor@demo.cl / Demo123!");
    }
}
