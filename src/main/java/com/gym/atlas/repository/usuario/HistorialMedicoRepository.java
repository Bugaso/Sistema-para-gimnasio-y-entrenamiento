package com.gym.atlas.repository.usuario;

import com.gym.atlas.data.usuario.HistorialMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistorialMedicoRepository extends JpaRepository<HistorialMedico, Integer> {
    // Permite buscar el historial por el DNI del cliente, cumpliendo el requerimiento
    List<HistorialMedico> findByUsuario_DniUsContaining(String dniUs);
}