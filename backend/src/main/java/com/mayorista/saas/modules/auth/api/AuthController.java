package com.mayorista.saas.modules.auth.api;

import com.mayorista.saas.modules.auth.application.AuthService;
import com.mayorista.saas.shared.security.JwtRequestPrincipal;
import com.mayorista.saas.shared.security.RefreshCookieManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshCookieManager refreshCookieManager;

    public AuthController(AuthService authService, RefreshCookieManager refreshCookieManager) {
        this.authService = authService;
        this.refreshCookieManager = refreshCookieManager;
    }

    @PostMapping("/bootstrap")
    public ResponseEntity<TokenResponse> bootstrap(@Valid @RequestBody BootstrapRequest request,
                                                   HttpServletResponse response) {
        TokenResponse pair = authService.bootstrap(request);
        writeRefreshCookie(response, pair.refreshToken());
        return ResponseEntity.ok(toPublicResponse(pair));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        TokenResponse pair = authService.login(request);
        writeRefreshCookie(response, pair.refreshToken());
        return ResponseEntity.ok(toPublicResponse(pair));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody(required = false) RefreshRequest request,
                                                 HttpServletRequest servletRequest,
                                                 HttpServletResponse servletResponse) {
        String refreshToken = refreshCookieManager.readRefreshToken(servletRequest, request);
        if (refreshToken == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token missing");
        }
        TokenResponse pair = authService.refresh(refreshToken);
        writeRefreshCookie(servletResponse, pair.refreshToken());
        return ResponseEntity.ok(toPublicResponse(pair));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshRequest request,
                                       HttpServletRequest servletRequest,
                                       HttpServletResponse servletResponse) {
        String accessJti = (String) servletRequest.getAttribute("access_jti");
        String refreshToken = refreshCookieManager.readRefreshToken(servletRequest, request);
        authService.logout(refreshToken, accessJti);
        servletResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookieManager.buildClearCookieHeader());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication authentication) {
        JwtRequestPrincipal principal = (JwtRequestPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(authService.getCurrentUserProfile(principal.userId()));
    }

    private void writeRefreshCookie(HttpServletResponse response, String refreshToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookieManager.buildSetCookieHeader(refreshToken));
    }

    /**
     * The refresh token leaves the server only via the httpOnly cookie; the JSON
     * body carries just the access token (and a null refreshToken placeholder to
     * keep the response shape stable).
     */
    private TokenResponse toPublicResponse(TokenResponse pair) {
        return new TokenResponse(pair.accessToken(), null, pair.tokenType(), pair.accessTokenExpiresIn());
    }
}
