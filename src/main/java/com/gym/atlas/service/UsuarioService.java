package com.gym.atlas.service;

import com.gym.atlas.data.Rol;
import com.gym.atlas.data.RolUs;
import com.gym.atlas.data.Roles;
import com.gym.atlas.data.Usuario;
import com.gym.atlas.dto.*;
import com.gym.atlas.repository.RolRepository;
import com.gym.atlas.repository.RolUsRepository;
import com.gym.atlas.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static com.gym.atlas.data.Roles.ACTIVO;
import static com.gym.atlas.data.Roles.INACTIVO;

@Service
public class UsuarioService {
    private final UsuarioRepository userRepo;

    private final PasswordEncoder passwordEncoder;

    private final RolUsRepository rolUsRepository;
    private final RolRepository rolUsuarioRepository;


    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, RolUsRepository rolUsRepository, RolRepository rolUsuarioRepository){
        userRepo = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.rolUsRepository = rolUsRepository;
        this.rolUsuarioRepository = rolUsuarioRepository;
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
}
