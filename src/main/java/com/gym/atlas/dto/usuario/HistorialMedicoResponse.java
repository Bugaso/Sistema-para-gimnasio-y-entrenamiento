package com.gym.atlas.dto.usuario;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HistorialMedicoResponse(
        Integer idHMedico,
        Long idUsuario,
        Long dniUsuario,
        String nombreUsuario,
        BigDecimal alturaHReg,
        BigDecimal pesoHReg,
        String condMed,
        String descHMed,
        LocalDate fechaRegHMed
) {}