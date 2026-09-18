package com.gym.atlas.dto;

public record RegistrarMembresiaRequest(
        Long idUsuario,
        String descripMembresia,
        Long costoMembresia,
        Long duracionMembresia
) {
}
