package com.gym.atlas.dto.ejercicio;

public record EjercicioRequest(
        Integer idCatGen,
        Integer idEquip,
        String nomEjercicio,
        String descEjercicio,
        String dirImgEjercicio
) {}