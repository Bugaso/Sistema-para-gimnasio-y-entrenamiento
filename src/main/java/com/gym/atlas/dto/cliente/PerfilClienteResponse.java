package com.gym.atlas.dto.cliente;

import java.time.LocalDate;

public record PerfilClienteResponse(
        Long idUsuario,
        String nomApe,
        Long dniUs,
        LocalDate fechaNacimiento,
        Long telUs,
        String mailUs,
        Long contacoE
) {}