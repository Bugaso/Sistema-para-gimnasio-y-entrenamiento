package com.gym.atlas.dto.finanzas;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ComprobanteRequest(
        Integer idCatGasto,
        String descripcionGasto,
        LocalDate fechaDelComprobante,
        BigDecimal monto,
        String estado
) {}