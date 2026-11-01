package com.gym.atlas.repository.membresia;

import com.gym.atlas.data.membresia.ClienteMembresia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClienteMembresiaRepository extends JpaRepository<ClienteMembresia, Long> {

    List<ClienteMembresia> findAllByUsuario(Long idUsuario);

    // Retorna true si el cliente tiene una membresía activa donde el TipoMembresia tiene planificacion = true (1)
    // Retorna true si el cliente tiene una membresía asignada cuyo tipo incluye planificación
    @Query("SELECT CASE WHEN COUNT(cm) > 0 THEN true ELSE false END FROM ClienteMembresia cm " +
            "JOIN cm.idTipoMembresia tm " +
            "WHERE cm.usuario.idUsuario = :idCliente AND tm.planificacion = true")
    boolean tieneMembresiaConPlanificacion(@Param("idCliente") Long idCliente);
}
