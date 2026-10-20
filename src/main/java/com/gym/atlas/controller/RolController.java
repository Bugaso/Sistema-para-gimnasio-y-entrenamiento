package com.gym.atlas.controller;

import com.gym.atlas.data.Rol;
import com.gym.atlas.dto.RolResponse;
import com.gym.atlas.dto.RolUsResponse;
import com.gym.atlas.service.RolService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("rol")
public class RolController {

    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodosLosRoles() {
        // Llamado al servicio usando el método especificado
        List<Rol> roles = rolService.obtenerRoles();

        // Retornamos la lista con un código HTTP 200 (OK)
        return ResponseEntity.ok(roles);
    }
}
