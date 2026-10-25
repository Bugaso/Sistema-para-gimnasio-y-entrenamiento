package com.gym.atlas.dto.personal;


import java.time.LocalDate;
import java.util.List;

public record EmpleadoRequest(
        String nomApe,
        LocalDate fechaNacimiento,
        String dniUs,
        String telUs,
        String mailUs,
        String contacoE,
        String password,
        List<Integer> rolesIds
) {}