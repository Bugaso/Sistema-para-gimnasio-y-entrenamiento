package com.gym.atlas.dto;

public record RegistrarClienteMembresiaRequest(
        Long idClienteMembresia,
        Long idUsuario,
        Long idMembresia,
        Long duracionMembresia
) {}
