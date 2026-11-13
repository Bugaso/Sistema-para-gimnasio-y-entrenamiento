package com.gym.atlas.service.membresia;

import com.gym.atlas.data.membresia.ClienteMembresia;
import com.gym.atlas.data.membresia.Membresia;
import com.gym.atlas.data.membresia.TipoMembresia;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.membresia.ClienteMembresiaDTO;
import com.gym.atlas.dto.membresia.HistorialPagoClienteResponse;
import com.gym.atlas.dto.membresia.RegistrarClienteMembresiaRequest;
import com.gym.atlas.repository.membresia.ClienteMembresiaRepository;
import com.gym.atlas.repository.membresia.MembresiaRepository;
import com.gym.atlas.repository.membresia.TipoMembresiaRepository;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
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

    // Se ejecuta automáticamente todos los días a la medianoche
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void actualizarEstadosVencidos() {
        LocalDate hoy = LocalDate.now();
        clienteMembresiaRepository.findAll().forEach(clienteMembresia -> {
            LocalDate vencimiento = calcularVencimiento(clienteMembresia).toLocalDate();
            if (vencimiento.isBefore(hoy) && "ACTIVO".equalsIgnoreCase(clienteMembresia.getEstado())) {
                clienteMembresia.setEstado("VENCIDO");
                clienteMembresiaRepository.save(clienteMembresia);
            }
        });
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
        clienteMembresia.setEstado("ACTIVO");
        if(request.tipoPago().equalsIgnoreCase("AMBOS")){
            clienteMembresia.setCantEfect(request.cantEfect());
        }else{
            clienteMembresia.setCantEfect(0.0);
        }


        //clienteMembresia.setFechaVenc(LocalDate.from(LocalDateTime.now().plusDays(membresia.getDuracionMembresia()*cantCuotas)));
        
        //clienteMembresia.setCostoTotal((double) (cantCuotas*membresia.getCostoMembresia()));
        return clienteMembresiaRepository.save(clienteMembresia);
    }

    @Transactional
    public List<ClienteMembresiaDTO> obtenerHistorial() {
        List<ClienteMembresia> listaCliMem = clienteMembresiaRepository.findAll();
        return listaCliMem.stream().map(cliMem -> {
            return new ClienteMembresiaDTO(
                    cliMem.getIdCliMem(),
                    cliMem.getUsuario(),
                    cliMem.getIdTipoMembresia().getIdTipoMem(),
                    cliMem.getIdTipoMembresia().getMembresia().getDescripMembresia(),
                    cliMem.getIdTipoMembresia().getDiasAsistencia(),
                    cliMem.getCantCuotas(),
                    cliMem.getFechaPago().toLocalDate().toString(),
                    calcularVencimiento(cliMem).toLocalDate().toString(),
                    obtenerEstadoActual(cliMem),
                    cliMem.getCantEfect(),
                    cliMem.getCostoTotal()
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<HistorialPagoClienteResponse> obtenerHistorialCliente(Long idUsuario) {
        return clienteMembresiaRepository.findAllByUsuarioIdUsuario(idUsuario).stream()
                .sorted(Comparator.comparing(ClienteMembresia::getFechaPago).reversed())
                .map(clienteMembresia -> new HistorialPagoClienteResponse(
                        clienteMembresia.getIdCliMem(),
                        clienteMembresia.getIdTipoMembresia().getMembresia().getDescripMembresia(),
                        clienteMembresia.getIdTipoMembresia().getDiasAsistencia(),
                        clienteMembresia.getCantCuotas(),
                        clienteMembresia.getFechaPago().toLocalDate().toString(),
                        calcularVencimiento(clienteMembresia).toLocalDate().toString(),
                        obtenerEstadoActual(clienteMembresia),
                        clienteMembresia.getCostoTotal()
                ))
                .toList();
    }

    private LocalDateTime calcularVencimiento(ClienteMembresia clienteMembresia) {
        return clienteMembresia.getFechaPago().plusDays(
                (long) clienteMembresia.getIdTipoMembresia().getDuracionMembresia()
                        * clienteMembresia.getCantCuotas()
        );
    }

    private String obtenerEstadoActual(ClienteMembresia clienteMembresia) {
        String estado = clienteMembresia.getEstado();
        if ("ACTIVO".equalsIgnoreCase(estado)
                && calcularVencimiento(clienteMembresia).toLocalDate().isBefore(LocalDate.now())) {
            return "VENCIDO";
        }
        return estado;
    }

    public MessageResponse borrarPagoCliente(Long idCliMem) {
        ClienteMembresia clienteMembresia = clienteMembresiaRepository.findById(idCliMem).orElseThrow();
        clienteMembresia.setEstado("BAJA");
        clienteMembresiaRepository.save(clienteMembresia);
        return new MessageResponse("Eliminacion con exito");
    }
}
