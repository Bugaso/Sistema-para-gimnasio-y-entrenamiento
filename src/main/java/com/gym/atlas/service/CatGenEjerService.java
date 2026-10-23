package com.gym.atlas.service;

import com.gym.atlas.data.CatGenEjer;
import com.gym.atlas.dto.CatGenEjerRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.repository.CatGenEjerRepository;
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
        CatGenEjer nuevaCat = new CatGenEjer();
        nuevaCat.setNombreCat(request.nombreCat());
        catGenEjerRepository.save(nuevaCat);
        return new MessageResponse("Categoría creada exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarCategoria(Integer id, CatGenEjerRequest request) {
        CatGenEjer categoria = catGenEjerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La categoría especificada no existe."));

        categoria.setNombreCat(request.nombreCat());
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