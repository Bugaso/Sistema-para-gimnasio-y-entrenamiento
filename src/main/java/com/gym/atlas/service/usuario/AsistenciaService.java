package com.gym.atlas.service.usuario;

import com.gym.atlas.data.membresia.ClienteMembresia;
import com.gym.atlas.data.usuario.AsistenciaCliente;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.usuario.AsistenciaRequest;
import com.gym.atlas.dto.usuario.EstadoAsistenciaResponse;
import com.gym.atlas.repository.membresia.ClienteMembresiaRepository;
import com.gym.atlas.repository.usuario.AsistenciaClienteRepository;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AsistenciaService {

    private final AsistenciaClienteRepository asistenciaRepo;
    private final UsuarioRepository usuarioRepository;
    private final ClienteMembresiaRepository membresiaRepository;

    public AsistenciaService(AsistenciaClienteRepository asistenciaRepo, UsuarioRepository usuarioRepository, ClienteMembresiaRepository membresiaRepository) {
        this.asistenciaRepo = asistenciaRepo;
        this.usuarioRepository = usuarioRepository;
        this.membresiaRepository = membresiaRepository;
    }

    public EstadoAsistenciaResponse obtenerEstadoActual(Integer idUsuario) {
        Optional<AsistenciaCliente> registroAbierto = asistenciaRepo.findFirstByClienteIdUsuarioAndFechaHorarioSalidaIsNullOrderByFechaHorarioEntradaDesc(idUsuario);
        if (registroAbierto.isPresent()) {
            return new EstadoAsistenciaResponse(true, "El cliente está actualmente en el gimnasio.");
        }
        return new EstadoAsistenciaResponse(false, "El cliente está fuera del gimnasio.");
    }

    @Transactional
    public MessageResponse registrarAsistencia(AsistenciaRequest request) {
        // 1. Obtener recepcionista logueado (como lo pedía Baltasar)
        String emailRecepcionista = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario recepcionista = usuarioRepository.findByMailUs(emailRecepcionista)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrado."));

        // 2. Obtener cliente
        Usuario cliente = usuarioRepository.findById(Long.valueOf(request.idUsuario()))
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        // Validar que el cliente tenga una membresía activa antes de dejarlo entrar
        // if (!membresiaRepository.tieneMembresiaActiva(cliente.getIdUsuario())) {
        //     throw new RuntimeException("Acceso Denegado: El cliente no posee una membresía activa.");
        // }


        // 3. Buscar si tiene una entrada sin salida
        Optional<AsistenciaCliente> registroAbierto = asistenciaRepo.findFirstByClienteIdUsuarioAndFechaHorarioSalidaIsNullOrderByFechaHorarioEntradaDesc(Math.toIntExact(cliente.getIdUsuario()));



        if (registroAbierto.isPresent()) {
            // REGISTRAR SALIDA
            AsistenciaCliente asistencia = registroAbierto.get();
            asistencia.setFechaHorarioSalida(LocalDateTime.now());

            asistenciaRepo.save(asistencia);
            return new MessageResponse("Salida registrada con éxito a las " + asistencia.getFechaHorarioSalida().toLocalTime());
        } else {
            ClienteMembresia cliMem = membresiaRepository.findById(request.idClienteMembresia()).orElseThrow();
            // REGISTRAR ENTRADA
            AsistenciaCliente nuevaAsistencia = new AsistenciaCliente();
            nuevaAsistencia.setCliente(cliente);
            nuevaAsistencia.setRecepcionista(recepcionista);
            nuevaAsistencia.setFechaHorarioEntrada(LocalDateTime.now());
            nuevaAsistencia.setIdCliMem(cliMem);
            asistenciaRepo.save(nuevaAsistencia);
            return new MessageResponse("Acceso Permitido. Entrada registrada a las " + nuevaAsistencia.getFechaHorarioEntrada().toLocalTime());
        }
    }
}