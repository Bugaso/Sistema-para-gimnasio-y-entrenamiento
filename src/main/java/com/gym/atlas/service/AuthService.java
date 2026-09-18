package com.gym.atlas.service;


import com.gym.atlas.Security.JwtService;
import com.gym.atlas.data.CategoriaUs;
import com.gym.atlas.data.Usuario;
import com.gym.atlas.dto.AuthRequest;
import com.gym.atlas.dto.AuthResponse;
import com.gym.atlas.dto.RegisterRequest;
import com.gym.atlas.repository.CategoriaUsRepository;
import com.gym.atlas.repository.UsuarioRepository;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository userRepository;
    private final CategoriaUsRepository catUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UsuarioRepository userRepository,
            CategoriaUsRepository catUsuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.catUsuarioRepository = catUsuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Registro de usuario vinculando la entidad CatUsuario
     */
    public AuthResponse register(RegisterRequest request) {
        // 1. Validar que la categoría exista en la base de datos
        CategoriaUs categoria = catUsuarioRepository.findById(request.idCatUs())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe la categoría de usuario con ID: " + request.idCatUs()
                ));

        // 2. Crear y poblar la entidad Usuario
        Usuario usuario = new Usuario();
        usuario.setNomApe(request.nomApe());
        usuario.setDniUs(request.dniUs());
        usuario.setFechaNacimiento(request.fechaNacimiento());
        usuario.setMailUs(request.mailUs());
        usuario.setPassword(passwordEncoder.encode(request.password())); // Contraseña encriptada con BCrypt
        usuario.setCategoria(categoria); // Relación @ManyToOne asignada

        // 3. Guardar en base de datos
        userRepository.save(usuario);

        // 4. Generar y retornar el token JWT
        String jwtToken = jwtService.generateToken(usuario);
        return new AuthResponse(jwtToken);
    }

    /**
     * Inicio de sesión de usuario registrado
     */
    public AuthResponse authenticate(AuthRequest request) {
        // 1. Spring Security valida email y contraseña
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        // 2. Si la autenticación no lanzó excepción, obtenemos los datos del usuario
        Usuario usuario = userRepository.findByMailUs(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Usuario o contraseña no válidos"));

        // 3. Generar token JWT
        String jwtToken = jwtService.generateToken(usuario);
        return new AuthResponse(jwtToken);
    }
}