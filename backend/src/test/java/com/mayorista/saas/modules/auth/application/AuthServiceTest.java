package com.mayorista.saas.modules.auth.application;

import com.mayorista.saas.AbstractIntegrationTest;
import com.mayorista.saas.modules.auth.api.BootstrapRequest;
import com.mayorista.saas.modules.auth.api.LoginRequest;
import com.mayorista.saas.modules.auth.api.TokenResponse;
import com.mayorista.saas.modules.users.domain.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest extends AbstractIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void bootstrap_createsTenantAndAdmin() {
        BootstrapRequest req = new BootstrapRequest(
                "Test Empresa", "11111111-1", "Comercio",
                "Test Admin", "test@test.com", "Test123!"
        );
        TokenResponse response = authService.bootstrap(req);
        assertNotNull(response.accessToken());
        assertNotNull(response.refreshToken());
        assertTrue(userRepository.findByEmailIgnoreCase("test@test.com").isPresent());
    }

    @Test
    void login_withValidCredentials_returnsToken() {
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa", "22222222-2", "Comercio",
                "Admin", "admin@test.com", "Admin123!"
        ));
        TokenResponse response = authService.login(new LoginRequest("admin@test.com", "Admin123!"));
        assertNotNull(response.accessToken());
        assertNotNull(response.refreshToken());
    }

    @Test
    void login_withInvalidPassword_throwsException() {
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa", "33333333-3", "Comercio",
                "Admin", "admin2@test.com", "Admin123!"
        ));
        assertThrows(Exception.class, () ->
                authService.login(new LoginRequest("admin2@test.com", "wrongpass"))
        );
    }
}
