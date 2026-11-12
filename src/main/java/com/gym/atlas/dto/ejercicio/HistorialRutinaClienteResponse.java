package com.gym.atlas.dto.ejercicio;

import java.time.LocalDate;
import java.util.List;

public record HistorialRutinaClienteResponse(
        Integer idHistRut,
        Integer idCliCou,
        Integer idRutina,
        String nomRutina,
        String nomCoach,
        LocalDate fechaRegistro,
        List<HistorialEjercicioClienteResponse> ejercicios

) {
}
