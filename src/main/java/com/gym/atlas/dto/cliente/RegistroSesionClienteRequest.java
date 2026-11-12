package com.gym.atlas.dto.cliente;

import java.time.LocalDate;
import java.util.List;

public record RegistroSesionClienteRequest(
        Integer idCliCou,
        LocalDate fechaRegistro,
        List<RegistroSerieClienteRequest> series
) {}
