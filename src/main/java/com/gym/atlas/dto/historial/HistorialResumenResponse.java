package com.gym.atlas.dto.historial;
import java.time.LocalDate;

public record HistorialResumenResponse(
        Integer idHistRut,
        LocalDate fechaRegistro,
        String rutinaNombre
) {}