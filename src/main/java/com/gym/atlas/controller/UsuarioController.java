package com.gym.atlas.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class UsuarioController {



    @GetMapping("login")
    public ResponseEntity<ClassPathResource> login() {
        ClassPathResource resource = new ClassPathResource("templates/security/login.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("register")
    public ResponseEntity<ClassPathResource> register(){
        ClassPathResource resource = new ClassPathResource("templates/security/register.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }
}
