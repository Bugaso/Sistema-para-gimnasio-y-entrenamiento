package com.gym.atlas.controller.finanzas;

import com.gym.atlas.dto.finanzas.ComprobanteRequest;
import com.gym.atlas.dto.finanzas.ComprobanteResponse;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.service.finanzas.ComprobanteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/comprobantes")
public class ComprobanteController {

    private final ComprobanteService service;

    public ComprobanteController(ComprobanteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ComprobanteResponse>> listarComprobantes() {
        return ResponseEntity.ok(service.obtenerComprobantes());
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearComprobante(@RequestBody ComprobanteRequest request) {
        return ResponseEntity.ok(service.crearComprobante(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> actualizarComprobante(@PathVariable Integer id, @RequestBody ComprobanteRequest request) {
        return ResponseEntity.ok(service.actualizarComprobante(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> eliminarComprobante(@PathVariable Integer id) {
        return ResponseEntity.ok(service.eliminarComprobante(id));
    }
}