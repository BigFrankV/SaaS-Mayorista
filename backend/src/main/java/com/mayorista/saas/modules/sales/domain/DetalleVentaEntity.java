package com.mayorista.saas.modules.sales.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "detalle_ventas")
public class DetalleVentaEntity {

    @Id
    private UUID id;

    @Column(name = "venta_id", nullable = false, insertable = false, updatable = false)
    private UUID ventaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id")
    private VentaEntity venta;

    @Column(name = "producto_id", nullable = false)
    private UUID productoId;

    @Column(nullable = false)
    private int cantidad;

    @Column(name = "precio_neto_historico", nullable = false)
    private int precioNetoHistorico;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getVentaId() {
        return ventaId;
    }

    public void setVentaId(UUID ventaId) {
        this.ventaId = ventaId;
    }

    public VentaEntity getVenta() {
        return venta;
    }

    public void setVenta(VentaEntity venta) {
        this.venta = venta;
    }

    public UUID getProductoId() {
        return productoId;
    }

    public void setProductoId(UUID productoId) {
        this.productoId = productoId;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public int getPrecioNetoHistorico() {
        return precioNetoHistorico;
    }

    public void setPrecioNetoHistorico(int precioNetoHistorico) {
        this.precioNetoHistorico = precioNetoHistorico;
    }
}
