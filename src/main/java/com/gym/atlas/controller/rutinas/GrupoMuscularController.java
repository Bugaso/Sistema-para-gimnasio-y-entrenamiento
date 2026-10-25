package com.gym.atlas.controller.rutinas;

import com.gym.atlas.data.GrupoMuscular;
import com.gym.atlas.dto.ejercicio.GrupoMuscularRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.service.ejercicio.GrupoMuscularService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/grupos-musculares")
public class GrupoMuscularController {

    private final GrupoMuscularService service;

    public GrupoMuscularController(GrupoMuscularService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<GrupoMuscular>> listarGruposMusculares() {
        return ResponseEntity.ok(service.obtenerGruposMusculares());
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearGrupoMuscular(@RequestBody GrupoMuscularRequest request) {
        return ResponseEntity.ok(service.crearGrupoMuscular(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> actualizarGrupoMuscular(@PathVariable Integer id, @RequestBody GrupoMuscularRequest request) {
        return ResponseEntity.ok(service.actualizarGrupoMuscular(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarGrupoMuscular(@PathVariable Integer id) {
        return ResponseEntity.ok(service.eliminarGrupoMuscular(id));
    }
}