package com.gym.atlas.controller.rutinas;

import com.gym.atlas.data.CatGenEjer;
import com.gym.atlas.dto.ejercicio.CatGenEjerRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.service.ejercicio.CatGenEjerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categorias-ejercicios")
public class CatGenEjerController {

    private final CatGenEjerService service;

    public CatGenEjerController(CatGenEjerService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CatGenEjer>> listarCategorias() {
        return ResponseEntity.ok(service.obtenerCategorias());
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearCategoria(@RequestBody CatGenEjerRequest request) {
        return ResponseEntity.ok(service.crearCategoria(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> actualizarCategoria(@PathVariable Integer id, @RequestBody CatGenEjerRequest request) {
        return ResponseEntity.ok(service.actualizarCategoria(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarCategoria(@PathVariable Integer id) {
        return ResponseEntity.ok(service.eliminarCategoria(id));
    }
}