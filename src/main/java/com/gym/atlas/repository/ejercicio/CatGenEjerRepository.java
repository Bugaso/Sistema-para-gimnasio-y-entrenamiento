package com.gym.atlas.repository.ejercicio;

import com.gym.atlas.data.ejercicio.CatGenEjer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatGenEjerRepository extends JpaRepository<CatGenEjer, Integer> {
    boolean existsByNombreCatIgnoreCase(String nombreCat);
}