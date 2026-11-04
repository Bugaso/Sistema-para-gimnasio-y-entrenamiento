package com.gym.atlas.controller.coach;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.historial.HistorialDetalleResponse;
import com.gym.atlas.dto.historial.HistorialResumenResponse;
import com.gym.atlas.dto.historial.RegistroSesionRequest;
import com.gym.atlas.service.historial.HistorialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/asignacion/{idCliCou}")
    public ResponseEntity<List<HistorialResumenResponse>> obtenerHistorialCliente(@PathVariable Integer idCliCou) {
        return ResponseEntity.ok(historialService.obtenerResumenPorAsignacion(idCliCou));
    }

    @GetMapping("/sesion/{idHistRut}")
    public ResponseEntity<HistorialDetalleResponse> obtenerDetalleSesion(@PathVariable Integer idHistRut) {
        return ResponseEntity.ok(historialService.obtenerDetalleSesion(idHistRut));
    }

    @PutMapping("/actualizar/{idHistRut}")
    public ResponseEntity<MessageResponse> actualizarSesion(@PathVariable Integer idHistRut, @RequestBody RegistroSesionRequest request) {
        return ResponseEntity.ok(historialService.actualizarSesion(idHistRut, request));
    }

    @DeleteMapping("/eliminar/{idHistRut}")
    public ResponseEntity<MessageResponse> eliminarSesion(@PathVariable Integer idHistRut){
        return ResponseEntity.ok(historialService.eliminarSesion(idHistRut));
    }
}