package com.gym.atlas.controller.usuarios;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recepcion")
public class RecepcionValidationController {

    @GetMapping("/validar")
    public ResponseEntity<String> validarAccesoRecepcion() {
        // Si la petición llega hasta aquí, Spring Security ya validó
        // el token y confirmó que tiene rol RECEPCIONISTA o ADMIN.
        return ResponseEntity.ok("Acceso autorizado para módulo de recepción");
    }
}