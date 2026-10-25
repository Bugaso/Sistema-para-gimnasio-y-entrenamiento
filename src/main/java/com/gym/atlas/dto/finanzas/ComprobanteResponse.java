package com.gym.atlas.dto.finanzas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ComprobanteResponse(
        Integer idComprobante,
        Integer idCatGasto,
        String nombreCatGasto,
        String descripcionGasto,
        LocalDate fechaDelComprobante,
        LocalDateTime fechaRegistroGasto,
        BigDecimal monto,
        String estado
) {}