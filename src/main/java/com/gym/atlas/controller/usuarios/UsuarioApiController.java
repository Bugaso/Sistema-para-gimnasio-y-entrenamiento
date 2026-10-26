package com.gym.atlas.controller.usuarios;

import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.usuario.ClienteResponse;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioApiController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioApiController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteResponse>> obtenerClientes() {
        // Ahora usamos el método que filtra directamente en la base de datos
        List<ClienteResponse> clientes = usuarioRepository.findSoloClientes().stream()
                .map(u -> new ClienteResponse(
                        u.getIdUsuario(),
                        u.getDniUs(),
                        u.getNomApe()
                ))
                .toList();

        return ResponseEntity.ok(clientes);
    }
}