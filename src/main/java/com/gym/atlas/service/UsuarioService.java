package com.gym.atlas.service;

import com.gym.atlas.data.Usuario;
import com.gym.atlas.dto.UserProfileResponse;
import com.gym.atlas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository userRepo;

    public UsuarioService(UsuarioRepository usuarioRepository){
        userRepo = usuarioRepository;
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
        List<Usuario> usuarios = userRepo.findByIdCatUs(2);
        return usuarios;
    }
}
