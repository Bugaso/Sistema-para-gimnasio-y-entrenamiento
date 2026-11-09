package com.gym.atlas.dto.cliente;

import com.gym.atlas.dto.rutina.DetalleRutinaResponse;
import com.gym.atlas.dto.rutina.RutinaResponse;

import java.time.LocalDate;
import java.util.List;

public record ClienteRutinaResponse(

        RutinaResponse rutina,
        List<DetalleRutinaResponse> detalles
)
{

}
