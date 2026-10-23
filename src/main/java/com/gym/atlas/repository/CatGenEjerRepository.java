package com.gym.atlas.repository;

import com.gym.atlas.data.CatGenEjer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatGenEjerRepository extends JpaRepository<CatGenEjer, Integer> {
}