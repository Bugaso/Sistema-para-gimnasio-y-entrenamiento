package com.gym.atlas.controller.coach;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coach")
public class CoachController {

    @GetMapping("/validar")
    public ResponseEntity<String> validarAccesoCoach() {
        return ResponseEntity.ok("Acceso autorizado para módulo de coach");
    }
}