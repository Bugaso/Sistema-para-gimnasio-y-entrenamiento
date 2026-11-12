package com.gym.atlas.dto.cliente;

public record RegistroSerieClienteRequest(
        Integer idEjercicio,
        Integer nroSerie,
        Integer nroRepeticiones,
        Double nroPeso,
        String medidaEsfuerzo,
        Integer cantMedida,
        Integer tiempoSegundos
) {}