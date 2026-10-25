package com.gym.atlas.repository.membresia;

import com.gym.atlas.data.membresia.ClienteMembresia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteMembresiaRepository extends JpaRepository<ClienteMembresia, Long> {

    List<ClienteMembresia> findAllByUsuario(Long idUsuario);
}
