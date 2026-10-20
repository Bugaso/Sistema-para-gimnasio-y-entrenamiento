package com.gym.atlas.service;

import com.gym.atlas.data.Rol;
import com.gym.atlas.repository.RolRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RolService {

    private final RolRepository rolRepository;


    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public List<Rol>obtenerRoles(){
        return rolRepository.findAll();
    }
}
