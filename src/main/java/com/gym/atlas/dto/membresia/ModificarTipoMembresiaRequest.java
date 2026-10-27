package com.gym.atlas.dto.membresia;

public record ModificarTipoMembresiaRequest(
        Long idTipoMem,
        int duracionDiaMes,
        int diasAsistencia,
        boolean planificacion,
        Double costoMembresia
) {
}
