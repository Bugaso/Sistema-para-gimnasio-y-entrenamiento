package com.gym.atlas.dto.rutina;

import java.time.LocalDate;

public record AsignacionResponse(
        Integer idCliCou,
        String clienteNombre,
        Long clienteDni,
        Integer idRutina,
        String rutinaNombre,
        LocalDate fechaPlan,
        String duracionPlan,
        Boolean estado
) {
    public AsignacionResponse(
            Integer idCliCou,
            String clienteNombre,
            Long clienteDni,
            Integer idRutina,
            String rutinaNombre,
            LocalDate fechaPlan,
            String duracionPlan
    ) {
        this(idCliCou, clienteNombre, clienteDni, idRutina, rutinaNombre, fechaPlan, duracionPlan, true);
    }
}