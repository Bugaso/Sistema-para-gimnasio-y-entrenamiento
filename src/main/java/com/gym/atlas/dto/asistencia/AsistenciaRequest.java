package com.gym.atlas.dto.asistencia;

public record AsistenciaRequest(
        Integer idUsuario,
        Long idClienteMembresia
) {}