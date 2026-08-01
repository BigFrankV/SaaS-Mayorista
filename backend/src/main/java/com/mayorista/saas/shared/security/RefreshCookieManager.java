package com.mayorista.saas.shared.security;

import com.mayorista.saas.modules.auth.api.RefreshRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Builds and reads the httpOnly refresh-token cookie.
 *
 * <p>The refresh token never reaches the browser JavaScript context: it is only
 * exchanged between the browser cookie jar and this backend. The access token
 * keeps travelling in the Authorization header, so CSRF does not apply to the
 * regular API; the cookie-based endpoints (refresh/logout) are protected by
 * SameSite + Origin verification (see CookieOriginFilter).</p>
 */
@Component
public class RefreshCookieManager {

    private final String name;
    private final boolean secure;
    private final String sameSite;
    private final String path;
    private final long maxAgeSeconds;

    public RefreshCookieManager(
            @Value("${app.security.cookie.name:refresh_token}") String name,
            @Value("${app.security.cookie.secure:false}") boolean secure,
            @Value("${app.security.cookie.same-site:Lax}") String sameSite,
            @Value("${app.security.cookie.path:/}") String path,
            @Value("${app.security.cookie.max-age-seconds:604800}") long maxAgeSeconds
    ) {
        this.name = name;
        this.secure = secure;
        this.sameSite = sameSite;
        this.path = path;
        this.maxAgeSeconds = maxAgeSeconds;
    }

    public String name() {
        return name;
    }

    public String buildSetCookieHeader(String refreshToken) {
        return baseCookie(refreshToken)
                .maxAge(maxAgeSeconds)
                .build()
                .toString();
    }

    public String buildClearCookieHeader() {
        return baseCookie("")
                .maxAge(0)
                .build()
                .toString();
    }

    /**
     * Reads the refresh token from the cookie first, falling back to the request
     * body for compatibility with non-browser clients (curl, Swagger UI, tests).
     */
    public String readRefreshToken(HttpServletRequest request, RefreshRequest body) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }
        if (body != null && body.refreshToken() != null && !body.refreshToken().isBlank()) {
            return body.refreshToken();
        }
        return null;
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(path);
    }
}
