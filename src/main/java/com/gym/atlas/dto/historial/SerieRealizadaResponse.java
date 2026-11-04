package com.gym.atlas.dto.historial;

public record SerieRealizadaResponse(
        Integer idSerie,
        Integer idEjercicio,
        String nombreEjercicio,
        Integer nroSerie,
        Integer nroRepeticiones,
        Double nroPeso,
        String medidaEsfuerzo,
        Integer cantMedida,
        Integer tiempoSegundos
) {}