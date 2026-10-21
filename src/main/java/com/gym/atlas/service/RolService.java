package com.gym.atlas.service;

import com.gym.atlas.data.Rol;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.RolRequest;
import com.gym.atlas.repository.RolRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public MessageResponse crearRol(RolRequest request) {
        Rol nuevoRol = new Rol();
        nuevoRol.setNomCatUs(request.nomCatUs());
        nuevoRol.setTipoPermiso(request.tipoPermiso());
        rolRepository.save(nuevoRol);
        return new MessageResponse("Rol creado exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarRol(Long id, RolRequest request) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El rol especificado no existe."));

        rol.setNomCatUs(request.nomCatUs());
        rol.setTipoPermiso(request.tipoPermiso());
        rolRepository.save(rol);

        return new MessageResponse("Rol actualizado exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarRol(Long id) {
        if (!rolRepository.existsById(id)) {
            throw new RuntimeException("El rol especificado no existe.");
        }
        rolRepository.deleteById(id);
        return new MessageResponse("Rol eliminado exitosamente.");
    }
}
