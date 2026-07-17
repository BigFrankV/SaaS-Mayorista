package com.mayorista.saas.modules.auth.application;

import com.mayorista.saas.AbstractIntegrationTest;
import com.mayorista.saas.modules.auth.api.BootstrapRequest;
import com.mayorista.saas.modules.auth.api.LoginRequest;
import com.mayorista.saas.modules.auth.api.TokenResponse;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.shared.security.LoginLockoutService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest extends AbstractIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginLockoutService loginLockoutService;

    @Test
    void bootstrap_createsTenantAndAdmin() {
        BootstrapRequest req = new BootstrapRequest(
                "Test Empresa", "11111111-1", "Comercio", null,
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
                "Test Empresa", "22222222-2", "Comercio", null,
                "Admin", "admin@test.com", "Admin123!"
        ));
        TokenResponse response = authService.login(new LoginRequest("admin@test.com", "Admin123!"));
        assertNotNull(response.accessToken());
        assertNotNull(response.refreshToken());
    }

    @Test
    void login_withInvalidPassword_throwsException() {
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa", "33333333-3", "Comercio", null,
                "Admin", "admin2@test.com", "Admin123!"
        ));
        assertThrows(Exception.class, () ->
                authService.login(new LoginRequest("admin2@test.com", "wrongpass"))
        );
    }

    @Test
    void login_locksAccountAfterMaxFailedAttempts() {
        String email = "lockout@test.com";
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa", "44444444-4", "Comercio", null,
                "Admin", email, "CorrectPass1!"
        ));

        // 5 failed attempts (max-attempts default = 5)
        for (int i = 0; i < 5; i++) {
            assertThrows(Exception.class, () ->
                    authService.login(new LoginRequest(email, "wrongpass"))
            );
        }

        // 6th attempt — blocked
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                authService.login(new LoginRequest(email, "CorrectPass1!"))
        );
        assertTrue(ex.getMessage().contains("bloqueada"));

        // Reset for cleanup
        loginLockoutService.resetAttempts(email);
    }

    @Test
    void login_resetsLockoutAfterSuccessfulLogin() {
        String email = "reset-lockout@test.com";
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa", "55555555-5", "Comercio", null,
                "Admin", email, "CorrectPass2!"
        ));

        // 3 failed attempts
        for (int i = 0; i < 3; i++) {
            assertThrows(Exception.class, () ->
                    authService.login(new LoginRequest(email, "wrongpass"))
            );
        }

        // Successful login resets counter
        TokenResponse response = authService.login(new LoginRequest(email, "CorrectPass2!"));
        assertNotNull(response.accessToken());

        // Now a failed attempt should NOT be blocked (counter was reset)
        assertThrows(Exception.class, () ->
                authService.login(new LoginRequest(email, "wrongpass"))
        );
        // Only 1 failed attempt now, should still be allowed
        assertDoesNotThrow(() ->
                authService.login(new LoginRequest(email, "CorrectPass2!"))
        );

        loginLockoutService.resetAttempts(email);
    }

    @Test
    void refresh_withValidToken_returnsNewTokens() {
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa", "66666666-6", "Comercio", null,
                "Admin", "refresh-valid@test.com", "Pass1234!"
        ));
        TokenResponse loginResp = authService.login(new LoginRequest("refresh-valid@test.com", "Pass1234!"));

        TokenResponse refreshResp = authService.refresh(loginResp.refreshToken());

        assertNotNull(refreshResp.accessToken());
        assertNotNull(refreshResp.refreshToken());
        assertNotEquals(loginResp.accessToken(), refreshResp.accessToken());
        assertNotEquals(loginResp.refreshToken(), refreshResp.refreshToken());
    }

    @Test
    void refresh_withRevokedToken_throwsException() {
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa", "77777777-7", "Comercio", null,
                "Admin", "refresh-revoked@test.com", "Pass1234!"
        ));
        TokenResponse loginResp = authService.login(new LoginRequest("refresh-revoked@test.com", "Pass1234!"));

        // First refresh — works and rotates
        TokenResponse firstRefresh = authService.refresh(loginResp.refreshToken());
        assertNotNull(firstRefresh.accessToken());

        // Second refresh with the OLD (already revoked) token — should fail
        assertThrows(Exception.class, () ->
                authService.refresh(loginResp.refreshToken())
        );
    }

    @Test
    void refresh_afterLogout_throwsException() {
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa", "88888888-8", "Comercio", null,
                "Admin", "logout-test@test.com", "Pass1234!"
        ));
        TokenResponse loginResp = authService.login(new LoginRequest("logout-test@test.com", "Pass1234!"));

        // Logout
        authService.logout(loginResp.refreshToken());

        // Refresh with the logged-out token — should fail
        assertThrows(Exception.class, () ->
                authService.refresh(loginResp.refreshToken())
        );
    }

    @Test
    void logout_doesNotAffectOtherUsers() {
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa A", "99999999-9", "Comercio", null,
                "Admin A", "user-a@test.com", "Pass1234!"
        ));
        authService.bootstrap(new BootstrapRequest(
                "Test Empresa B", "10101010-1", "Comercio", null,
                "Admin B", "user-b@test.com", "Pass1234!"
        ));

        TokenResponse userALogin = authService.login(new LoginRequest("user-a@test.com", "Pass1234!"));
        TokenResponse userBLogin = authService.login(new LoginRequest("user-b@test.com", "Pass1234!"));

        // User A logs out
        authService.logout(userALogin.refreshToken());

        // User A token is revoked
        assertThrows(Exception.class, () ->
                authService.refresh(userALogin.refreshToken())
        );

        // User B token still works
        TokenResponse userBRefresh = authService.refresh(userBLogin.refreshToken());
        assertNotNull(userBRefresh.accessToken());
    }
}
