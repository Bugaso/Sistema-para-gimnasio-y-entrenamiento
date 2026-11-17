package com.gym.atlas.repository.ejercicio;

import com.gym.atlas.data.ejercicio.MusculosAsociados;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MusculosAsociadosRepository extends JpaRepository<MusculosAsociados, Integer> {
    boolean existsByGrupoMuscular_IdGrupoMusc(Integer grupoMuscularIdGrupoMusc);
}