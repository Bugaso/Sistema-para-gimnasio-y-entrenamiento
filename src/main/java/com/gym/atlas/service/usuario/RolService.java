package com.gym.atlas.service.usuario;

import com.gym.atlas.data.Rol;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.rol.RolRequest;
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

        return rolRepository.findAll().stream().filter(rol -> {
            return rol.getEstado();
        }).toList();
    }

    @Transactional
    public MessageResponse crearRol(RolRequest request) {
        Rol nuevoRol = rolRepository.findBynomCatUs(request.nomCatUs());

        if(nuevoRol == null){
            nuevoRol = new Rol();
            nuevoRol.setNomCatUs(request.nomCatUs());
            //nuevoRol.setTipoPermiso("1");
            nuevoRol.setEstado(true);
            rolRepository.save(nuevoRol);
            return new MessageResponse("Rol creado exitosamente.");
        }

        rolRepository.findById(nuevoRol.getIdRol()).get().setEstado(true);
        return new MessageResponse("Rol dado de alta exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarRol(Long id, RolRequest request) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El rol especificado no existe."));

        rol.setNomCatUs(request.nomCatUs());
        //rol.setTipoPermiso(request.tipoPermiso());
        rolRepository.save(rol);

        return new MessageResponse("Rol actualizado exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarRol(Long id) {
        if (!rolRepository.existsById(id)) {
            throw new RuntimeException("El rol especificado no existe.");
        }

        rolRepository.findById(id).get().setEstado(false);
        return new MessageResponse("Rol eliminado exitosamente.");
    }
}
