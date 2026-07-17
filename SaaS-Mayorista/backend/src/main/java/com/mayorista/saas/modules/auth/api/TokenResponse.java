package com.mayorista.saas.modules.auth.api;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long accessTokenExpiresIn
) {
}
