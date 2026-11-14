package com.gym.atlas.configuracion;

import com.gym.atlas.data.usuario.Rol;
import com.gym.atlas.data.usuario.RolUs;
import com.gym.atlas.data.usuario.Roles;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.repository.usuario.RolRepository;
import com.gym.atlas.repository.usuario.RolUsRepository;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;



@Component
@Slf4j
public class GenerarAdmin implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolUsRepository rolUsRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public GenerarAdmin(UsuarioRepository usuarioRepository, RolUsRepository rolUsRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolUsRepository = rolUsRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdmin("Admin");
    }

    private void seedAdmin(String name) {
        if (usuarioRepository.findByNombreRol(name).isEmpty()) {
            Usuario user = new Usuario();
            user.setNomApe("Atlas");
            user.setDniUs(0L);
            user.setMailUs("gym@admin.com");
            user.setPassword(passwordEncoder.encode("migym2026"));

            RolUs vinculoRolUsuario = new RolUs();
            vinculoRolUsuario.setUsuario(user); // Vinculamos el usuario
            vinculoRolUsuario.setRol(rolRepository.findBynomCatUs("Admin"));     // Vinculamos el rol
            vinculoRolUsuario.setEstado(Roles.ACTIVO.toString());

            usuarioRepository.save(user);
            rolUsRepository.save(vinculoRolUsuario);

        }
    }
}
