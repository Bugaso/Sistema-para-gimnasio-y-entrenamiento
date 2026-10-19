package com.gym.atlas.repository;


import com.gym.atlas.data.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByMailUs(String mailUs);

    // 1. Buscar usuario por DNI exacto
    Optional<Usuario> findByDniUs(String dniUs);

    // 2. Buscar por DNI parcial
    List<Usuario> findByDniUsContaining(String dniUs);

    // 3. Consulta personalizada por DNI o Nombre/Apellido
    @Query("SELECT u FROM Usuario u WHERE CAST(u.dniUs AS string) LIKE CONCAT('%', :criterio, '%') " +
            "OR LOWER(u.nomApe) LIKE LOWER(CONCAT('%', :criterio, '%'))")
    List<Usuario> buscarPorDniONombre(@Param("criterio") String criterio);


    // Opción 1: Obtener usuarios por el NOMBRE de la categoría del rol (nomCatUs)
    // Hace un JOIN desde Usuario -> RolUs (rolesUsuario) -> Rol
    @Query("SELECT u FROM Usuario u JOIN u.rolesUsuario ru JOIN ru.rol r WHERE r.nomCatUs = :nombreRol")
    List<Usuario> findByNombreRol(@Param("nombreRol") String nombreRol);
}
