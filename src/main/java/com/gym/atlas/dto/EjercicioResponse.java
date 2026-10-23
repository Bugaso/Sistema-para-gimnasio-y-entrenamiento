package com.gym.atlas.dto;

// Este Response incluye los nombres para mostrarlos fácil en la tabla frontend
public record EjercicioResponse(
        Integer idEjercicio,
        Integer idCatGen,
        String nombreCategoria,
        Integer idEquip,
        String nombreEquipamiento,
        String nomEjercicio,
        String descEjercicio,
        String dirImgEjercicio
) {}