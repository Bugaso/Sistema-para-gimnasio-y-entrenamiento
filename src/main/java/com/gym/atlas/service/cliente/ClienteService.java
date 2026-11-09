package com.gym.atlas.service.cliente;

import com.gym.atlas.data.rutina.ClienteCoach;
import com.gym.atlas.data.rutina.HistorialRutina;
import com.gym.atlas.data.rutina.HistorialSerie;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.cliente.ClienteRutinaResponse;
import com.gym.atlas.dto.cliente.PerfilClienteRequest;
import com.gym.atlas.dto.cliente.PerfilClienteResponse;
import com.gym.atlas.dto.rutina.DetalleRutinaResponse;
import com.gym.atlas.dto.rutina.RutinaConDetallesResponse;
import com.gym.atlas.repository.rutina.DetalleRutinaRepository;
import com.gym.atlas.repository.rutina.ClienteCoachRepository;
import com.gym.atlas.repository.rutina.HistorialRutinaRepository;
import com.gym.atlas.repository.rutina.HistorialSerieRepository;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClienteService {

    // 1. TODOS los repositorios van aquí arriba
    private final UsuarioRepository usuarioRepository;
    private final ClienteCoachRepository asignacionRepository;
    private final DetalleRutinaRepository detalleRutinaRepository;
    private final HistorialRutinaRepository historialRutinaRepository;
    private final HistorialSerieRepository historialSerieRepository;

    // 2. Inyección de dependencias en el constructor único
    public ClienteService(
            UsuarioRepository usuarioRepository,
            ClienteCoachRepository asignacionRepository,
            DetalleRutinaRepository detalleRutinaRepository,
            HistorialRutinaRepository historialRutinaRepository,
            HistorialSerieRepository historialSerieRepository) {
        this.usuarioRepository = usuarioRepository;
        this.asignacionRepository = asignacionRepository;
        this.detalleRutinaRepository = detalleRutinaRepository;
        this.historialRutinaRepository = historialRutinaRepository;
        this.historialSerieRepository = historialSerieRepository;
    }

    // Método auxiliar para obtener el usuario logueado
    private Usuario obtenerUsuarioLogueado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByMailUs(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado en la base de datos"));
    }

    public PerfilClienteResponse obtenerPerfil() {
        Usuario usuario = obtenerUsuarioLogueado();

        return new PerfilClienteResponse(
                usuario.getIdUsuario(),
                usuario.getNomApe(),
                usuario.getDniUs(),
                usuario.getFechaNacimiento() == null ? null : usuario.getFechaNacimiento().toLocalDate(),
                usuario.getTelUs(),
                usuario.getMailUs(),
                usuario.getContacoE()
        );
    }

    public MessageResponse actualizarPerfil(PerfilClienteRequest request) {
        Usuario usuario = obtenerUsuarioLogueado();

        usuario.setNomApe(request.nomApe());
        if (request.fechaNacimiento() != null) {
            usuario.setFechaNacimiento(Date.valueOf(request.fechaNacimiento()));
        }
        if (request.telUs() != null && !request.telUs().isBlank()) {
            usuario.setTelUs(Long.valueOf(request.telUs()));
        }
        usuario.setMailUs(request.mailUs());
        usuario.setContacoE(request.contacoE() == null || request.contacoE().isBlank()
                ? null
                : Long.valueOf(request.contacoE()));

        usuarioRepository.save(usuario);

        return new MessageResponse("Perfil actualizado correctamente");
    }

    // MÉTODO 1: OBTENER RUTINA ACTIVA DEL CLIENTE
    @Transactional(readOnly = true)
    public ClienteRutinaResponse obtenerRutinaActiva() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        List<ClienteCoach> asignaciones = asignacionRepository.findByClienteMailUs(email);

        ClienteCoach asignacion = asignaciones.stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No tienes rutinas asignadas actualmente."));

        var rutina = asignacion.getRutina();
        List<DetalleRutinaResponse> detalles = detalleRutinaRepository
                .findByRutinaIdRutina(rutina.getIdRutina())
                .stream()
                .map(detalle -> new DetalleRutinaResponse(
                        detalle.getIdDetalle(),
                        detalle.getDiaSemana(),
                        detalle.getEjercicio().getIdEjercicio(),
                        detalle.getEjercicio().getNomEjercicio(),
                        detalle.getRangoSeries(),
                        detalle.getRangoRep(),
                        detalle.getRangoPeso(),
                        detalle.getTiempoEstimado(),
                        detalle.getMedidaEsfuerzo(),
                        detalle.getCantMedida()
                ))
                .toList();

        return new ClienteRutinaResponse(new RutinaConDetallesResponse(
                rutina.getIdRutina(),
                rutina.getNombreRutina(),
                rutina.getDescripcion(),
                rutina.getEsPlantilla(),
                rutina.getFechaCreacion(),
                detalles
        ));
    }

    // MÉTODO 2: OBTENER EL HISTORIAL DE SESIÓN POR FECHA
    public Map<String, Object> obtenerHistorialPorFecha(String fechaStr) {
        LocalDate fecha = LocalDate.parse(fechaStr);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 1. Encontrar la asignación del cliente
        List<ClienteCoach> asignaciones = asignacionRepository.findByClienteMailUs(email);
        if (asignaciones.isEmpty()) return Map.of(); // Devuelve vacío si no tiene coach

        ClienteCoach asignacion = asignaciones.get(0);

        // 2. Buscar todos los historiales de esa asignación
        List<HistorialRutina> historiales = historialRutinaRepository.findByAsignacionIdCliCouOrderByFechaRegistroDesc(asignacion.getIdCliCou());

        // 3. Filtrar para ver si entrenó exactamente en la fecha que pide el calendario
        Optional<HistorialRutina> historialDelDia = historiales.stream()
                .filter(h -> h.getFechaRegistro().equals(fecha)) // Convertimos a LocalDate para comparar seguro
                .findFirst();

        // Si no entrenó ese día, devolvemos un JSON vacío para que el frontend muestre "Planificado"
        if (historialDelDia.isEmpty()) {
            return Map.of("ejerciciosRealizados", List.of());
        }

        // 4. Si SÍ entrenó, buscamos el peso y repeticiones
        List<HistorialSerie> series = historialSerieRepository.findByHistorialRutinaIdHistRut(historialDelDia.get().getIdHistRut());

        List<Map<String, Object>> ejerciciosRealizados = series.stream()
                .map(s -> {
                    Map<String, Object> dto = new HashMap<>();

                    dto.put("nombreEjercicio", s.getEjercicio().getNomEjercicio());
                    dto.put("seriesRealizadas", s.getNroSerie());
                    dto.put("repsRealizadas", s.getNroRepeticiones());
                    dto.put("pesoRealizado", s.getNroPeso());

                    return dto;
                })
                .toList();

        return Map.of("ejerciciosRealizados", ejerciciosRealizados);
    }
}