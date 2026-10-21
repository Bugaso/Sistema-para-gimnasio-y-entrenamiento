package com.gym.atlas.dto;


import java.time.LocalDate;

public record EmpleadoRequest(
        String nomApe,
        LocalDate fechaNacimiento,
        String dniUs,
        String telUs,
        String mailUs,
        String contacoE,
        String password,
        Integer idRol // Recibimos el ID del Rol (Ej: 2 para Coach, 3 para Recepcionista)
) {}