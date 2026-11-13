package com.gym.atlas.controller.membresias;

import com.gym.atlas.data.membresia.ClienteMembresia;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.membresia.ClienteMembresiaDTO;
import com.gym.atlas.dto.membresia.HistorialPagoClienteResponse;
import com.gym.atlas.dto.membresia.RegistrarClienteMembresiaRequest;
import com.gym.atlas.service.membresia.ClienteMembresiaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cliente-membresias")
public class ClienteMembresiaController {

    private final ClienteMembresiaService clienteMembresiaService;

    public ClienteMembresiaController(ClienteMembresiaService clienteMembresiaService) {
        this.clienteMembresiaService = clienteMembresiaService;
    }

    @PostMapping("registrar-pago")
    public ResponseEntity<ClienteMembresia> registrarPago(
            @RequestBody RegistrarClienteMembresiaRequest request
    ) {
        return ResponseEntity.ok(clienteMembresiaService.registrarPago(request));
    }

    @GetMapping("historial")
    public ResponseEntity<List<ClienteMembresiaDTO>> obtenerHistorial() {
        return ResponseEntity.ok(clienteMembresiaService.obtenerHistorial());
    }

    @GetMapping("historial/{id}")
    public ResponseEntity<List<HistorialPagoClienteResponse>> obtenerHistorialCliente(@PathVariable Long id ){
        return ResponseEntity.ok(clienteMembresiaService.obtenerHistorialCliente(id));
    }

    @DeleteMapping("{id}/baja")
    public MessageResponse borrarPagoCliente(@PathVariable Long id){
        System.out.println("ID DE LA CLIENTE MEMBRESIA: "+id);
        return (clienteMembresiaService.borrarPagoCliente(id));
    }
}