package com.gym.atlas.repository.ejercicio;

import com.gym.atlas.data.ejercicio.Equipamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipamientoRepository extends JpaRepository<Equipamiento, Integer> {

    boolean existsByNomEquipamientoIgnoreCase(String nomEquipamiento);
}