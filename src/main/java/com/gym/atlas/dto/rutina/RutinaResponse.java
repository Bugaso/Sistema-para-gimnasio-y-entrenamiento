package com.gym.atlas.dto.rutina;

import java.time.LocalDate;

public record RutinaResponse(
        Integer idRutina,
        String nombreRutina,
        String descripcion,
        Boolean esPlantilla,
        LocalDate fechaCreacion
) {}