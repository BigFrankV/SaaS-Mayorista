package com.mayorista.saas.modules.categories.application;

import com.mayorista.saas.modules.categories.api.CategoryResponse;
import com.mayorista.saas.modules.categories.api.CreateCategoryRequest;
import com.mayorista.saas.modules.categories.api.UpdateCategoryRequest;
import com.mayorista.saas.modules.categories.domain.CategoryEntity;
import com.mayorista.saas.modules.categories.domain.CategoryRepository;
import com.mayorista.saas.shared.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> listActive() {
        UUID tenantId = requireTenant();
        return categoryRepository.findAllByTenantIdAndActivoTrue(tenantId)
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public CategoryResponse getById(UUID id) {
        UUID tenantId = requireTenant();
        CategoryEntity entity = categoryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada: " + id));
        return CategoryResponse.from(entity);
    }

    public CategoryResponse create(CreateCategoryRequest request) {
        UUID tenantId = requireTenant();

        if (categoryRepository.existsByTenantIdAndNombreIgnoreCase(tenantId, request.nombre())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una categoria con ese nombre");
        }

        CategoryEntity entity = new CategoryEntity();
        entity.setId(UUID.randomUUID());
        entity.setTenantId(tenantId);
        entity.setNombre(request.nombre().trim());
        entity.setActivo(true);
        entity.setCreadoEn(Instant.now());
        return CategoryResponse.from(categoryRepository.save(entity));
    }

    public CategoryResponse update(UUID id, UpdateCategoryRequest request) {
        UUID tenantId = requireTenant();
        CategoryEntity entity = categoryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada: " + id));

        // Check name uniqueness (excluding current entity)
        if (!entity.getNombre().equalsIgnoreCase(request.nombre().trim())
                && categoryRepository.existsByTenantIdAndNombreIgnoreCase(tenantId, request.nombre())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una categoria con ese nombre");
        }

        entity.setNombre(request.nombre().trim());
        return CategoryResponse.from(categoryRepository.save(entity));
    }

    public void delete(UUID id) {
        UUID tenantId = requireTenant();
        CategoryEntity entity = categoryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada: " + id));
        entity.setActivo(false);
        categoryRepository.save(entity);
    }

    private UUID requireTenant() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant no resuelto en contexto");
        }
        return tenantId;
    }
}
