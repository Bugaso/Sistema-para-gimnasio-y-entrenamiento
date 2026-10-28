package com.gym.atlas.service.ejercicio;

import com.gym.atlas.data.ejercicio.GrupoMuscular;
import com.gym.atlas.dto.ejercicio.GrupoMuscularRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.repository.ejercicio.GrupoMuscularRepository;
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
        String nombreLimpio = request.nombreGrupo().trim();

        // 1. Verificamos si ya existe antes de guardar
        if (grupoMuscularRepository.existsByNombreGrupoIgnoreCase(nombreLimpio)) {
            throw new RuntimeException("El grupo muscular '" + nombreLimpio + "' ya existe en el sistema.");
        }

        GrupoMuscular nuevoGrupo = new GrupoMuscular();
        nuevoGrupo.setNombreGrupo(nombreLimpio);
        grupoMuscularRepository.save(nuevoGrupo);
        return new MessageResponse("Grupo muscular creado exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarGrupoMuscular(Integer id, GrupoMuscularRequest request) {
        GrupoMuscular grupo = grupoMuscularRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El grupo muscular especificado no existe."));

        String nuevoNombre = request.nombreGrupo().trim();

        // 2. Si se cambió el nombre, verificamos que el nuevo no esté repetido
        if (!grupo.getNombreGrupo().equalsIgnoreCase(nuevoNombre) &&
                grupoMuscularRepository.existsByNombreGrupoIgnoreCase(nuevoNombre)) {
            throw new RuntimeException("El grupo muscular '" + nuevoNombre + "' ya existe en el sistema.");
        }

        grupo.setNombreGrupo(nuevoNombre);
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