package com.gym.atlas.service.usuario;

import com.gym.atlas.data.membresia.ClienteMembresia;
import com.gym.atlas.data.usuario.AsistenciaCliente;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.asistencia.AsistenciaRequest;
import com.gym.atlas.dto.asistencia.ValidacionAsistenciaResponse;
import com.gym.atlas.dto.usuario.EstadoAsistenciaResponse;
import com.gym.atlas.repository.membresia.ClienteMembresiaRepository;
import com.gym.atlas.repository.usuario.AsistenciaClienteRepository;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import com.gym.atlas.service.membresia.ClienteMembresiaService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AsistenciaService {

    private final AsistenciaClienteRepository asistenciaRepo;
    private final UsuarioRepository usuarioRepository;
    private final ClienteMembresiaRepository cliMemRepository;


    public AsistenciaService(AsistenciaClienteRepository asistenciaRepo, UsuarioRepository usuarioRepository, ClienteMembresiaRepository cliMemRepository) {
        this.asistenciaRepo = asistenciaRepo;
        this.usuarioRepository = usuarioRepository;
        this.cliMemRepository = cliMemRepository;

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
        String emailRecepcionista = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario recepcionista = usuarioRepository.findByMailUs(emailRecepcionista)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrado."));

        Usuario cliente = usuarioRepository.findById(Long.valueOf(request.idUsuario()))
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        Optional<AsistenciaCliente> registroAbierto = asistenciaRepo.findFirstByClienteIdUsuarioAndFechaHorarioSalidaIsNullOrderByFechaHorarioEntradaDesc(Math.toIntExact(cliente.getIdUsuario()));

        if (registroAbierto.isPresent()) {
            // REGISTRAR SALIDA
            AsistenciaCliente asistencia = registroAbierto.get();
            asistencia.setFechaHorarioSalida(LocalDateTime.now());
            asistenciaRepo.save(asistencia);
            return new MessageResponse("Salida registrada con éxito a las " + asistencia.getFechaHorarioSalida().toLocalTime());
        } else {
            // REGISTRAR ENTRADA
            AsistenciaCliente nuevaAsistencia = new AsistenciaCliente();
            nuevaAsistencia.setCliente(cliente);
            nuevaAsistencia.setRecepcionista(recepcionista);
            nuevaAsistencia.setFechaHorarioEntrada(LocalDateTime.now());

            // SOLUCIÓN: Solo buscar la membresía si el ID no es nulo (Ingresos regulares)
            if (request.idClienteMembresia() != null) {
                ClienteMembresia cliMem = cliMemRepository.findById(request.idClienteMembresia()).orElse(null);
                nuevaAsistencia.setIdCliMem(cliMem);
            }

            asistenciaRepo.save(nuevaAsistencia);
            return new MessageResponse("Acceso Permitido. Entrada registrada a las " + nuevaAsistencia.getFechaHorarioEntrada().toLocalTime());
        }
    }

    public ValidacionAsistenciaResponse validarLimiteAsistencia(Long idClienteMembresia) {
        ClienteMembresia cliMem = cliMemRepository.findById(idClienteMembresia).orElseThrow();
        LocalDate hoy = LocalDate.now();

        LocalDateTime inicioSemana = hoy.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime finSemana = hoy.with(DayOfWeek.SUNDAY).atTime(LocalTime.MAX);

        List<AsistenciaCliente> asisCliList = asistenciaRepo.findAsistenciasPorMembresiaYSemana(
                idClienteMembresia,
                inicioSemana,
                finSemana
        );

        boolean ingresoHoy = asisCliList.stream()
                .anyMatch(a -> a.getFechaHorarioEntrada().toLocalDate().equals(hoy));

        int diasPermitidos = cliMem.getIdTipoMembresia().getDiasAsistencia();
        String nombreMembresia = cliMem.getIdTipoMembresia().getMembresia().getDescripMembresia();

        // SOLUCIÓN: Restauramos la evaluación del límite semanal
        boolean limiteExcedido = asisCliList.size() >= diasPermitidos;

        if (ingresoHoy) {
            limiteExcedido = true; // Doble sesión cuenta como excedido
        }

        int asistenciasExtra = Math.max(0, asisCliList.size() - diasPermitidos);
        String ultimoIngreso = asisCliList.isEmpty() ? "Ninguno esta semana"
                : asisCliList.get(asisCliList.size() - 1).getFechaHorarioEntrada().toLocalDate().toString();

        return new ValidacionAsistenciaResponse(
                limiteExcedido,
                nombreMembresia,
                diasPermitidos,
                asisCliList.size(),
                ultimoIngreso,
                asistenciasExtra
        );
    }
}