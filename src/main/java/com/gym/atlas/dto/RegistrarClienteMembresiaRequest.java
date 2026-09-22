package com.gym.atlas.dto;

public record RegistrarClienteMembresiaRequest(
        Long idUsuario,
        Long idMembresia,
        Long duracionMembresia
) {}
