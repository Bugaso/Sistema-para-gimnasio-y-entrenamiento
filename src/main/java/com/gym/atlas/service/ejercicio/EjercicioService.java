package com.gym.atlas.service.ejercicio;

import com.gym.atlas.data.ejercicio.CatGenEjer;
import com.gym.atlas.data.ejercicio.Ejercicio;
import com.gym.atlas.data.ejercicio.Equipamiento;
import com.gym.atlas.dto.ejercicio.EjercicioRequest;
import com.gym.atlas.dto.ejercicio.EjercicioResponse;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.repository.ejercicio.CatGenEjerRepository;
import com.gym.atlas.repository.ejercicio.EjercicioRepository;
import com.gym.atlas.repository.ejercicio.EquipamientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EjercicioService {

    private final EjercicioRepository ejercicioRepository;
    private final CatGenEjerRepository catGenEjerRepository;
    private final EquipamientoRepository equipamientoRepository;

    public EjercicioService(EjercicioRepository ejercicioRepository,
                            CatGenEjerRepository catGenEjerRepository,
                            EquipamientoRepository equipamientoRepository) {
        this.ejercicioRepository = ejercicioRepository;
        this.catGenEjerRepository = catGenEjerRepository;
        this.equipamientoRepository = equipamientoRepository;
    }

    public List<EjercicioResponse> obtenerEjercicios() {
        return ejercicioRepository.findAll().stream().map(ej -> new EjercicioResponse(
                ej.getIdEjercicio(),
                ej.getCategoria() != null ? ej.getCategoria().getIdCategoriaGen() : null,
                ej.getCategoria() != null ? ej.getCategoria().getNombreCat() : "Sin Categoría",
                ej.getEquipamiento() != null ? ej.getEquipamiento().getIdEquipamiento() : null,
                ej.getEquipamiento() != null ? ej.getEquipamiento().getNomEquipamiento() : "Sin Equipamiento",
                ej.getNomEjercicio(),
                ej.getDescEjercicio(),
                ej.getDirImgEjercicio()
        )).toList();
    }

    @Transactional
    public MessageResponse crearEjercicio(EjercicioRequest request) {
        Ejercicio ej = new Ejercicio();
        mapearDatos(ej, request);
        ejercicioRepository.save(ej);
        return new MessageResponse("Ejercicio creado exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarEjercicio(Integer id, EjercicioRequest request) {
        Ejercicio ej = ejercicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El ejercicio especificado no existe."));
        mapearDatos(ej, request);
        ejercicioRepository.save(ej);
        return new MessageResponse("Ejercicio actualizado exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarEjercicio(Integer id) {
        if (!ejercicioRepository.existsById(id)) {
            throw new RuntimeException("El ejercicio especificado no existe.");
        }
        ejercicioRepository.deleteById(id);
        return new MessageResponse("Ejercicio eliminado exitosamente.");
    }

    // Método auxiliar para no repetir código
    private void mapearDatos(Ejercicio ej, EjercicioRequest request) {
        ej.setNomEjercicio(request.nomEjercicio());
        ej.setDescEjercicio(request.descEjercicio());
        ej.setDirImgEjercicio(request.dirImgEjercicio());

        if (request.idCatGen() != null) {
            CatGenEjer cat = catGenEjerRepository.findById(request.idCatGen())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada."));
            ej.setCategoria(cat);
        }

        if (request.idEquip() != null) {
            Equipamiento eq = equipamientoRepository.findById(request.idEquip())
                    .orElseThrow(() -> new RuntimeException("Equipamiento no encontrado."));
            ej.setEquipamiento(eq);
        }
    }
}