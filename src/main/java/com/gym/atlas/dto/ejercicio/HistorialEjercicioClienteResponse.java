package com.gym.atlas.dto.ejercicio;

import com.gym.atlas.dto.historial.SerieRealizadaResponse;

import java.time.LocalDate;
import java.util.List;

public record HistorialEjercicioClienteResponse(
        Integer idEjercicio,
        String nombreEjercicio,

        List<SerieClienteRealizadoResponse> seriesRealizadas
) {
}
