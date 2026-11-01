package com.gym.atlas.repository.rutina;

import com.gym.atlas.data.rutina.ClienteCoach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteCoachRepository extends JpaRepository<ClienteCoach, Integer> {
}