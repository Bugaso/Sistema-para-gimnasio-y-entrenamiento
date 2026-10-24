package com.gym.atlas.repository;

import com.gym.atlas.data.GrupoMuscular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrupoMuscularRepository extends JpaRepository<GrupoMuscular, Integer> {

    boolean existsByNombreGrupoIgnoreCase(String nombreGrupo);
}