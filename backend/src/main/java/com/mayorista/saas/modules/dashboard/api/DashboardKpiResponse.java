package com.mayorista.saas.modules.dashboard.api;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record DashboardKpiResponse(
        @JsonProperty("totalVentasHoy") BigDecimal totalVentasHoy,
        @JsonProperty("productosBajoStock") long productosBajoStock,
        @JsonProperty("usuariosActivos") long usuariosActivos,
        @JsonProperty("ventasDelMes") long ventasDelMes,
        @JsonProperty("cambioVsAyer") BigDecimal cambioVsAyer,
        @JsonProperty("cambioVsMesAnterior") BigDecimal cambioVsMesAnterior
) {}
