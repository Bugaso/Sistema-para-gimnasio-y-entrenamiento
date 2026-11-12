package com.gym.atlas.dto.cliente;

import java.time.LocalDate;
public record PerfilClienteRequest(
        String nomApe,
        LocalDate fechaNacimiento,
        String telUs,
        String mailUs,
        String contacoE
) {}