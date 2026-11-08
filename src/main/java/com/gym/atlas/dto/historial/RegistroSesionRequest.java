package com.gym.atlas.dto.historial;
import java.time.LocalDate;
import java.util.List;

public record RegistroSesionRequest(
        Integer idCliCou,     // ID de la asignación Cliente-Coach
        Integer idRutina,     // ID de la rutina planificada
        LocalDate fechaRegistro,
        List<SerieRealizadaRequest> series
) {}