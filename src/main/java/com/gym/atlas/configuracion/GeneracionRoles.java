package com.gym.atlas.configuracion;

import com.gym.atlas.data.usuario.Rol;
import com.gym.atlas.repository.usuario.RolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.logging.Logger;

@Component
public class GeneracionRoles implements CommandLineRunner {

    private final RolRepository roleRepository;
    private static final Logger log = (Logger) LoggerFactory.getLogger(GeneracionRoles.class);
    public GeneracionRoles(RolRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedRole("Admin");
        seedRole("Cliente");
        seedRole("Recepcionista");
        seedRole("Coach");
        log.info("Roles inicializados correctamente.");
    }

    private void seedRole(String name) {
        if (roleRepository.findBynomCatUs(name) == null) {
            Rol role = new Rol();
            role.setNomCatUs(name);
            role.setEstado(true);
            roleRepository.save(role);
            log.info("Rol creado:"+role.toString());
        }
    }
}
