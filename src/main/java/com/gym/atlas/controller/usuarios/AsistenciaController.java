package com.gym.atlas.controller.usuarios;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.asistencia.AsistenciaRequest;
import com.gym.atlas.dto.asistencia.ValidacionAsistenciaResponse;
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

    @GetMapping("/validar-limite/{idClienteMembresia}")
    public ResponseEntity<ValidacionAsistenciaResponse> validarLimiteAsistencia(@PathVariable Long idClienteMembresia) {
        // El servicio debe calcular las asistencias de esta semana para esta membresía
        // y devolver el ValidacionAsistenciaResponse correspondiente.
        ValidacionAsistenciaResponse resp = asistenciaService.validarLimiteAsistencia(idClienteMembresia);
        System.out.println("Entidad devuelta desde el backend: "+ resp.toString());
        return ResponseEntity.ok(resp);
    }
}