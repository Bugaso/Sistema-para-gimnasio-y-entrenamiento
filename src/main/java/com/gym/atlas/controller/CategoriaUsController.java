package com.gym.atlas.controller;


import com.gym.atlas.dto.RolResponse;
import com.gym.atlas.repository.RolRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/categorias")
public class CategoriaUsController {

    private final RolRepository categoriaRepository;

    public CategoriaUsController(RolRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public ResponseEntity<List<RolResponse>> listarRoles() {
        List<RolResponse> roles = categoriaRepository.findAll().stream()
                .map(rolus-> new RolResponse(rolus.getIdRol(),rolus.getNomCatUs()))
                .toList();
        return ResponseEntity.ok(roles);
    }
}
