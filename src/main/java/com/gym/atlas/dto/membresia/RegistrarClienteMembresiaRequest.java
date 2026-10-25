package com.gym.atlas.dto.membresia;

public record RegistrarClienteMembresiaRequest(
        Long idClienteMembresia,
        Long idUsuario,
        Long idMembresia,
        Long duracionMembresia
) {}
