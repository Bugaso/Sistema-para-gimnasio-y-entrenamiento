package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.DetalleRutina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleRutinaRepository extends JpaRepository<DetalleRutina, Integer> {
}