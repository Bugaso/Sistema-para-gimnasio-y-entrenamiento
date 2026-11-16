package com.gym.atlas.service.recepcion;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.auth.RegisterRequest;
import com.gym.atlas.repository.usuario.RolRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class RegistrarClienteService {

    private final RolRepository rolRep;

    public RegistrarClienteService(RolRepository rolRep) {
        this.rolRep = rolRep;
    }

    public RegisterRequest generarPassCliente (RegisterRequest request){
        // 1. Transformar fecha y hora actual en un número entero de 8 dígitos
        LocalDateTime ahora = LocalDateTime.now();
        long marcaTemporal = Long.parseLong(ahora.format(DateTimeFormatter.ofPattern("ddHHmmss")));
        int passwordNumerica = (int) (10_000_000L + (marcaTemporal % 90_000_000L));
        String passwordGenerada = String.valueOf(passwordNumerica);

        // 2. Imprimir credenciales en consola (reemplazar por envío de email en el futuro)
        System.out.println("=========================================");
        System.out.println("NUEVO CLIENTE REGISTRADO POR RECEPCIÓN");
        System.out.println("Cliente: " + request.nomApe() + " | DNI: " + request.dniUs());
        System.out.println("Email: " + request.mailUs());
        System.out.println("Contraseña generada (8 dígitos): " + passwordGenerada);
        System.out.println("=========================================");

        // 3. Reconstruir el DTO con la contraseña generada (el rol CLIENTE se asigna por defecto)
        RegisterRequest requestConPassword = new RegisterRequest(
                0L,
                request.nomApe(),
                request.fechaNacimiento(),
                request.dniUs(),
                request.mailUs(),
                request.telUs(),
                request.numContacto(),
                passwordGenerada,
                rolRep.findBynomCatUs("Cliente").getIdRol()
        );


        return requestConPassword;
    }

}
