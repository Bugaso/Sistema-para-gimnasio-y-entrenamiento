package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.MedidaEsfuerzo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedidaEsfuerzoRepository extends JpaRepository<MedidaEsfuerzo, Integer> {
}