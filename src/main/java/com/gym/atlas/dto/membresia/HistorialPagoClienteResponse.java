package com.gym.atlas.dto.membresia;

public record HistorialPagoClienteResponse(
        Long idCliMem,
        String nombreMembresia,
        int diasAsistencia,
        int cantCuotas,
        String fechaPago,
        String fechaVencimiento,
        String estado,
        Double costoTotal
) {
}
