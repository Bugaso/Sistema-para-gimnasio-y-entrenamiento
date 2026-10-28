package com.gym.atlas.service.membresia;

import com.gym.atlas.data.membresia.ClienteMembresia;
import com.gym.atlas.data.membresia.Membresia;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.membresia.RegistrarClienteMembresiaRequest;
import com.gym.atlas.repository.membresia.ClienteMembresiaRepository;
import com.gym.atlas.repository.membresia.MembresiaRepository;
import com.gym.atlas.repository.usuario.UsuarioRepository;
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
    public ClienteMembresia registrarPago(RegistrarClienteMembresiaRequest request) {
        if (request.idUsuario() == null || request.idMembresia() == null) {
            throw new IllegalArgumentException("Los datos de la membresía son obligatorios o no válidos");
        }

        Usuario usuario = usuarioRepository.findById(request.idUsuario())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el usuario con ID: " + request.idUsuario()
                ));

        Membresia membresia = membresiaRepository.findById(request.idMembresia())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe la membresia con ID: "+ request.idMembresia()));

        ClienteMembresia clienteMembresia = new ClienteMembresia();
        clienteMembresia.setUsuario(usuario);
        clienteMembresia.setMembresia(membresia);
        clienteMembresia.setCantCuotas(request.cantCuotas());
        clienteMembresia.setFechaPago(request.fechaPago());
        clienteMembresia.setCostoTotal(request.costoTotal());
        clienteMembresia.setTipoPago(request.tipoPago());



        //clienteMembresia.setFechaVenc(LocalDate.from(LocalDateTime.now().plusDays(membresia.getDuracionMembresia()*cantCuotas)));
        
        //clienteMembresia.setCostoTotal((double) (cantCuotas*membresia.getCostoMembresia()));
        return clienteMembresiaRepository.save(clienteMembresia);
    }

    @Transactional(readOnly = true)
    public List<ClienteMembresia> obtenerHistorial() {
        return clienteMembresiaRepository.findAll();
    }

    public List<ClienteMembresia> obtenerHistorialCliente(Long idUsuario) {

        return clienteMembresiaRepository.findAllByUsuario(idUsuario);

    }
}
