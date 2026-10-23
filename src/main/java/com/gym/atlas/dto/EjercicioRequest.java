package com.gym.atlas.dto;

public record EjercicioRequest(
        Integer idCatGen,
        Integer idEquip,
        String nomEjercicio,
        String descEjercicio,
        String dirImgEjercicio
) {}