package com.mayorista.saas.modules.tenant.api;

import java.util.UUID;

public record TenantRegistrationResponse(UUID tenantId, UUID adminUserId, String mensaje) {}
