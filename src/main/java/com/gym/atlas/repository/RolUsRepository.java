package com.gym.atlas.repository;

import com.gym.atlas.data.RolUs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RolUsRepository extends JpaRepository<RolUs,Long> {

    // Opción 1: Convención de nombres (Automágica)
    // Spring leerá: "Encuentra un RolUs por la IdRol de la entidad Rol Y la IdUsuario de la entidad Usuario"
    Optional<RolUs> findByRol_IdRolAndUsuario_IdUsuario(Long idRol, Long idUsuario);

    // Opción 2: Usando JPQL (Más explícito y fácil de leer si las relaciones se complican)
    @Query("SELECT ru FROM RolUs ru WHERE ru.rol.idRol = :idRol AND ru.usuario.idUsuario = :idUsuario")
    Optional<RolUs> buscarPorRolYUsuario(@Param("idRol") Long idRol, @Param("idUsuario") Long idUsuario);

}
