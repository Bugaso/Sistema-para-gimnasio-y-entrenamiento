package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.HistorialSerie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialSerieRepository extends JpaRepository<HistorialSerie, Integer> {

    // Aquí a futuro puedes agregar métodos como:
    // List<HistorialSerie> findByHistorialRutinaIdHistRut(Integer idHistRut);
}