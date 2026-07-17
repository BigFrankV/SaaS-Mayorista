package com.mayorista.saas.modules.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshTokenEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String jti;

    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "expira_en", nullable = false)
    private Instant expiraEn;

    @Column(nullable = false)
    private boolean revocado;

    @Column(name = "creado_en", nullable = false)
    private Instant creadoEn;

    @Column(name = "revocado_en")
    private Instant revocadoEn;

    public UUID getId() {
        return id;
    }

    public String getJti() {
        return jti;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public Instant getExpiraEn() {
        return expiraEn;
    }

    public boolean isRevocado() {
        return revocado;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }

    public Instant getRevocadoEn() {
        return revocadoEn;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setJti(String jti) {
        this.jti = jti;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }

    public void setExpiraEn(Instant expiraEn) {
        this.expiraEn = expiraEn;
    }

    public void setRevocado(boolean revocado) {
        this.revocado = revocado;
    }

    public void setCreadoEn(Instant creadoEn) {
        this.creadoEn = creadoEn;
    }

    public void setRevocadoEn(Instant revocadoEn) {
        this.revocadoEn = revocadoEn;
    }
}
