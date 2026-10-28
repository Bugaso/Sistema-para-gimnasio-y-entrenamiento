package com.gym.atlas.dto.membresia;

import java.time.LocalDateTime;
import java.util.Date;

public record RegistrarClienteMembresiaRequest(
        Long idClienteMembresia,
        Long idUsuario,
        Long idMembresia,
        int cantCuotas,
        Double costoTotal,
        String tipoPago,
        LocalDateTime fechaPago
) {}
