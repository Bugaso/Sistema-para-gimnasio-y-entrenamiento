package com.gym.atlas.dto.asistencia;

public record ValidacionAsistenciaResponse(
        boolean limiteExcedido,
        String nombreMembresia,
        int diasPermitidos,
        int asistenciasActuales,
        String ultimoIngreso,
        int asistenciasExtra // Cantidad de asistencias fuera de la formalidad
) {

}
