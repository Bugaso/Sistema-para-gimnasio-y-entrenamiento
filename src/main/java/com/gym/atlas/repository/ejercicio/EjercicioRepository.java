package com.gym.atlas.repository.ejercicio;

import com.gym.atlas.data.ejercicio.Ejercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EjercicioRepository extends JpaRepository<Ejercicio, Integer> {

    Optional<Ejercicio> findByNomEjercicio(String nomEjercicio);
}