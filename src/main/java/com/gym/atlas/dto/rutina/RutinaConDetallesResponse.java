package com.gym.atlas.dto.rutina;

import java.time.LocalDate;
import java.util.List;

public record RutinaConDetallesResponse(
        Integer idRutina,
        String nombreRutina,
        String descripcion,
        Boolean esPlantilla,
        LocalDate fechaCreacion,
        List<DetalleRutinaResponse> detalles
) {}