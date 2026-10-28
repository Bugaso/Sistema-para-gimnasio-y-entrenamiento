package com.gym.atlas.dto.membresia;

public record RegistrarTipoMembresiaRequest(

        Long idMembresia,
        Long idTipoMem,
        int duracionDiaMes,
        int diasAsistencia,
        boolean planificacion,
        Double costoMembresia
) {
}
