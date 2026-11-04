package com.gym.atlas.controller.usuarios;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.usuario.AsistenciaRequest;
import com.gym.atlas.dto.usuario.EstadoAsistenciaResponse;
import com.gym.atlas.service.usuario.AsistenciaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recepcion/asistencia")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping("/estado/{idUsuario}")
    public ResponseEntity<EstadoAsistenciaResponse> consultarEstado(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(asistenciaService.obtenerEstadoActual(idUsuario));
    }

    @PostMapping("/registrar")
    public ResponseEntity<MessageResponse> registrar(@RequestBody AsistenciaRequest request) {
        return ResponseEntity.ok(asistenciaService.registrarAsistencia(request));
    }
}