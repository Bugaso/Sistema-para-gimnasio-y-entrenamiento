package com.gym.atlas.dto.usuario;

import java.math.BigDecimal;

public record HistorialMedicoRequest(
        Integer idUsuario, // Se enviará desde un select en el Frontend
        BigDecimal alturaHReg,
        BigDecimal pesoHReg,
        String condMed,
        String descHMed
) {}