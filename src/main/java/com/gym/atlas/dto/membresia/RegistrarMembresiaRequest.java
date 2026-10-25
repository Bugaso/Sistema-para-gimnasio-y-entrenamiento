package com.gym.atlas.dto.membresia;

public record RegistrarMembresiaRequest(
        Long idMembresia,
        String descripMembresia,
        Long costoMembresia,
        Long duracionMembresia,
        int diasMembresia
) {
}
