package com.gym.atlas.dto;

public record RolUsResponse(

        Long idRolUs,        // PK de la tabla intermedia
        Long idUsuario,      // FK del usuario vinculado
        Long idRol,          // FK del rol
        String nomCatUs,     // Nombre de la categoría (ej. "ADMIN") extraído de la entidad Rol
        String tipoPermiso,  // Permisos extraídos de la entidad Rol
        String estado        // Estado del vínculo ("Activo", "Inactivo") de la tabla RolUs

) {
}
