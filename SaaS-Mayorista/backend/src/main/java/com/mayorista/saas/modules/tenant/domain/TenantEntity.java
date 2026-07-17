package com.mayorista.saas.modules.tenant.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class TenantEntity {

    @Id
    private UUID id;

    @Column(name = "nombre_empresa", nullable = false)
    private String nombreEmpresa;

    @Column(nullable = false, unique = true)
    private String rut;

    @Column(nullable = false)
    private String giro;

    @Column
    private String direccion;

    @Column(name = "creado_en", nullable = false)
    private Instant creadoEn;

    public UUID getId() {
        return id;
    }

    public String getNombreEmpresa() {
        return nombreEmpresa;
    }

    public String getRut() {
        return rut;
    }

    public String getGiro() {
        return giro;
    }

    public String getDireccion() {
        return direccion;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setNombreEmpresa(String nombreEmpresa) {
        this.nombreEmpresa = nombreEmpresa;
    }

    public void setRut(String rut) {
        this.rut = rut;
    }

    public void setGiro(String giro) {
        this.giro = giro;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public void setCreadoEn(Instant creadoEn) {
        this.creadoEn = creadoEn;
    }
}
