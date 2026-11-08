package com.gym.atlas.dto.historial;

public record SerieRealizadaRequest(
        Integer idEjercicio,
        Integer nroSerie,
        Integer nroRepeticiones,
        Double nroPeso,
        String medidaEsfuerzo,
        Integer cantMedida,
        Integer tiempoSegundos
) {}