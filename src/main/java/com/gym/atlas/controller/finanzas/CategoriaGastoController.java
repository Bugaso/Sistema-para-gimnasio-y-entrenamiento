package com.gym.atlas.controller.finanzas;

import com.gym.atlas.data.CategoriaGasto;
import com.gym.atlas.dto.finanzas.CategoriaGastoRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.service.finanzas.CategoriaGastoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categorias-gastos")
public class CategoriaGastoController {

    private final CategoriaGastoService service;

    public CategoriaGastoController(CategoriaGastoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaGasto>> listarCategorias() {
        return ResponseEntity.ok(service.obtenerCategorias());
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearCategoria(@RequestBody CategoriaGastoRequest request) {
        return ResponseEntity.ok(service.crearCategoria(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> actualizarCategoria(@PathVariable Integer id, @RequestBody CategoriaGastoRequest request) {
        return ResponseEntity.ok(service.actualizarCategoria(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarCategoria(@PathVariable Integer id) {
        return ResponseEntity.ok(service.eliminarCategoria(id));
    }
}
