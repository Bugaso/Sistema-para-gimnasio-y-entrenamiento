package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.HistorialRutina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialRutinaRepository extends JpaRepository<HistorialRutina, Integer> {

    // Aquí a futuro puedes agregar métodos como:
    // List<HistorialRutina> findByAsignacionIdCliCou(Integer idCliCou);
}