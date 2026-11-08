package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.HistorialSerie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface HistorialSerieRepository extends JpaRepository<HistorialSerie, Integer> {
    List<HistorialSerie> findByHistorialRutinaIdHistRut(Integer idHistRut);

    @Modifying
    @Transactional
    void deleteByHistorialRutinaIdHistRut(Integer idHistRut);
}