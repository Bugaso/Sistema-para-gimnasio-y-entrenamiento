package com.gym.atlas.dto.membresia;

import java.time.LocalDateTime;
import java.util.Date;

public record RegistrarClienteMembresiaRequest(
        Long idClienteMembresia,
        Long idUsuario,
        Long idTipoMembresia,
        int cantCuotas,
        Double costoTotal,
        Double cantEfect,
        String tipoPago,

        LocalDateTime fechaPago
) {}
