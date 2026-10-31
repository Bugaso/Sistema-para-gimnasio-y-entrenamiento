package com.gym.atlas.dto.rutina;


import java.util.List;

public record RutinaCompletaRequest(
        String nombreRutina,
        String descripcion,
        Boolean esPlantilla, // Si el coach la guarda como plantilla o para un cliente
        Integer idUsCoach,
        List<DetalleRutinaRequest> detalles
) {}