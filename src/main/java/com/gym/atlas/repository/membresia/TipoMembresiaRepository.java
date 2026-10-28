package com.gym.atlas.repository.membresia;

import com.gym.atlas.data.membresia.TipoMembresia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoMembresiaRepository extends JpaRepository<TipoMembresia,Long> {

    List<TipoMembresia> findAllByMembresia_IdMembresia(Long membresiaIdMembresia);
}
