package com.gym.atlas.repository;

import com.gym.atlas.data.Equipamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipamientoRepository extends JpaRepository<Equipamiento, Integer> {
}