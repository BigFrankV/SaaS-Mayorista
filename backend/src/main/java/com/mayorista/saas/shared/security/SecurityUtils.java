package com.mayorista.saas.shared.security;

import com.mayorista.saas.modules.users.domain.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static boolean isSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtRequestPrincipal principal)) {
            return false;
        }
        return UserRole.SUPER_ADMIN.name().equals(principal.role());
    }
}
