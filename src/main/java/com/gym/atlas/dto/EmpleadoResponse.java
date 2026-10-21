package com.gym.atlas.dto;

import java.time.LocalDate;

public record EmpleadoResponse(
        Integer idUsuario,
        String nomApe,
        LocalDate fechaNacimiento,
        String dniUs,
        String telUs,
        String mailUs,
        String contacoE,
        Integer idRol
) {}