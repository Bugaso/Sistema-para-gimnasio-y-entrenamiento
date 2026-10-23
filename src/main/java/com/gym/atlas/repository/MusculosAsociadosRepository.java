package com.gym.atlas.repository;

import com.gym.atlas.data.MusculosAsociados;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MusculosAsociadosRepository extends JpaRepository<MusculosAsociados, Integer> {
}