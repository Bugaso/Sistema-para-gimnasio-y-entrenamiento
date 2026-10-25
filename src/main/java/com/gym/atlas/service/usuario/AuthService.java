package com.gym.atlas.service.usuario;


import com.gym.atlas.Security.JwtService;
import com.gym.atlas.data.usuario.Rol;
import com.gym.atlas.data.usuario.RolUs;
import com.gym.atlas.data.usuario.Roles;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.auth.AuthRequest;
import com.gym.atlas.dto.auth.AuthResponse;
import com.gym.atlas.dto.auth.RegisterRequest;
import com.gym.atlas.repository.usuario.RolRepository;
import com.gym.atlas.repository.usuario.RolUsRepository;
import com.gym.atlas.repository.usuario.UsuarioRepository;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository userRepository;
    private final RolRepository RolUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private final RolUsRepository rolUsRepository;

    public AuthService(
            UsuarioRepository userRepository,
            RolRepository catUsuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager, RolUsRepository rolUsRepository
    ) {
        this.userRepository = userRepository;
        this.RolUsuarioRepository = catUsuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.rolUsRepository = rolUsRepository;
    }

    /**
     * Registro de usuario vinculando la entidad CatUsuario
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        System.out.println("Usuario: "+ request.toString());
        System.out.println("IDE DE USUARIO OBTENIDA: "+request.idRol());
        // 1. Validar que la categoría exista en la base de datos
        Rol rol = RolUsuarioRepository.findById(request.idRol())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe la categoría de usuario con ID: " + request.idRol()
                ));



        // 2. Crear y poblar la entidad Usuario
        Usuario usuario = new Usuario();
        usuario.setNomApe(request.nomApe());
        usuario.setDniUs(request.dniUs());
        usuario.setFechaNacimiento(request.fechaNacimiento());
        usuario.setMailUs(request.mailUs());
        usuario.setTelUs(request.telUs());
        usuario.setContacoE(request.numContacto());
        usuario.setPassword(passwordEncoder.encode(request.password())); // Contraseña encriptada con BCrypt


        // 3. Crear la entidad intermedia (RolUs)
        RolUs vinculoRolUsuario = new RolUs();
        vinculoRolUsuario.setUsuario(usuario); // Vinculamos el usuario
        vinculoRolUsuario.setRol(rol);     // Vinculamos el rol
        vinculoRolUsuario.setEstado(Roles.ACTIVO.toString());      // Estado por defecto


        rolUsRepository.save(vinculoRolUsuario);
        usuario.getRolesUsuario().add(vinculoRolUsuario);
        // 4. Guardar en base de datos

        userRepository.save(usuario);
        // 5. Generar y retornar el token JWT
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