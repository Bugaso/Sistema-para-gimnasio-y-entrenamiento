package com.gym.atlas.controller.rutinas;

import com.gym.atlas.dto.ejercicio.EjercicioRequest;
import com.gym.atlas.dto.ejercicio.EjercicioResponse;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.service.ejercicio.EjercicioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/ejercicios")
public class EjercicioController {

    private final EjercicioService service;

    public EjercicioController(EjercicioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EjercicioResponse>> listarEjercicios() {
        return ResponseEntity.ok(service.obtenerEjercicios());
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearEjercicio(@RequestBody EjercicioRequest request) {
        return ResponseEntity.ok(service.crearEjercicio(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> actualizarEjercicio(@PathVariable Integer id, @RequestBody EjercicioRequest request) {
        return ResponseEntity.ok(service.actualizarEjercicio(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarEjercicio(@PathVariable Integer id) {
        return ResponseEntity.ok(service.eliminarEjercicio(id));
    }
}