package com.gym.atlas.dto.rutina;

import java.time.LocalDate;

public record AsignacionRutinaRequest(
        Integer idUsuario, // Cliente
        Integer idUsCoach, // Coach
        Integer idRutina,  // La plantilla o rutina base
        LocalDate fechaPlan,
        String duracionPlan
) {}