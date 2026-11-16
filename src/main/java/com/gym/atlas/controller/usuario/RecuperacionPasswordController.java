package com.gym.atlas.controller.usuario;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.service.usuario.RecuperacionPasswordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/recuperar-password")
public class RecuperacionPasswordController {

    private final RecuperacionPasswordService recuperacionService;

    public RecuperacionPasswordController(RecuperacionPasswordService recuperacionService) {
        this.recuperacionService = recuperacionService;
    }

    public record SolicitudCodigoRequest(String mailUs, Long dniUs) {}
    public record ValidarCodigoRequest(String mailUs, Long dniUs, String codigo) {}
    public record RestablecerPasswordRequest(String mailUs, Long dniUs, String codigo, String nuevaPassword) {}

    @PostMapping("/solicitar")
    public ResponseEntity<MessageResponse> solicitarCodigo(@RequestBody SolicitudCodigoRequest request) {
        try {
            recuperacionService.solicitarCodigo(request.mailUs(), request.dniUs());
            return ResponseEntity.ok(new MessageResponse("Código enviado a tu correo electrónico."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/validar")
    public ResponseEntity<MessageResponse> validarCodigo(@RequestBody ValidarCodigoRequest request) {
        try {
            recuperacionService.validarCodigo(request.mailUs(), request.dniUs(), request.codigo());
            return ResponseEntity.ok(new MessageResponse("Código verificado correctamente."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/restablecer")
    public ResponseEntity<MessageResponse> restablecerPassword(@RequestBody RestablecerPasswordRequest request) {
        try {
            recuperacionService.restablecerPassword(
                    request.mailUs(),
                    request.dniUs(),
                    request.codigo(),
                    request.nuevaPassword()
            );
            return ResponseEntity.ok(new MessageResponse("Contraseña actualizada correctamente."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
