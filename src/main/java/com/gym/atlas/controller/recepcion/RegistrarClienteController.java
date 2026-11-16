package com.gym.atlas.controller.recepcion;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.auth.RegisterRequest;
import com.gym.atlas.security.EmailService;
import com.gym.atlas.service.recepcion.RegistrarClienteService;
import com.gym.atlas.service.usuario.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recepcion/")
public class RegistrarClienteController {

    private final AuthService authenticationService;

    private final RegistrarClienteService registrarClienteService;

    private final EmailService emailService;

    public RegistrarClienteController(AuthService authenticationService, RegistrarClienteService registrarClienteService, EmailService emailService) {
        this.authenticationService = authenticationService;
        this.registrarClienteService = registrarClienteService;
        this.emailService = emailService;
    }

    @PostMapping("/registrar-cliente")
    public ResponseEntity<?> registrarClientePorRecepcion(@RequestBody RegisterRequest request) {
        try {
            RegisterRequest conPass = registrarClienteService.generarPassCliente(request);
            authenticationService.register(conPass);


            // 3. Enviar credenciales por correo electrónico
            try {
                emailService.enviarCredencialesNuevoCliente(
                        request.mailUs(),
                        request.nomApe(),
                        conPass.password()
                );
                return ResponseEntity.ok(new MessageResponse(
                        "Cliente registrado y credenciales enviadas a " + request.mailUs()
                ));
            } catch (RuntimeException mailError) {
                System.err.println("Aviso: Cliente creado, pero falló el envío de correo. Contraseña: " + conPass.password());
                return ResponseEntity.ok(new MessageResponse(
                        "Cliente registrado, pero no se pudo enviar el correo. Contraseña temporal: " + conPass.password()
                ));
            }
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("El cliente no fue registrado correctamente, verfique si no hay un registro existente del numero de documento o correo electronico"));
        }
    }
}


