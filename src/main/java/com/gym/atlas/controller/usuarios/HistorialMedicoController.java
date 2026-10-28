package com.gym.atlas.controller.usuarios;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.usuario.HistorialMedicoRequest;
import com.gym.atlas.dto.usuario.HistorialMedicoResponse;
import com.gym.atlas.service.usuario.HistorialMedicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recepcion/historial-medico")
public class HistorialMedicoController {

    private final HistorialMedicoService service;

    public HistorialMedicoController(HistorialMedicoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<HistorialMedicoResponse>> listarHistoriales() {
        return ResponseEntity.ok(service.obtenerHistoriales());
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearHistorial(@RequestBody HistorialMedicoRequest request) {
        return ResponseEntity.ok(service.crearHistorial(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> actualizarHistorial(@PathVariable Integer id, @RequestBody HistorialMedicoRequest request) {
        return ResponseEntity.ok(service.actualizarHistorial(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarHistorial(@PathVariable Integer id) {
        return ResponseEntity.ok(service.eliminarHistorial(id));
    }
}