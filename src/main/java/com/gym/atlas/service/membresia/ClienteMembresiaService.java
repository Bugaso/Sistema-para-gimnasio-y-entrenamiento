package com.gym.atlas.service.membresia;

import com.gym.atlas.data.membresia.ClienteMembresia;
import com.gym.atlas.data.membresia.Membresia;
import com.gym.atlas.data.membresia.TipoMembresia;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.membresia.RegistrarClienteMembresiaRequest;
import com.gym.atlas.repository.membresia.ClienteMembresiaRepository;
import com.gym.atlas.repository.membresia.MembresiaRepository;
import com.gym.atlas.repository.membresia.TipoMembresiaRepository;
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
    private final TipoMembresiaRepository tipoMembresiaRepository;

    public ClienteMembresiaService(
            ClienteMembresiaRepository clienteMembresiaRepository,
            MembresiaRepository membresiaRepository,
            UsuarioRepository usuarioRepository, TipoMembresiaRepository tipoMembresiaRepository
    ) {
        this.clienteMembresiaRepository = clienteMembresiaRepository;
        this.membresiaRepository = membresiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.tipoMembresiaRepository = tipoMembresiaRepository;
    }

    @Transactional
    public ClienteMembresia registrarPago(RegistrarClienteMembresiaRequest request) {
        if (request.idUsuario() == null || request.idTipoMembresia() == null) {
            throw new IllegalArgumentException("Los datos de la membresía son obligatorios o no válidos");
        }

        Usuario usuario = usuarioRepository.findById(request.idUsuario())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el usuario con ID: " + request.idUsuario()
                ));

        TipoMembresia tipoMembresia = tipoMembresiaRepository.findById(request.idTipoMembresia())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe la membresia con ID: "+ request.idTipoMembresia()));

        ClienteMembresia clienteMembresia = new ClienteMembresia();
        clienteMembresia.setUsuario(usuario);
        clienteMembresia.setIdTipoMembresia(tipoMembresia);
        clienteMembresia.setCantCuotas(request.cantCuotas());
        clienteMembresia.setFechaPago(request.fechaPago());
        clienteMembresia.setCostoTotal(request.costoTotal());
        clienteMembresia.setTipoPago(request.tipoPago());

        if(request.tipoPago().equalsIgnoreCase("AMBOS")){
            clienteMembresia.setCantEfect(request.cantEfect());
        }else{
            clienteMembresia.setCantEfect(0.0);
        }


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
