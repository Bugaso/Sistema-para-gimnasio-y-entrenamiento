package com.gym.atlas.controller.rutinas;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.rutina.AsignacionRutinaRequest;
import com.gym.atlas.dto.rutina.RutinaCompletaRequest;
import com.gym.atlas.service.rutina.RutinaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/validar")
    public ResponseEntity<String> validarAccesoCoach() {
        return ResponseEntity.ok("Acceso autorizado para módulo de coach");
    }
}