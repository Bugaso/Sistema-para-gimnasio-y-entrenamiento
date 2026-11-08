package com.gym.atlas.dto.usuario;

public record EstadoAsistenciaResponse(
        boolean adentro, // true si ya marcó entrada pero no salida
        String mensaje
) {}