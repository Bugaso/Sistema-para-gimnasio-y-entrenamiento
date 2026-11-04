package com.gym.atlas.dto.rutina;

import java.time.LocalDate;

public record AsignacionResponse(
        Integer idCliCou,
        String clienteNombre,
        Long clienteDni,
        Integer idRutina,
        String rutinaNombre,
        LocalDate fechaPlan,
        String duracionPlan
) {}