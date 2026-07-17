package com.mayorista.saas.shared.security;

import com.mayorista.saas.modules.users.domain.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class SecurityUserPrincipal implements UserDetails {

    private final UUID userId;
    private final UUID tenantId;
    private final String email;
    private final String password;
    private final String role;
    private final boolean active;

    public SecurityUserPrincipal(UserEntity user) {
        this.userId = user.getId();
        this.tenantId = user.getTenantId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.role = user.getRol().name();
        this.active = user.isActivo();
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
