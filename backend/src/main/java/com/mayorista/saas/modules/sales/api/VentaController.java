package com.mayorista.saas.modules.sales.api;

import com.mayorista.saas.modules.sales.application.VentaService;
import com.mayorista.saas.shared.security.JwtRequestPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDEDOR')")
    public ResponseEntity<VentaResponse> crear(
            @Valid @RequestBody CreateVentaRequest request,
            Authentication authentication) {
        JwtRequestPrincipal principal = (JwtRequestPrincipal) authentication.getPrincipal();
        VentaResponse response = ventaService.crear(request, principal.userId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDEDOR', 'ROLE_CONTADOR')")
    public ResponseEntity<Page<VentaResponse>> list(
            @PageableDefault(size = 20, sort = "fechaVenta", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        return ResponseEntity.ok(ventaService.list(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDEDOR', 'ROLE_CONTADOR')")
    public ResponseEntity<VentaResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ventaService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        ventaService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
