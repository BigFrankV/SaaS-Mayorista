package com.mayorista.saas.shared.config;

import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.UUID;

@Component("tenantAwareKeyGenerator")
public class TenantAwareCacheKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return tenantId + "_" + method.getName() + "_" + Arrays.deepToString(params);
        }
        return method.getName() + "_" + Arrays.deepToString(params);
    }
}
