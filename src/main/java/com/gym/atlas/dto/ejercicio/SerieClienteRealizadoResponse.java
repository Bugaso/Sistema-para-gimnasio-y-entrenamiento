package com.gym.atlas.dto.ejercicio;

public record SerieClienteRealizadoResponse(
        Integer idSerie,
        Integer nroSerie,
        Integer nroRepeticiones,
        Double nroPeso,
        String medidaEsfuerzo,
        Integer cantMedida,
        Integer tiempoSegundos
) {
}
