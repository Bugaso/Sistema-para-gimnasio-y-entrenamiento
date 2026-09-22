package com.gym.atlas.controller;

import com.gym.atlas.data.ClienteMembresia;
import com.gym.atlas.dto.RegistrarClienteMembresiaRequest;
import com.gym.atlas.service.ClienteMembresiaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cliente-membresias")
public class ClienteMembresiaController {

    private final ClienteMembresiaService clienteMembresiaService;

    public ClienteMembresiaController(ClienteMembresiaService clienteMembresiaService) {
        this.clienteMembresiaService = clienteMembresiaService;
    }

    @PostMapping("registrar-pago")
    public ResponseEntity<ClienteMembresia> registrarPago(
            @RequestBody RegistrarClienteMembresiaRequest request
    ) {
        return ResponseEntity.ok(clienteMembresiaService.registrarPago(request));
    }

    @GetMapping("historial")
    public ResponseEntity<List<ClienteMembresia>> obtenerHistorial() {
        return ResponseEntity.ok(clienteMembresiaService.obtenerHistorial());
    }
}