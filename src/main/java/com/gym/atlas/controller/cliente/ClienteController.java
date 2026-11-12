package com.gym.atlas.controller.cliente;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.cliente.ClienteRutinaResponse;
import com.gym.atlas.dto.cliente.PerfilClienteRequest;
import com.gym.atlas.dto.cliente.PerfilClienteResponse;
import com.gym.atlas.dto.cliente.RegistroSesionClienteRequest;
import com.gym.atlas.dto.ejercicio.EjercicioResponse;
import com.gym.atlas.dto.ejercicio.EjercicioVerResponse;
import com.gym.atlas.dto.ejercicio.HistorialRutinaClienteResponse;
import com.gym.atlas.dto.historial.HistorialDetalleResponse;
import com.gym.atlas.service.cliente.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping("/perfil")
    public ResponseEntity<PerfilClienteResponse> obtenerPerfil() {
        return ResponseEntity.ok(clienteService.obtenerPerfil());
    }

    @PutMapping("/perfil")
    public ResponseEntity<MessageResponse> actualizarPerfil(@RequestBody PerfilClienteRequest request) {
        return ResponseEntity.ok(clienteService.actualizarPerfil(request));
    }

    // Endpoint para ver qué rutina tiene asignada actualmente el cliente
    @GetMapping("/rutina-activa")
    public ResponseEntity<List<ClienteRutinaResponse>> obtenerRutinaActiva() {
        return ResponseEntity.ok(clienteService.obtenerRutinasActivas());
    }

    @GetMapping("/ejercicio/{nombreEjercicio}")
    public ResponseEntity<EjercicioVerResponse> verEjercicio(@PathVariable String nombreEjercicio){
        return ResponseEntity.ok(clienteService.obtenerEjercicio(nombreEjercicio));
    }
    // Endpoint para ver si el cliente ya entrenó en una fecha específica
    @GetMapping("/historial-sesion")
    public ResponseEntity<List<HistorialRutinaClienteResponse>> obtenerHistorialSesion(@RequestParam String fecha) {

        return ResponseEntity.ok(clienteService.obtenerHistorialSesionPorFecha(fecha));
    }

    // NUEVO ENDPOINT PARA REGISTRAR LA SESIÓN
    @PostMapping("/historial/registrar")
    public ResponseEntity<MessageResponse> registrarSesionCliente(@RequestBody RegistroSesionClienteRequest request) {
        return ResponseEntity.ok(clienteService.registrarSesion(request));
    }
}