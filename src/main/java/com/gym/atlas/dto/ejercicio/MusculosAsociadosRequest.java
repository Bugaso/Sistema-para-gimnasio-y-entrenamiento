package com.gym.atlas.dto.ejercicio;

public record MusculosAsociadosRequest(
        Integer idGrupoMusc,
        Integer idEjercicio,
        String prioridadMusc
) {}