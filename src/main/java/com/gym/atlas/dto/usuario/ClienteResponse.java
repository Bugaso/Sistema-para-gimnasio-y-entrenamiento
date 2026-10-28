package com.gym.atlas.dto.usuario;

public record ClienteResponse(
        Long idUsuario,
        Long dniUs,
        String nomApe
) {}