package com.gym.atlas.service.finanzas;

import com.gym.atlas.data.CategoriaGasto;
import com.gym.atlas.dto.finanzas.CategoriaGastoRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.repository.CategoriaGastoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaGastoService {

    private final CategoriaGastoRepository categoriaGastoRepository;

    public CategoriaGastoService(CategoriaGastoRepository categoriaGastoRepository) {
        this.categoriaGastoRepository = categoriaGastoRepository;
    }

    public List<CategoriaGasto> obtenerCategorias() {
        return categoriaGastoRepository.findAll();
    }

    @Transactional
    public MessageResponse crearCategoria(CategoriaGastoRequest request){

        String nombreLimpio = request.nombreCatGasto().trim();

        // 1. Verificamos si ya existe antes de guardar
        if (categoriaGastoRepository.existsByNombreCatGastoIgnoreCase(nombreLimpio)) {
            throw new RuntimeException("La categoría '" + nombreLimpio + "' ya existe en el sistema.");
        }

        CategoriaGasto nuevaCat = new CategoriaGasto();
        nuevaCat.setNombreCatGasto(request.nombreCatGasto());
        categoriaGastoRepository.save(nuevaCat);
        return new MessageResponse("Categoría creada exitosamente");
    }

    @Transactional
    public MessageResponse actualizarCategoria(Integer id, CategoriaGastoRequest request) {
        CategoriaGasto categoria = categoriaGastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La categoría especificada no existe."));

        String nuevoNombre = request.nombreCatGasto().trim();

        // 2. Si el usuario cambió el nombre, verificamos que el nuevo nombre no esté siendo usado por otra categoría
        if (!categoria.getNombreCatGasto().equalsIgnoreCase(nuevoNombre) &&
                categoriaGastoRepository.existsByNombreCatGastoIgnoreCase(nuevoNombre)) {
            throw new RuntimeException("La categoría '" + nuevoNombre + "' ya existe en el sistema.");
        }

        categoria.setNombreCatGasto(request.nombreCatGasto());
        categoriaGastoRepository.save(categoria);
        return new MessageResponse("Categoría actualizada exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarCategoria(Integer id) {
        if (!categoriaGastoRepository.existsById(id)) {
            throw new RuntimeException("La categoría especificada no existe.");
        }
        categoriaGastoRepository.deleteById(id);
        return new MessageResponse("Categoría eliminada exitosamente.");
    }
}
