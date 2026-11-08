package com.gym.atlas.dto.historial;
import java.time.LocalDate;
import java.util.List;

public record HistorialDetalleResponse(
        Integer idHistRut,
        LocalDate fechaRegistro,
        Integer idRutina,
        String rutinaNombre,
        List<SerieRealizadaResponse> series
) {}