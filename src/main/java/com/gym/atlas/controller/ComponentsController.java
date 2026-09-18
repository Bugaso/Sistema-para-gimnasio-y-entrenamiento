package com.gym.atlas.controller;


import jakarta.websocket.server.ServerEndpoint;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class ComponentsController {

    @GetMapping("/componentes/header")
    public ResponseEntity<ClassPathResource> header(){
        ClassPathResource resource = new ClassPathResource("templates/componentes/header.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("/componentes/footer")
    public ResponseEntity<ClassPathResource> footer(){
        ClassPathResource resource = new ClassPathResource("templates/componentes/footer.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }
}
