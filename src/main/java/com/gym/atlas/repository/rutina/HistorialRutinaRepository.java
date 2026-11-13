package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.HistorialRutina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistorialRutinaRepository extends JpaRepository<HistorialRutina, Integer> {

    // Aquí a futuro puedes agregar métodos como:
    // List<HistorialRutina> findByAsignacionIdCliCou(Integer idCliCou);

    // Busca todas las sesiones de una asignación específica, ordenadas por fecha (más reciente primero)
    List<HistorialRutina> findByAsignacionIdCliCouOrderByFechaRegistroDesc(Integer idCliCou);

    Optional<HistorialRutina> findByAsignacionIdCliCouAndFechaRegistro(Integer asignacionIdCliCou, LocalDate fechaRegistro);
}