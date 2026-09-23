package com.gym.atlas.dto;

public record RegistrarMembresiaRequest(
        Long idMembresia,
        String descripMembresia,
        Long costoMembresia,
        Long duracionMembresia,
        int diasMembresia
) {
}
