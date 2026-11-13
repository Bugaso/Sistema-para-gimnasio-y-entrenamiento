package com.gym.atlas.controller.cliente;

import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.cliente.ClienteRutinaResponse;
import com.gym.atlas.dto.cliente.PerfilClienteRequest;
import com.gym.atlas.dto.cliente.PerfilClienteResponse;
import com.gym.atlas.dto.cliente.RegistroSesionClienteRequest;
import com.gym.atlas.dto.ejercicio.EjercicioVerResponse;
import com.gym.atlas.dto.ejercicio.HistorialRutinaClienteResponse;
import com.gym.atlas.dto.membresia.HistorialPagoClienteResponse;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import com.gym.atlas.service.cliente.ClienteService;
import com.gym.atlas.service.membresia.ClienteMembresiaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente")
public class ClienteController {

    private final ClienteService clienteService;
    private final ClienteMembresiaService clienteMembresiaService;
    private final UsuarioRepository usuarioRepository;

    public ClienteController(ClienteService clienteService, ClienteMembresiaService clienteMembresiaService, UsuarioRepository usuarioRepository) {
        this.clienteService = clienteService;
        this.clienteMembresiaService = clienteMembresiaService;
        this.usuarioRepository = usuarioRepository;
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

    @GetMapping("/historial-pagos")
    public ResponseEntity<List<HistorialPagoClienteResponse>> obtenerHistorialPagosCliente(Authentication auth) {
        Usuario usuario = usuarioRepository.findByMailUs(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado"));
        return ResponseEntity.ok(clienteMembresiaService.obtenerHistorialCliente(usuario.getIdUsuario()));
    }
}