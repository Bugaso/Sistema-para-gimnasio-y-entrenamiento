package com.gym.atlas.dto;

import java.time.LocalDate;
import java.util.List;

public record EmpleadoResponse(
        Integer idUsuario,
        String nomApe,
        LocalDate fechaNacimiento,
        String dniUs,
        String telUs,
        String mailUs,
        String contacoE,
        List<Integer> rolesIds // Devuelve la lista de roles asignados
) {}