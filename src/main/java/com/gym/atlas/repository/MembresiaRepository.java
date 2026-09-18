package com.gym.atlas.repository;

import com.gym.atlas.data.Membresia;
import com.gym.atlas.data.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MembresiaRepository extends JpaRepository<Membresia, Long> {

}
