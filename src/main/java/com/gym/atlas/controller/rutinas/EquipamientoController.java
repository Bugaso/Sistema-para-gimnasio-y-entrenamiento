package com.gym.atlas.controller.rutinas;

import com.gym.atlas.data.ejercicio.Equipamiento;
import com.gym.atlas.dto.ejercicio.EquipamientoRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.service.ejercicio.EquipamientoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/equipamiento")
public class EquipamientoController {

    private final EquipamientoService service;

    public EquipamientoController(EquipamientoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Equipamiento>> listarEquipamientos() {
        return ResponseEntity.ok(service.obtenerEquipamientos());
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearEquipamiento(@RequestBody EquipamientoRequest request) {
        return ResponseEntity.ok(service.crearEquipamiento(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> actualizarEquipamiento(@PathVariable Integer id, @RequestBody EquipamientoRequest request) {
        return ResponseEntity.ok(service.actualizarEquipamiento(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarEquipamiento(@PathVariable Integer id) {
        return ResponseEntity.ok(service.eliminarEquipamiento(id));
    }
}