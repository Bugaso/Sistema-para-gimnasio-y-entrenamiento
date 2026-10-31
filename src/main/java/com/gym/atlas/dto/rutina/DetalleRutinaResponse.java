package com.gym.atlas.dto.rutina;

import java.time.LocalTime;

public record DetalleRutinaResponse(
        Integer idDetalle,
        String diaSemana,
        String nombreEjercicio,
        String rangoSeries,
        String rangoRep,
        String rangoPeso,
        LocalTime tiempoEstimado,
        String nombreMedidaEsfuerzo
) {}