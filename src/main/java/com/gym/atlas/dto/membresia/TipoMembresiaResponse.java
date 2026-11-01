package com.gym.atlas.dto.membresia;

public record TipoMembresiaResponse(

        Long idTipoMem,
        String descripcionMembresia,
        int duracionMembresia,
        int diasAsistencia,
        boolean planificacion,
        double costoMembresia,
        boolean estado
) {
}
