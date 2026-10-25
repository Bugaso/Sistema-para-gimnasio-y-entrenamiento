package com.gym.atlas.repository.usuario;

import com.gym.atlas.data.usuario.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Long> {


    Rol findBynomCatUs(String s);
}
