package com.gym.atlas.controller;

import com.gym.atlas.dto.CategoriaResponse;
import com.gym.atlas.repository.CategoriaUsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/categorias")
public class CategoriaUsController {

    private final CategoriaUsRepository categoriaRepository;

    public CategoriaUsController(CategoriaUsRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> listarCategorias() {
        List<CategoriaResponse> categorias = categoriaRepository.findAll().stream()
                .map(cat -> new CategoriaResponse(cat.getIdCatUs(), cat.getNomCatUs()))
                .toList();
        return ResponseEntity.ok(categorias);
    }
}
