package com.gym.atlas.dto.membresia;

import java.util.List;

public record MembresiaResponse(
        Long idMembresia,
        String descripMembresia,
        String estado,
        List<TipoMembresiaResponse> tipos
) {
}
