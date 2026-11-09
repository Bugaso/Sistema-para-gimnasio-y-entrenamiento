package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.ClienteCoach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteCoachRepository extends JpaRepository<ClienteCoach, Integer> {
    List<ClienteCoach> findByCoachMailUs(String mailUs);

    // AGREGAR ESTA LÍNEA PARA EL CLIENTE:
    List<ClienteCoach> findByClienteMailUs(String mailUs);
}