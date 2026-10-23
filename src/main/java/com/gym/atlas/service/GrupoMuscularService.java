package com.gym.atlas.service;

import com.gym.atlas.data.GrupoMuscular;
import com.gym.atlas.dto.GrupoMuscularRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.repository.GrupoMuscularRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GrupoMuscularService {

    private final GrupoMuscularRepository grupoMuscularRepository;

    public GrupoMuscularService(GrupoMuscularRepository grupoMuscularRepository) {
        this.grupoMuscularRepository = grupoMuscularRepository;
    }

    public List<GrupoMuscular> obtenerGruposMusculares() {
        return grupoMuscularRepository.findAll();
    }

    @Transactional
    public MessageResponse crearGrupoMuscular(GrupoMuscularRequest request) {
        GrupoMuscular nuevoGrupo = new GrupoMuscular();
        nuevoGrupo.setNombreGrupo(request.nombreGrupo());
        grupoMuscularRepository.save(nuevoGrupo);
        return new MessageResponse("Grupo muscular creado exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarGrupoMuscular(Integer id, GrupoMuscularRequest request) {
        GrupoMuscular grupo = grupoMuscularRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El grupo muscular especificado no existe."));

        grupo.setNombreGrupo(request.nombreGrupo());
        grupoMuscularRepository.save(grupo);
        return new MessageResponse("Grupo muscular actualizado exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarGrupoMuscular(Integer id) {
        if (!grupoMuscularRepository.existsById(id)) {
            throw new RuntimeException("El grupo muscular especificado no existe.");
        }
        grupoMuscularRepository.deleteById(id);
        return new MessageResponse("Grupo muscular eliminado exitosamente.");
    }
}