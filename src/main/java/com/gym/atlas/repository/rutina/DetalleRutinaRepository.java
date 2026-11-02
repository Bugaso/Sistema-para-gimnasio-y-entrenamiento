package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.DetalleRutina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DetalleRutinaRepository extends JpaRepository<DetalleRutina, Integer> {

    List<DetalleRutina> findByRutinaIdRutina(Integer idRutina);

    @Modifying
    @Transactional
    void deleteByRutinaIdRutina(Integer idRutina);
}