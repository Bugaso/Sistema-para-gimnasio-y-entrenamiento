package com.gym.atlas.service.rutina;

import com.gym.atlas.data.ejercicio.Ejercicio;
import com.gym.atlas.data.rutina.*;
import com.gym.atlas.data.usuario.Usuario;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.rutina.*;
import com.gym.atlas.repository.ejercicio.EjercicioRepository;
import com.gym.atlas.repository.membresia.ClienteMembresiaRepository;
import com.gym.atlas.repository.rutina.*;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final DetalleRutinaRepository detalleRepository;
    private final ClienteCoachRepository asignacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final EjercicioRepository ejercicioRepository;
    private final MedidaEsfuerzoRepository medidaEsfuerzoRepository;
    private final ClienteMembresiaRepository clienteMembresiaRepository;

    public RutinaService(RutinaRepository rutinaRepository, DetalleRutinaRepository detalleRepository,
                         ClienteCoachRepository asignacionRepository, UsuarioRepository usuarioRepository,
                         EjercicioRepository ejercicioRepository, MedidaEsfuerzoRepository medidaEsfuerzoRepository,
                         ClienteMembresiaRepository clienteMembresiaRepository) {
        this.rutinaRepository = rutinaRepository;
        this.detalleRepository = detalleRepository;
        this.asignacionRepository = asignacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.ejercicioRepository = ejercicioRepository;
        this.medidaEsfuerzoRepository = medidaEsfuerzoRepository;
        this.clienteMembresiaRepository = clienteMembresiaRepository;
    }

    public List<Rutina> obtenerPlantillasGenerales() {
        return rutinaRepository.findByEsPlantillaTrue();
    }

    @Transactional
    public MessageResponse crearRutinaCompleta(RutinaCompletaRequest request) {
        Usuario coach = usuarioRepository.findById(Long.valueOf(request.idUsCoach()))
                .orElseThrow(() -> new RuntimeException("Coach no encontrado."));

        // 1. Guardar la Cabecera de la Rutina
        Rutina rutina = new Rutina();
        rutina.setNombreRutina(request.nombreRutina());
        rutina.setDescripcion(request.descripcion());
        rutina.setEsPlantilla(request.esPlantilla());
        rutina.setCoach(coach);
        rutina.setFechaCreacion(LocalDate.now());

        Rutina rutinaGuardada = rutinaRepository.save(rutina);

        // 2. Guardar los Detalles (Ejercicios)
        if(request.detalles() != null && !request.detalles().isEmpty()) {
            for (DetalleRutinaRequest detReq : request.detalles()) {
                DetalleRutina detalle = new DetalleRutina();
                detalle.setRutina(rutinaGuardada);
                detalle.setDiaSemana(detReq.diaSemana());
                detalle.setRangoSeries(detReq.rangoSeries());
                detalle.setRangoRep(detReq.rangoRep());
                detalle.setRangoPeso(detReq.rangoPeso());
                detalle.setTiempoEstimado(detReq.tiempoEstimado());

                Ejercicio ej = ejercicioRepository.findById(detReq.idEjercicio())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado."));
                detalle.setEjercicio(ej);

                if (detReq.idMedidaEsfuerzo() != null) {
                    MedidaEsfuerzo me = medidaEsfuerzoRepository.findById(detReq.idMedidaEsfuerzo()).orElse(null);
                    detalle.setMedidaEsfuerzo(me);
                }

                detalleRepository.save(detalle);
            }
        }

        return new MessageResponse("Rutina creada exitosamente.");
    }

    @Transactional
    public MessageResponse asignarRutinaACliente(AsignacionRutinaRequest request) {
        Usuario cliente = usuarioRepository.findById(Long.valueOf(request.idUsuario()))
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));
        Usuario coach = usuarioRepository.findById(Long.valueOf(request.idUsCoach()))
                .orElseThrow(() -> new RuntimeException("Coach no encontrado."));
        Rutina rutina = rutinaRepository.findById(request.idRutina())
                .orElseThrow(() -> new RuntimeException("Rutina base no encontrada."));

        // VALIDACIÓN DE NEGOCIO: ¿El cliente está activo y tiene membresía con planificación?
        if (cliente.getRolesUsuario() == null || cliente.getRolesUsuario().isEmpty() ||
                !"Activo".equalsIgnoreCase(cliente.getRolesUsuario().getFirst().getEstado())) {
            throw new RuntimeException("El cliente seleccionado está inactivo.");
        }

        if (!clienteMembresiaRepository.tieneMembresiaConPlanificacion(cliente.getIdUsuario())) {
            throw new RuntimeException("El cliente no posee una membresía activa que incluya planificación de rutinas.");
        }

        // Si es una plantilla general, lo ideal sería clonarla aquí para que el coach la pueda editar
        // sin afectar a otros. Por simplicidad inicial, la asignamos directamente.

        ClienteCoach asignacion = new ClienteCoach();
        asignacion.setCliente(cliente);
        asignacion.setCoach(coach);
        asignacion.setRutina(rutina);
        asignacion.setFechaPlan(request.fechaPlan() != null ? request.fechaPlan() : LocalDate.now());
        asignacion.setDuracionPlan(request.duracionPlan());

        asignacionRepository.save(asignacion);

        return new MessageResponse("Rutina asignada exitosamente al cliente " + cliente.getNomApe());
    }

    // 1. Listar todas las rutinas creadas
    public List<RutinaResponse> listarRutinas() {
        return rutinaRepository.findAll().stream()
                .map(r -> new RutinaResponse(
                        r.getIdRutina(),
                        r.getNombreRutina(),
                        r.getDescripcion(),
                        r.getEsPlantilla(),
                        r.getFechaCreacion()
                )).toList();
    }

    // 2. Listar todas las asignaciones
    public List<AsignacionResponse> listarAsignaciones() {
        return asignacionRepository.findAll().stream()
                .map(a -> new AsignacionResponse(
                        a.getIdCliCou(),
                        a.getCliente().getNomApe(),
                        a.getCliente().getDniUs(),
                        a.getRutina().getNombreRutina(),
                        a.getFechaPlan(),
                        a.getDuracionPlan()
                )).toList();
    }

    // 3. Eliminar una asignación
    @Transactional
    public MessageResponse eliminarAsignacion(Integer id) {
        if (!asignacionRepository.existsById(id)) {
            throw new RuntimeException("La asignación no existe.");
        }
        asignacionRepository.deleteById(id);
        return new MessageResponse("Asignación eliminada correctamente.");
    }

    // Obtener rutina completa con sus detalles para el modal "Ver"
    public RutinaConDetallesResponse obtenerRutinaPorId(Integer id) {
        Rutina r = rutinaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rutina no encontrada."));

        List<DetalleRutinaResponse> detalles = detalleRepository.findByRutinaIdRutina(id).stream()
                .map(d -> new DetalleRutinaResponse(
                        d.getIdDetalle(),
                        d.getDiaSemana(),
                        d.getEjercicio().getNomEjercicio(), // Ajusta si tu campo de nombre es distinto
                        d.getRangoSeries(),
                        d.getRangoRep(),
                        d.getRangoPeso(),
                        d.getTiempoEstimado(),
                        d.getMedidaEsfuerzo() != null ? d.getMedidaEsfuerzo().getNombreMedida() : "Sin medida"
                )).toList();

        return new RutinaConDetallesResponse(
                r.getIdRutina(),
                r.getNombreRutina(),
                r.getDescripcion(),
                r.getEsPlantilla(),
                r.getFechaCreacion(),
                detalles
        );
    }

    // Eliminar rutina (borrará en cascada los detalles gracias a la BD o JPA)
    @Transactional
    public MessageResponse eliminarRutina(Integer id) {
        if (!rutinaRepository.existsById(id)) {
            throw new RuntimeException("La rutina no existe.");
        }
        rutinaRepository.deleteById(id);
        return new MessageResponse("Rutina eliminada correctamente.");
    }
}