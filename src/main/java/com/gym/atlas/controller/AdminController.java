package com.gym.atlas.controller;

import com.gym.atlas.dto.RegisterRequest;
import com.gym.atlas.service.UsuarioService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UsuarioService usuarioService;

    public AdminController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }

    // 1. RUTA PARA LA VISTA: /admin (Devuelve el HTML)
    @GetMapping
    public ResponseEntity<ClassPathResource> indexAdmin(){
        ClassPathResource resource = new ClassPathResource("static/admin/index.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("/personal")
    public ResponseEntity<ClassPathResource> index(){
        ClassPathResource resource = new ClassPathResource("/personal.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @PostMapping("/personal/registrar")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(usuarioService.registrarPersonal(request));
    }

    // 2. RUTA PARA LA API DE VALIDACIÓN: /admin/validar (Responde a Javascript)
    @GetMapping("/validar")
    public ResponseEntity<String> validarAccesoAdmin() {
        return ResponseEntity.ok("Acceso concedido");
    }
}