package com.gym.atlas.controller.coach;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.historial.RegistroSesionRequest;
import com.gym.atlas.service.historial.HistorialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coach/historial")
public class HistorialController {

    private final HistorialService historialService;

    public HistorialController(HistorialService historialService) {
        this.historialService = historialService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<MessageResponse> registrarSesion(@RequestBody RegistroSesionRequest request) {
        return ResponseEntity.ok(historialService.registrarSesion(request));
    }
}