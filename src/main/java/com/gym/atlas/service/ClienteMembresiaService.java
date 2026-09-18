package com.gym.atlas.service;

import com.gym.atlas.data.ClienteMembresia;
import com.gym.atlas.data.Membresia;
import com.gym.atlas.data.Usuario;
import com.gym.atlas.dto.RegistrarMembresiaRequest;
import com.gym.atlas.repository.ClienteMembresiaRepository;
import com.gym.atlas.repository.MembresiaRepository;
import com.gym.atlas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClienteMembresiaService {

    private final ClienteMembresiaRepository clienteMembresiaRepository;
    private final MembresiaRepository membresiaRepository;
    private final UsuarioRepository usuarioRepository;

    public ClienteMembresiaService(
            ClienteMembresiaRepository clienteMembresiaRepository,
            MembresiaRepository membresiaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.clienteMembresiaRepository = clienteMembresiaRepository;
        this.membresiaRepository = membresiaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ClienteMembresia registrarPago(RegistrarMembresiaRequest request) {
        if (request.idUsuario() == null
                || request.descripMembresia() == null
                || request.descripMembresia().isBlank()
                || request.costoMembresia() == null
                || request.duracionMembresia() == null
                || request.duracionMembresia() <= 0) {
            throw new IllegalArgumentException("Los datos de la membresía son obligatorios y válidos");
        }

        Usuario usuario = usuarioRepository.findById(request.idUsuario())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el usuario con ID: " + request.idUsuario()
                ));

        Membresia membresia = new Membresia();
        membresia.setDescripMembresia(request.descripMembresia());
        membresia.setCostoMembresia(request.costoMembresia());
        membresia.setDuracionMembresia(request.duracionMembresia());
        membresiaRepository.save(membresia);

        ClienteMembresia clienteMembresia = new ClienteMembresia();
        clienteMembresia.setUsuario(usuario);
        clienteMembresia.setMembresia(membresia);
        clienteMembresia.setFechaPago(LocalDateTime.now());

        return clienteMembresiaRepository.save(clienteMembresia);
    }

    @Transactional(readOnly = true)
    public List<ClienteMembresia> obtenerHistorial() {
        return clienteMembresiaRepository.findAll();
    }
}
