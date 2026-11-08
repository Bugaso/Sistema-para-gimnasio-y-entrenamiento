package com.gym.atlas.service.membresia;

import com.gym.atlas.data.membresia.ClienteMembresia;
import com.gym.atlas.data.membresia.Membresia;
import com.gym.atlas.data.membresia.TipoMembresia;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.membresia.ClienteMembresiaDTO;
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
        // Lógica para buscar membresías ACTIVAS cuya fecha de vencimiento ya pasó,
        // cambiarles el estado a VENCIDO, y hacer un saveAll().
        clienteMembresiaRepository.findAll().stream().forEach(cliMem ->{
            LocalDateTime vencimiento = cliMem.getFechaPago().plusDays(
                    cliMem.getIdTipoMembresia().getDuracionMembresia()*cliMem.getCantCuotas());

            String estado =  cliMem.getEstado();
            if(vencimiento.isBefore(LocalDateTime.now())
                    && estado.equalsIgnoreCase("VENCIDO")
                    && estado.equalsIgnoreCase("BAJA")){

                cliMem.setEstado("VENCIDO");
                System.out.println("EL ESTADO SE ACTUALIZA A VENCIDO");
                clienteMembresiaRepository.save(cliMem);
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

    @Transactional()
    public List<ClienteMembresiaDTO> obtenerHistorial() {
        List<ClienteMembresiaDTO> listaCliMemDTO;
        List<ClienteMembresia> listaCliMem = clienteMembresiaRepository.findAll();
        if(listaCliMem.isEmpty()){
            return null;
        }

        listaCliMemDTO = listaCliMem.stream().map(cliMem -> {

                        ClienteMembresiaDTO clienteMembresiaDTO = new ClienteMembresiaDTO(
                            cliMem.getIdCliMem(),
                            cliMem.getUsuario(),
                            cliMem.getIdTipoMembresia().getIdTipoMem(),
                            cliMem.getIdTipoMembresia().getMembresia().getDescripMembresia(),
                            cliMem.getIdTipoMembresia().getDiasAsistencia(),
                            cliMem.getCantCuotas(),
                            cliMem.getFechaPago().toLocalDate().toString(),
                            cliMem.getEstado(),
                            cliMem.getCantEfect(),
                            cliMem.getCostoTotal()
                        );
            System.out.println("DTO DE CLIENTEMEMBRESIA: " +clienteMembresiaDTO.toString());
                    return clienteMembresiaDTO;
                }
        ).toList();

        return listaCliMemDTO;
    }

    public List<ClienteMembresiaDTO> obtenerHistorialCliente(Long idUsuario) {
        List<ClienteMembresia> cliMemList = clienteMembresiaRepository.findAllByUsuarioIdUsuario(idUsuario);
        if(cliMemList.isEmpty()){
            return null;
        }

        List<ClienteMembresiaDTO> cliMemListDTO = cliMemList.stream().map( cliMem ->{


                ClienteMembresiaDTO cliMemDTO = new ClienteMembresiaDTO(
                        cliMem.getIdCliMem(),
                        cliMem.getUsuario(),
                        cliMem.getIdTipoMembresia().getIdTipoMem(),
                        cliMem.getIdTipoMembresia().getMembresia().getDescripMembresia(),
                        cliMem.getIdTipoMembresia().getDiasAsistencia(),
                        cliMem.getCantCuotas(),
                        cliMem.getFechaPago().toString(),
                        cliMem.getEstado(),
                        cliMem.getCantEfect(),
                        cliMem.getCostoTotal()
                );



                return cliMemDTO;
        }).toList();
        return cliMemListDTO;

    }

    public MessageResponse borrarPagoCliente(Long idCliMem) {
        ClienteMembresia clienteMembresia = clienteMembresiaRepository.findById(idCliMem).orElseThrow();
        clienteMembresia.setEstado("BAJA");
        clienteMembresiaRepository.save(clienteMembresia);
        return new MessageResponse("Eliminacion con exito");
    }
}
