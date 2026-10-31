package com.gym.atlas.dto.rutina;

import java.time.LocalTime;

public record DetalleRutinaRequest(
        Integer idEjercicio,
        Integer idMedidaEsfuerzo,
        String diaSemana,
        String rangoSeries,
        String rangoRep,
        String rangoPeso,
        LocalTime tiempoEstimado
) {}