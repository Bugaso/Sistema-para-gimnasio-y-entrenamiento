package com.gym.atlas.service.ejercicio;

import com.gym.atlas.data.ejercicio.CatGenEjer;
import com.gym.atlas.dto.ejercicio.CatGenEjerRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.repository.ejercicio.CatGenEjerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatGenEjerService {

    private final CatGenEjerRepository catGenEjerRepository;

    public CatGenEjerService(CatGenEjerRepository catGenEjerRepository) {
        this.catGenEjerRepository = catGenEjerRepository;
    }

    public List<CatGenEjer> obtenerCategorias() {
        return catGenEjerRepository.findAll();
    }

    @Transactional
    public MessageResponse crearCategoria(CatGenEjerRequest request) {
        String nombreLimpio = request.nombreCat().trim();

        // 1. Verificamos si ya existe antes de guardar
        if (catGenEjerRepository.existsByNombreCatIgnoreCase(nombreLimpio)) {
            throw new RuntimeException("La categoría '" + nombreLimpio + "' ya existe en el sistema.");
        }

        CatGenEjer nuevaCat = new CatGenEjer();
        nuevaCat.setNombreCat(nombreLimpio);
        catGenEjerRepository.save(nuevaCat);
        return new MessageResponse("Categoría creada exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarCategoria(Integer id, CatGenEjerRequest request) {
        CatGenEjer categoria = catGenEjerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La categoría especificada no existe."));

        String nuevoNombre = request.nombreCat().trim();

        // 2. Si se cambió el nombre, verificamos que el nuevo no esté repetido
        if (!categoria.getNombreCat().equalsIgnoreCase(nuevoNombre) &&
                catGenEjerRepository.existsByNombreCatIgnoreCase(nuevoNombre)) {
            throw new RuntimeException("La categoría '" + nuevoNombre + "' ya existe en el sistema.");
        }

        categoria.setNombreCat(nuevoNombre);
        catGenEjerRepository.save(categoria);
        return new MessageResponse("Categoría actualizada exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarCategoria(Integer id) {
        if (!catGenEjerRepository.existsById(id)) {
            throw new RuntimeException("La categoría especificada no existe.");
        }
        catGenEjerRepository.deleteById(id);
        return new MessageResponse("Categoría eliminada exitosamente.");
    }
}