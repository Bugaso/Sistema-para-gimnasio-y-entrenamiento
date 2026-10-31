package com.gym.atlas.repository.rutina;


import com.gym.atlas.data.rutina.Rutina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RutinaRepository extends JpaRepository<Rutina, Integer> {
    List<Rutina> findByEsPlantillaTrue();
}