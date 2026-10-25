package com.gym.atlas.repository.finanzas;

import com.gym.atlas.data.finanzas.CategoriaGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CategoriaGastoRepository extends JpaRepository<CategoriaGasto, Integer> {

    boolean existsByNombreCatGastoIgnoreCase(String nombreCatGasto);
}