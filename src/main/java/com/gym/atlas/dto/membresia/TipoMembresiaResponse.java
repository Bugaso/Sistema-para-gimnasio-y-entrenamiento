package com.gym.atlas.dto.membresia;

public record TipoMembresiaResponse(
        Long idTipoMem,
        int duracionMembresia,
        int diasAsistencia,
        boolean planificacion,
        double costoMembresia,
        boolean estado
) {
}
