package com.gym.atlas.controller;


import com.gym.atlas.data.Usuario;
import com.gym.atlas.repository.UsuarioRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.gym.atlas.dto.UserProfileResponse;
import com.gym.atlas.service.UsuarioService;
import java.util.List;

@RestController
@RequestMapping("/")
public class UsuarioController {

    private UsuarioService usuarioService;


    public UsuarioController(UsuarioService usuarioService) {

        this.usuarioService = usuarioService;
    }

    @GetMapping("login")
    public ResponseEntity<ClassPathResource> login() {
        ClassPathResource resource = new ClassPathResource("static/inicio-sesion.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("register")
    public ResponseEntity<ClassPathResource> register() {
        ClassPathResource resource = new ClassPathResource("static/registro.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("usuarios")
    public ResponseEntity<List<Usuario>> obtenerClientes() {
        // Pasa fija la categoría 2 correspondiente a clientes
        List<Usuario> clientes = usuarioService.obtenerUsuariosClientes();
        return ResponseEntity.ok(clientes);
    }
    @GetMapping("me")
    public ResponseEntity<UserProfileResponse> obtenerUsuarioAutenticado(Authentication authentication) {
        // Validar si la petición no incluye un contexto de autenticación válido
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        UserProfileResponse usuario = usuarioService.obtenerPerfilPorEmail(email);
        return ResponseEntity.ok(usuario);

    }
}
