package com.gym.atlas.controller;

import com.gym.atlas.data.Usuario;
import com.gym.atlas.repository.UsuarioRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("login")
    public ResponseEntity<ClassPathResource> login() {
        ClassPathResource resource = new ClassPathResource("templates/security/login.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("register")
    public ResponseEntity<ClassPathResource> register() {
        ClassPathResource resource = new ClassPathResource("templates/security/register.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> obtenerTodos() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }
}
