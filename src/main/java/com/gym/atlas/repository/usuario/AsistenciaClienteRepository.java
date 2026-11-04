package com.gym.atlas.repository.usuario;

import com.gym.atlas.data.usuario.AsistenciaCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AsistenciaClienteRepository extends JpaRepository<AsistenciaCliente, Integer> {
    // Busca si el cliente tiene una entrada abierta (sin salida registrada aún)
    Optional<AsistenciaCliente> findFirstByClienteIdUsuarioAndFechaHorarioSalidaIsNullOrderByFechaHorarioEntradaDesc(Integer idUsuario);
}