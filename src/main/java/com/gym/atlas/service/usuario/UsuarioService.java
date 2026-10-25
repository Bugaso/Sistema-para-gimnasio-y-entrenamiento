package com.gym.atlas.service.usuario;

import com.gym.atlas.data.Rol;
import com.gym.atlas.data.RolUs;
import com.gym.atlas.data.Roles;
import com.gym.atlas.data.Usuario;
import com.gym.atlas.dto.*;
import com.gym.atlas.dto.auth.RegisterRequest;
import com.gym.atlas.dto.auth.UserProfileResponse;
import com.gym.atlas.dto.personal.EmpleadoRequest;
import com.gym.atlas.dto.personal.EmpleadoResponse;
import com.gym.atlas.repository.RolRepository;
import com.gym.atlas.repository.RolUsRepository;
import com.gym.atlas.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

import static com.gym.atlas.data.Roles.INACTIVO;

@Service

public class UsuarioService {
    private final UsuarioRepository userRepo;

    private final PasswordEncoder passwordEncoder;

    private final RolUsRepository rolUsRepository;
    private final RolRepository rolUsuarioRepository;

    /****************************************************/
    private final RolRepository rolRepository;

    private final UsuarioRepository usuarioRepository;
    /****************************************************/


    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, RolUsRepository rolUsRepository, RolRepository rolUsuarioRepository, RolRepository rolRepository, UsuarioRepository usuarioRepository1){
        userRepo = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.rolUsRepository = rolUsRepository;
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository1;
    }


    public UserProfileResponse obtenerPerfilPorEmail(String mailUser) {
        Usuario user = userRepo.findByMailUs(mailUser)
                .orElseThrow(() -> new IllegalArgumentException("Usuario o contraseña no válidos"));
        UserProfileResponse userRep = new UserProfileResponse(
                user.getNomApe(),
                user.getMailUs()
        );
        return  userRep;
    }

    public List<Usuario> obtenerUsuariosClientes(){
        List<Usuario> usuarios = userRepo.findByNombreRol("Cliente");
        return usuarios;
    }

    public List<Usuario> obtenerUsuarios(String nomRol){
        List<Usuario> usuarios = userRepo.findByNombreRol(nomRol);
        return usuarios;
    }



    public String registrarPersonal(RegisterRequest request) {

        if (userRepo.findByDniUs(String.valueOf(request.dniUs())) != null){
            return "El usuario ingresado ya está registrado";
        }

        Optional<Rol> rol = Optional.ofNullable(rolUsuarioRepository.findById(request.idRol()).orElse(null));


        if (rol.get() == null){
            return "El rol no existe";
        }




        RolUs rolUs = rolUsRepository.buscarPorRolYUsuario(request.idRol(),request.idUsuario()).orElse(null);
        if(rolUs != null){

            if(rolUs.getEstado() == INACTIVO.toString()){

                return "El usuario ya posee ese rol, pero esta inactivo";
            }

            return "El usuario ya posee ese rol y está activo";

        }

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
        vinculoRolUsuario.setRol(rol.get());     // Vinculamos el rol
        vinculoRolUsuario.setEstado(Roles.ACTIVO.toString());      // Estado por defecto


        rolUsRepository.save(vinculoRolUsuario);
        usuario.getRolesUsuario().add(vinculoRolUsuario);
        // 4. Guardar en base de datos

        userRepo.save(usuario);



        return "El usuario fue registrado exitosamente con el rol "+ rolUs.getRol().getNomCatUs();
    }

    public String modificarPersonal(RegisterRequest request){
        String mensaje = "";
        if (userRepo.findByDniUs(String.valueOf(request.dniUs())) == null){
            return "No se encontro el usuario";
        }

        return mensaje;
    }



    /************************************************************/

    @Transactional
    public MessageResponse crearEmpleado(EmpleadoRequest request) {

        // 1. Validar que el DNI o Email no existan ya en la base de datos
        if (usuarioRepository.findByMailUs(request.mailUs()).isPresent() ||
                usuarioRepository.findByDniUs(request.dniUs()).isPresent()) {
            throw new RuntimeException("El empleado ya existe con ese email o DNI.");
        }

        // 2. Mapear y guardar el nuevo Usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNomApe(request.nomApe());
        nuevoUsuario.setFechaNacimiento(Date.valueOf(request.fechaNacimiento()));
        nuevoUsuario.setDniUs(Long.valueOf(request.dniUs()));
        nuevoUsuario.setTelUs(Long.valueOf(request.telUs()));
        nuevoUsuario.setMailUs(request.mailUs());
        nuevoUsuario.setContacoE(Long.valueOf(request.contacoE()));
        nuevoUsuario.setPassword(passwordEncoder.encode(request.password()));

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // 3. Guardar en RolUs todos los roles seleccionados en el checklist
        if (request.rolesIds() != null && !request.rolesIds().isEmpty()) {
            for (Integer idRol : request.rolesIds()) {
                Rol rolAsignar = rolRepository.findById(Long.valueOf(idRol))
                        .orElseThrow(() -> new RuntimeException("El rol especificado no existe: " + idRol));

                RolUs nuevoRolUs = new RolUs();
                nuevoRolUs.setUsuario(usuarioGuardado);
                nuevoRolUs.setRol(rolAsignar);
                nuevoRolUs.setEstado("ACTIVO");

                rolUsRepository.save(nuevoRolUs);
            }
        }

        return new MessageResponse("Empleado registrado exitosamente con sus roles.");
    }



    // OBTENER EMPLEADOS CON SUS ROLES (Comparación segura con longValue)
    public List<EmpleadoResponse> obtenerEmpleados() {
        List<Usuario> usuarios = usuarioRepository.findAll();

        return usuarios.stream().map(u -> {
            // Comparamos usando .longValue() para evitar que Java falle al comparar Long con Integer
            List<Integer> rolesIds = rolUsRepository.findAll().stream()
                    .filter(ru -> ru.getUsuario() != null
                            && ru.getUsuario().getIdUsuario() != null
                            && u.getIdUsuario() != null
                            && ru.getUsuario().getIdUsuario().longValue() == u.getIdUsuario().longValue())
                    .filter(ru -> ru.getEstado().equalsIgnoreCase("ACTIVO"))
                    .map(ru -> ru.getRol().getIdRol().intValue())
                    .toList();

            return new EmpleadoResponse(
                    u.getIdUsuario().intValue(),
                    u.getNomApe(),
                    u.getFechaNacimiento() != null ? u.getFechaNacimiento().toLocalDate() : null,
                    u.getDniUs() != null ? String.valueOf(u.getDniUs()) : "",
                    u.getTelUs() != null ? String.valueOf(u.getTelUs()) : "",
                    u.getMailUs(),
                    u.getContacoE() != null ? String.valueOf(u.getContacoE()) : "",
                    rolesIds
            );
        }).toList();
    }

    @Transactional
    public MessageResponse actualizarEmpleado(Integer id, EmpleadoRequest request) {
        Long idUsuario = Long.valueOf(id);
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("El empleado especificado no existe."));

        usuario.setNomApe(request.nomApe());
        usuario.setMailUs(request.mailUs());

        if (request.fechaNacimiento() != null) {
            usuario.setFechaNacimiento(Date.valueOf(request.fechaNacimiento()));
        }
        if (request.dniUs() != null && !request.dniUs().isBlank()) {
            usuario.setDniUs(Long.valueOf(request.dniUs()));
        }
        if (request.telUs() != null && !request.telUs().isBlank()) {
            usuario.setTelUs(Long.valueOf(request.telUs()));
        }
        if (request.contacoE() != null && !request.contacoE().isBlank()) {
            usuario.setContacoE(Long.valueOf(request.contacoE()));
        }

        if (request.password() != null && !request.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.password()));
        }

        usuarioRepository.save(usuario);

        // Actualizar la lista de roles en RolUs
        if (request.rolesIds() != null) {
            // 1. Eliminar los roles anteriores vinculados a este usuario
            List<RolUs> rolesAnteriores = rolUsRepository.findAll().stream()
                    .filter(ru -> ru.getUsuario() != null
                            && ru.getUsuario().getIdUsuario() != null
                            && ru.getUsuario().getIdUsuario().longValue() == idUsuario.longValue())
                    .toList();

            if (!rolesAnteriores.isEmpty()) {
                rolUsRepository.deleteAll(rolesAnteriores);
            }

            // 2. Insertar las nuevas asociaciones de roles
            for (Integer idRol : request.rolesIds()) {
                Rol nuevoRol = rolRepository.findById(Long.valueOf(idRol))
                        .orElseThrow(() -> new RuntimeException("El rol especificado no existe: " + idRol));

                RolUs nuevoRolUs = new RolUs();
                nuevoRolUs.setUsuario(usuario);
                nuevoRolUs.setRol(nuevoRol);
                nuevoRolUs.setEstado("ACTIVO");

                rolUsRepository.save(nuevoRolUs);
            }
        }

        return new MessageResponse("Empleado actualizado exitosamente.");
    }

    // 3. ELIMINAR EMPLEADO
    @Transactional
    public MessageResponse eliminarEmpleado(Integer id) {
        Long idUsuario = Long.valueOf(id);

        // 1. Eliminar vínculos en RolUs primero para mantener integridad referencial
        List<RolUs> rolesAsociados = rolUsRepository.findAll().stream()
                .filter(ru -> ru.getUsuario() != null && ru.getUsuario().getIdUsuario().equals(idUsuario))
                .toList();

        rolesAsociados.forEach(rolUs -> rolUs.setEstado("INACTIVO"));
        // 2. Eliminar el registro del usuario
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new RuntimeException("El empleado no existe.");
        }


        return new MessageResponse("Empleado eliminado exitosamente.");
    }


}
