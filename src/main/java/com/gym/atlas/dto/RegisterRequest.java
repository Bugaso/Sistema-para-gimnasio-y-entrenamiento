package com.gym.atlas.dto;

import java.sql.Date;

public record RegisterRequest(
        Long idUsuario,
        String nomApe,
        Date fechaNacimiento,
        Long dniUs,
        String mailUs,
        Long telUs,
        Long numContacto,
        String password,
        Long idRol
) {}