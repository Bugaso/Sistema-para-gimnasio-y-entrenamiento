package com.gym.atlas.controller;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.MusculosAsociadosRequest;
import com.gym.atlas.dto.MusculosAsociadosResponse;
import com.gym.atlas.service.MusculosAsociadosService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/musculos-asociados")
public class MusculosAsociadosController {

    private final MusculosAsociadosService service;

    public MusculosAsociadosController(MusculosAsociadosService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MusculosAsociadosResponse>> listarRelaciones() {
        return ResponseEntity.ok(service.obtenerRelaciones());
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearRelacion(@RequestBody MusculosAsociadosRequest request) {
        return ResponseEntity.ok(service.crearRelacion(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> actualizarRelacion(@PathVariable Integer id, @RequestBody MusculosAsociadosRequest request) {
        return ResponseEntity.ok(service.actualizarRelacion(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarRelacion(@PathVariable Integer id) {
        return ResponseEntity.ok(service.eliminarRelacion(id));
    }
}