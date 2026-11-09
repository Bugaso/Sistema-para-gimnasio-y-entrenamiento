package com.gym.atlas.dto.asistencia;

import java.time.LocalDateTime;

public record AsistenciaHistorialResponse(
        Integer idAsistencia,
        String nombreCompleto,
        Long dni,
        String modalidad, // Ej: "Fuerza", "Hipertrofia" o "Sin Membresía"
        LocalDateTime fechaHoraEntrada,
        LocalDateTime fechaHoraSalida,
        boolean ingresoSinMembresia, // true si idCliMem es null
        boolean esAsistenciaExtra // true si excedió el límite semanal en ese momento
) {}
