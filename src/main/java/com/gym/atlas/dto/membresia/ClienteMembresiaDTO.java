package com.gym.atlas.dto.membresia;

import com.gym.atlas.data.usuario.Usuario;

public record ClienteMembresiaDTO(

        Long idCliMem,
        Usuario usuario,
        Long idTipoMembresia,
        String nombreMembresia,
        int diasAsistencia,
        int cantCuotas,
        String fechaPago,
        String estado,
        Double cantEfect,
        Double costoTotal
) {
}
