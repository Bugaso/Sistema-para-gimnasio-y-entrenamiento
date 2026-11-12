package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.ClienteCoach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteCoachRepository extends JpaRepository<ClienteCoach, Integer> {
    List<ClienteCoach> findByCoachMailUsAndActivoTrue(String mailUs);

    List<ClienteCoach> findByClienteMailUsAndActivoTrue(String mailUs);

    // Se mantiene sin filtro para recuperar el historial incluso de rutinas ya desasignadas
    List<ClienteCoach> findByClienteMailUs(String mailUs);

    List<ClienteCoach> findByActivoTrue();
}