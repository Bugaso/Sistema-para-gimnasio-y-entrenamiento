package com.gym.atlas.service.usuario;

import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import com.gym.atlas.security.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RecuperacionPasswordService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int MINUTOS_EXPIRACION = 10;
    private static final int MAX_INTENTOS = 5;

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // Almacén temporal en memoria: clave = email en minúsculas
    private final Map<String, CodigoPendiente> codigosActivos = new ConcurrentHashMap<>();

    public RecuperacionPasswordService(UsuarioRepository usuarioRepository,
                                       EmailService emailService,
                                       PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    // PASO 1: Validar Email + DNI, generar código con SecureRandom y enviarlo
    public void solicitarCodigo(String mailUs, Long dniUs) {
        if (mailUs == null || mailUs.isBlank() || dniUs == null) {
            throw new RuntimeException("Debes ingresar tanto el correo electrónico como el DNI.");
        }

        String emailNormalizado = mailUs.trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByMailUs(emailNormalizado)
                .orElseThrow(() -> new RuntimeException("Los datos ingresados no coinciden con ningún usuario registrado."));

        if (!dniUs.equals(usuario.getDniUs())) {
            throw new RuntimeException("Los datos ingresados no coinciden con ningún usuario registrado.");
        }

        // Generar número aleatorio seguro de exactamente 6 dígitos (100000 a 999999)
        int numero = 100_000 + SECURE_RANDOM.nextInt(900_000);
        String codigo = String.valueOf(numero);

        codigosActivos.put(emailNormalizado, new CodigoPendiente(
                codigo,
                dniUs,
                LocalDateTime.now().plusMinutes(MINUTOS_EXPIRACION),
                0
        ));

        emailService.enviarCodigoRecuperacion(usuario.getMailUs(), usuario.getNomApe(), codigo);
    }

    // PASO 2: Validar el código ingresado por el usuario
    public void validarCodigo(String mailUs, Long dniUs, String codigoIngresado) {
        verificarInterno(mailUs, dniUs, codigoIngresado);
    }

    // PASO 3: Re-validar código y actualizar contraseña encriptada
    @Transactional
    public void restablecerPassword(String mailUs, Long dniUs, String codigoIngresado, String nuevaPassword) {
        if (nuevaPassword == null || nuevaPassword.trim().length() < 8) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 8 caracteres.");
        }

        String emailNormalizado = verificarInterno(mailUs, dniUs, codigoIngresado);

        Usuario usuario = usuarioRepository.findByMailUs(emailNormalizado)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        if (!dniUs.equals(usuario.getDniUs())) {
            throw new RuntimeException("El DNI no corresponde al usuario.");
        }

        usuario.setPassword(passwordEncoder.encode(nuevaPassword.trim()));
        usuarioRepository.save(usuario);

        // Invalidar el código usado para que no pueda reutilizarse
        codigosActivos.remove(emailNormalizado);
    }

    private String verificarInterno(String mailUs, Long dniUs, String codigoIngresado) {
        if (mailUs == null || dniUs == null || codigoIngresado == null || codigoIngresado.isBlank()) {
            throw new RuntimeException("Faltan datos para validar el código.");
        }

        String emailNormalizado = mailUs.trim().toLowerCase();
        CodigoPendiente registro = codigosActivos.get(emailNormalizado);

        if (registro == null || !registro.dniUs().equals(dniUs)) {
            throw new RuntimeException("No existe una solicitud de recuperación activa para estos datos.");
        }

        if (LocalDateTime.now().isAfter(registro.expiracion())) {
            codigosActivos.remove(emailNormalizado);
            throw new RuntimeException("El código ha expirado. Solicita uno nuevo.");
        }

        if (!registro.codigo().equals(codigoIngresado.trim())) {
            int nuevosIntentos = registro.intentosFallidos() + 1;
            if (nuevosIntentos >= MAX_INTENTOS) {
                codigosActivos.remove(emailNormalizado);
                throw new RuntimeException("Demasiados intentos fallidos. Solicita un nuevo código.");
            }
            codigosActivos.put(emailNormalizado, new CodigoPendiente(
                    registro.codigo(),
                    registro.dniUs(),
                    registro.expiracion(),
                    nuevosIntentos
            ));
            throw new RuntimeException("El código ingresado es incorrecto.");
        }

        return emailNormalizado;
    }

    private record CodigoPendiente(
            String codigo,
            Long dniUs,
            LocalDateTime expiracion,
            int intentosFallidos
    ) {}
}
