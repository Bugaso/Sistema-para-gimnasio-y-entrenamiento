package com.gym.atlas.dto.ejercicio;

public record MusculosAsociadosResponse(
        Integer idMuscAsociados, // Agregamos tu nuevo ID
        Integer idGrupoMusc,
        String nombreGrupo,
        Integer idEjercicio,
        String nombreEjercicio,
        String prioridadMusc
) {}