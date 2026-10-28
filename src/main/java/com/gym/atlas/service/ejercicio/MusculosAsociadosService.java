package com.gym.atlas.service.ejercicio;

import com.gym.atlas.data.ejercicio.Ejercicio;
import com.gym.atlas.data.ejercicio.GrupoMuscular;
import com.gym.atlas.data.ejercicio.MusculosAsociados;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.ejercicio.MusculosAsociadosRequest;
import com.gym.atlas.dto.ejercicio.MusculosAsociadosResponse;
import com.gym.atlas.repository.ejercicio.EjercicioRepository;
import com.gym.atlas.repository.ejercicio.GrupoMuscularRepository;
import com.gym.atlas.repository.ejercicio.MusculosAsociadosRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MusculosAsociadosService {

    private final MusculosAsociadosRepository musculosAsociadosRepository;
    private final GrupoMuscularRepository grupoMuscularRepository;
    private final EjercicioRepository ejercicioRepository;

    public MusculosAsociadosService(MusculosAsociadosRepository musculosAsociadosRepository,
                                    GrupoMuscularRepository grupoMuscularRepository,
                                    EjercicioRepository ejercicioRepository) {
        this.musculosAsociadosRepository = musculosAsociadosRepository;
        this.grupoMuscularRepository = grupoMuscularRepository;
        this.ejercicioRepository = ejercicioRepository;
    }

    public List<MusculosAsociadosResponse> obtenerRelaciones() {
        return musculosAsociadosRepository.findAll().stream().map(ma -> new MusculosAsociadosResponse(
                ma.getIdMuscAsociados(),
                ma.getGrupoMuscular().getIdGrupoMusc(),
                ma.getGrupoMuscular().getNombreGrupo(),
                ma.getEjercicio().getIdEjercicio(),
                ma.getEjercicio().getNomEjercicio(),
                ma.getPrioridadMusc()
        )).toList();
    }

    @Transactional
    public MessageResponse crearRelacion(MusculosAsociadosRequest request) {
        try {
            MusculosAsociados ma = new MusculosAsociados();
            GrupoMuscular gm = grupoMuscularRepository.findById(request.idGrupoMusc())
                    .orElseThrow(() -> new RuntimeException("Grupo muscular no encontrado."));
            Ejercicio ej = ejercicioRepository.findById(request.idEjercicio())
                    .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado."));

            ma.setGrupoMuscular(gm);
            ma.setEjercicio(ej);
            ma.setPrioridadMusc(request.prioridadMusc());

            musculosAsociadosRepository.save(ma);
            return new MessageResponse("Relación creada exitosamente.");
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Esta relación entre ejercicio y músculo ya existe en el sistema.");
        }
    }

    @Transactional
    public MessageResponse actualizarRelacion(Integer id, MusculosAsociadosRequest request) {
        MusculosAsociados ma = musculosAsociadosRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La relación especificada no existe."));

        // Solo permitimos editar la prioridad. Cambiar el músculo/ejercicio requeriría eliminar y crear de nuevo.
        ma.setPrioridadMusc(request.prioridadMusc());
        musculosAsociadosRepository.save(ma);
        return new MessageResponse("Prioridad actualizada exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarRelacion(Integer id) {
        if (!musculosAsociadosRepository.existsById(id)) {
            throw new RuntimeException("La relación especificada no existe.");
        }
        musculosAsociadosRepository.deleteById(id);
        return new MessageResponse("Relación eliminada exitosamente.");
    }
}