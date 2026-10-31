package com.gym.atlas.controller.rutinas;

import com.gym.atlas.data.rutina.Rutina;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.rutina.*;
import com.gym.atlas.service.rutina.RutinaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach/rutina")
public class RutinaController {

    private final RutinaService rutinaService;

    public RutinaController(RutinaService rutinaService) {
        this.rutinaService = rutinaService;
    }

    @PostMapping("/crear")
    public ResponseEntity<MessageResponse> crearRutina(@RequestBody RutinaCompletaRequest request) {
        return ResponseEntity.ok(rutinaService.crearRutinaCompleta(request));
    }

    @PostMapping("/asignar")
    public ResponseEntity<MessageResponse> asignarRutina(@RequestBody AsignacionRutinaRequest request) {
        return ResponseEntity.ok(rutinaService.asignarRutinaACliente(request));
    }

    @GetMapping("/plantillas")
    public ResponseEntity<List<Rutina>> obtenerPlantillas() {
        return ResponseEntity.ok(rutinaService.obtenerPlantillasGenerales());
    }

    @GetMapping("/listado")
    public ResponseEntity<List<RutinaResponse>> listarRutinas() {
        return ResponseEntity.ok(rutinaService.listarRutinas());
    }

    @GetMapping("/asignaciones")
    public ResponseEntity<List<AsignacionResponse>> listarAsignaciones() {
        return ResponseEntity.ok(rutinaService.listarAsignaciones());
    }

    @DeleteMapping("/asignacion/{id}")
    public ResponseEntity<MessageResponse> eliminarAsignacion(@PathVariable Integer id) {
        return ResponseEntity.ok(rutinaService.eliminarAsignacion(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RutinaConDetallesResponse> obtenerRutinaDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(rutinaService.obtenerRutinaPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarRutina(@PathVariable Integer id) {
        return ResponseEntity.ok(rutinaService.eliminarRutina(id));
    }
}