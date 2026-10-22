package com.gym.atlas.controller;

import com.gym.atlas.data.Rol;
import com.gym.atlas.dto.*;
import com.gym.atlas.service.RolService;
import com.gym.atlas.service.UsuarioService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AdminController {

    private final UsuarioService usuarioService;

    private final RolService rolService;

    public AdminController(UsuarioService usuarioService, RolService rolService) {
        this.usuarioService = usuarioService;
        this.rolService = rolService;
    }

    // ==========================================
    // 1. RUTAS PARA SERVIR VISTAS HTML
    // ==========================================

    @GetMapping("/admin")
    public ResponseEntity<ClassPathResource> indexAdmin() {
        ClassPathResource resource = new ClassPathResource("static/admin/index.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("/admin/personal")
    public ResponseEntity<ClassPathResource> indexPersonal() {
        ClassPathResource resource = new ClassPathResource("static/admin/personal.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping("/admin/validar")
    public ResponseEntity<String> validarAccesoAdmin() {
        return ResponseEntity.ok("Acceso concedido");
    }

    // ==========================================
    // 2. ENDPOINTS API REST PARA EL CRUD (/api/admin/empleados)
    // ==========================================

    // POST: Crear empleado
    @PostMapping("/api/admin/empleados")
    public ResponseEntity<MessageResponse> crearEmpleado(@RequestBody EmpleadoRequest request) {
        try {
            MessageResponse response = usuarioService.crearEmpleado(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // GET: Listar empleados
    @GetMapping("/api/admin/empleados")
    public ResponseEntity<List<EmpleadoResponse>> listarEmpleados() {
        return ResponseEntity.ok(usuarioService.obtenerEmpleados());
    }

    // PUT: Modificar empleado
    @PutMapping("/api/admin/empleados/{id}")
    public ResponseEntity<MessageResponse> actualizarEmpleado(@PathVariable Integer id, @RequestBody EmpleadoRequest request) {
        try {
            MessageResponse response = usuarioService.actualizarEmpleado(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // DELETE: Eliminar empleado
    @DeleteMapping("/api/admin/empleados/{id}")
    public ResponseEntity<MessageResponse> eliminarEmpleado(@PathVariable Integer id) {
        try {
            MessageResponse response = usuarioService.eliminarEmpleado(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/admin/personal/registrar")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(usuarioService.registrarPersonal(request));
    }




    /***************************************/
    //ROLES

    // 1. Vista HTML
    @GetMapping("/admin/roles")
    public ResponseEntity<ClassPathResource> indexRoles() {
        ClassPathResource resource = new ClassPathResource("static/admin/roles.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    // 2. Endpoints REST API para Roles
    @GetMapping("/api/admin/roles")
    public ResponseEntity<List<Rol>> listarRoles() {
        return ResponseEntity.ok(rolService.obtenerRoles());
    }

    @PostMapping("/api/admin/roles")
    public ResponseEntity<MessageResponse> crearRol(@RequestBody RolRequest request) {
        System.out.println(request.toString());
        return ResponseEntity.ok(rolService.crearRol(request));
    }

    @PutMapping("/api/admin/roles/{id}")
    public ResponseEntity<MessageResponse> actualizarRol(@PathVariable Long id, @RequestBody RolRequest request) {
        return ResponseEntity.ok(rolService.actualizarRol(id, request));
    }

    @DeleteMapping("/api/admin/roles/{id}")
    public ResponseEntity<MessageResponse> eliminarRol(@PathVariable Long id) {
        return ResponseEntity.ok(rolService.eliminarRol(id));
    }
}