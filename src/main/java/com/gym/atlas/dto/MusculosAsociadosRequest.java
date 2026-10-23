package com.gym.atlas.dto;

public record MusculosAsociadosRequest(
        Integer idGrupoMusc,
        Integer idEjercicio,
        String prioridadMusc
) {}