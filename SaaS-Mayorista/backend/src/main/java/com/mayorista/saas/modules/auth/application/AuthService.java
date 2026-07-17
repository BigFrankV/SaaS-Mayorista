package com.mayorista.saas.modules.auth.application;

import com.mayorista.saas.modules.auth.api.BootstrapRequest;
import com.mayorista.saas.modules.auth.api.LoginRequest;
import com.mayorista.saas.modules.auth.api.TokenResponse;
import com.mayorista.saas.modules.auth.domain.RefreshTokenEntity;
import com.mayorista.saas.modules.auth.domain.RefreshTokenRepository;
import com.mayorista.saas.modules.tenant.domain.TenantEntity;
import com.mayorista.saas.modules.tenant.domain.TenantRepository;
import com.mayorista.saas.modules.users.domain.UserEntity;
import com.mayorista.saas.modules.users.domain.UserRepository;
import com.mayorista.saas.modules.users.domain.UserRole;
import com.mayorista.saas.shared.security.JwtService;
import com.mayorista.saas.shared.security.JwtTokenData;
import com.mayorista.saas.shared.security.TokenBlocklistService;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlocklistService tokenBlocklistService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            TenantRepository tenantRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenBlocklistService tokenBlocklistService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenBlocklistService = tokenBlocklistService;
    }

    @Transactional
    public TokenResponse bootstrap(BootstrapRequest request) {
        if (userRepository.findByEmailIgnoreCase(request.emailAdmin()).isPresent()) {
            throw new IllegalArgumentException("El correo del administrador ya existe");
        }

        TenantEntity tenant = new TenantEntity();
        tenant.setId(UUID.randomUUID());
        tenant.setNombreEmpresa(request.nombreEmpresa());
        tenant.setRut(request.rutEmpresa());
        tenant.setGiro(request.giroEmpresa());
        tenant.setDireccion(request.direccionEmpresa());
        tenant.setCreadoEn(Instant.now());
        tenantRepository.save(tenant);

        UserEntity admin = new UserEntity();
        admin.setId(UUID.randomUUID());
        admin.setTenantId(tenant.getId());
        admin.setNombre(request.nombreAdmin());
        admin.setEmail(request.emailAdmin().toLowerCase());
        admin.setPasswordHash(passwordEncoder.encode(request.passwordAdmin()));
        admin.setRol(UserRole.ADMIN);
        admin.setActivo(true);
        admin.setCreadoEn(Instant.now());
        userRepository.save(admin);

        return issueTokenPair(admin);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserEntity user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        return issueTokenPair(user);
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        Claims claims = jwtService.parseRefreshToken(refreshToken);
        String jti = claims.getId();

        RefreshTokenEntity existing = refreshTokenRepository.findByJti(jti)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token invalido"));

        if (existing.isRevocado() || existing.getExpiraEn().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token expirado o revocado");
        }

        UserEntity user = userRepository.findById(existing.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no existe"));

        existing.setRevocado(true);
        existing.setRevocadoEn(Instant.now());
        refreshTokenRepository.save(existing);
        tokenBlocklistService.blockJti(jti, Duration.between(Instant.now(), existing.getExpiraEn()).abs());

        return issueTokenPair(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        Claims claims = jwtService.parseRefreshToken(refreshToken);
        String jti = claims.getId();

        refreshTokenRepository.findByJti(jti).ifPresent(token -> {
            if (!token.isRevocado()) {
                token.setRevocado(true);
                token.setRevocadoEn(Instant.now());
                refreshTokenRepository.save(token);
            }
            Duration ttl = Duration.between(Instant.now(), token.getExpiraEn()).abs();
            tokenBlocklistService.blockJti(jti, ttl);
        });
    }

    private TokenResponse issueTokenPair(UserEntity user) {
        JwtTokenData access = jwtService.generateAccessToken(user);
        JwtTokenData refresh = jwtService.generateRefreshToken(user);

        RefreshTokenEntity refreshEntity = new RefreshTokenEntity();
        refreshEntity.setId(UUID.randomUUID());
        refreshEntity.setJti(refresh.jti());
        refreshEntity.setUsuarioId(user.getId());
        refreshEntity.setTenantId(user.getTenantId());
        refreshEntity.setExpiraEn(refresh.expiresAt());
        refreshEntity.setRevocado(false);
        refreshEntity.setCreadoEn(Instant.now());
        refreshTokenRepository.save(refreshEntity);

        long accessExpiresIn = Duration.between(Instant.now(), access.expiresAt()).getSeconds();
        return new TokenResponse(access.token(), refresh.token(), "Bearer", accessExpiresIn);
    }
}
