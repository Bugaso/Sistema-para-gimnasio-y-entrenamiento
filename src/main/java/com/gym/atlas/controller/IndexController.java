package com.gym.atlas.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndexController {
    @GetMapping("/")
    public ResponseEntity<ClassPathResource> index(){
        ClassPathResource resource = new ClassPathResource("templates/index.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }
}
