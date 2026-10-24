package com.gym.atlas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ComprobanteRequest(
        Integer idCatGasto,
        String descripcionGasto,
        LocalDate fechaDelComprobante,
        BigDecimal monto,
        String estado
) {}