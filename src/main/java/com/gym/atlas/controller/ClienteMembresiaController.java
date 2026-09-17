package com.gym.atlas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cliente-membresias")
public class ClienteMembresiaController {

    @PostMapping("/registrar-pago")
    public ResponseEntity<?> registrarPago(@RequestBody Object payload) {
        // TODO: Inyecta tu servicio y procesa la asignación de membresía y pago
        return ResponseEntity.ok("Pago registrado correctamente");
    }

    @GetMapping("/historial")
    public ResponseEntity<?> obtenerHistorial() {
        // TODO: Retorna la lista de historial
        return ResponseEntity.ok().build();
    }


}