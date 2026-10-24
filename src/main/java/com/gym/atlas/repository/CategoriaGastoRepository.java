package com.gym.atlas.repository;

import com.gym.atlas.data.CategoriaGasto;
import com.gym.atlas.data.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CategoriaGastoRepository extends JpaRepository<CategoriaGasto, Integer> {

    boolean existsByNombreCatGastoIgnoreCase(String nombreCatGasto);
}