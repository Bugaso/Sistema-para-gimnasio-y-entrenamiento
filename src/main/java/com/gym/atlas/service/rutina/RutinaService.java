package com.gym.atlas.service.rutina;

import com.gym.atlas.repository.rutina.DetalleRutinaRepository;

import com.gym.atlas.data.ejercicio.Ejercicio;
import com.gym.atlas.data.rutina.*;
import com.gym.atlas.data.usuario.Usuario;

import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.rutina.*;
import com.gym.atlas.repository.ejercicio.EjercicioRepository;
import com.gym.atlas.repository.membresia.ClienteMembresiaRepository;
import com.gym.atlas.repository.rutina.*;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;

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
        String emailCoach = SecurityContextHolder.getContext().getAuthentication().getName();


        Usuario coach = usuarioRepository.findByMailUs(emailCoach)
                .orElseThrow(() -> new RuntimeException("Coach no encontrado o token inválido."));

        // 1. Guardar la Cabecera de la Rutina
        Rutina rutina = new Rutina();
        rutina.setNombreRutina(request.nombreRutina());
        rutina.setDescripcion(request.descripcion());
        rutina.setEsPlantilla(request.esPlantilla());
        rutina.setIdUsCoach(coach);
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
                detalle.setMedidaEsfuerzo(detReq.medidaEsfuerzo());
                detalle.setCantMedida(detReq.cantMedida());
                Ejercicio ej = ejercicioRepository.findById(detReq.idEjercicio())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado."));
                detalle.setEjercicio(ej);


                detalleRepository.save(detalle);
            }
        }

        return new MessageResponse("Rutina creada exitosamente.");
    }

    @Transactional
    public MessageResponse asignarRutinaACliente(AsignacionRutinaRequest request) {


        String emailCoach = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario coach = usuarioRepository.findByMailUs(emailCoach)
                .orElseThrow(() -> new RuntimeException("Coach no encontrado o token inválido."));

        Usuario cliente = usuarioRepository.findById(Long.valueOf(request.idUsuario()))
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

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
        List<Rutina> lista = rutinaRepository.findAll();
        if (lista.isEmpty()){
            List<RutinaResponse> listaVacia = List.of(
            );
            return listaVacia;
        }
        return lista.stream().map(rutina -> {
            return new RutinaResponse(
                    rutina.getIdRutina(),
                    rutina.getNombreRutina(),
                    rutina.getDescripcion(),
                    rutina.getEsPlantilla(),
                    rutina.getFechaCreacion()
            );
        }).toList();
    }

    // 2. Listar todas las asignaciones
    public List<AsignacionResponse> listarAsignaciones() {
        return asignacionRepository.findAll().stream()
                .map(a -> new AsignacionResponse(
                        a.getIdCliCou(),
                        a.getCliente().getNomApe(),
                        a.getCliente().getDniUs(),
                        a.getRutina().getIdRutina(),
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
                        d.getEjercicio().getIdEjercicio(),
                        d.getEjercicio().getNomEjercicio(),
                        d.getRangoSeries(),
                        d.getRangoRep(),
                        d.getRangoPeso(),
                        d.getTiempoEstimado(),
                        d.getMedidaEsfuerzo(),
                        d.getCantMedida()
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

    @Transactional
    public MessageResponse actualizarRutinaCompleta(Integer idRutina, RutinaCompletaRequest request) {
        Rutina rutina = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new RuntimeException("Rutina no encontrada."));

        // 1. Actualizar cabecera
        rutina.setNombreRutina(request.nombreRutina());
        rutina.setDescripcion(request.descripcion());
        rutina.setEsPlantilla(request.esPlantilla());
        rutinaRepository.save(rutina);

        // 2. Eliminar detalles anteriores
        detalleRepository.deleteAll(detalleRepository.findByRutinaIdRutina(idRutina));

        // 3. Insertar nuevos detalles
        if(request.detalles().isEmpty() || request.detalles() == null) {
            return new MessageResponse("Detalle de rutina vacio");
        }

        List<DetalleRutinaRequest> listaDetalles = request.detalles();

        listaDetalles.stream().forEach(detRutDTO ->{
            System.out.println("ID DE MEDIDA DE ESFUERZO: "+detRutDTO.medidaEsfuerzo());
            Ejercicio eje = ejercicioRepository.findById(detRutDTO.idEjercicio()).orElseThrow();


            DetalleRutina detRut =new DetalleRutina();
            detRut.setRutina(rutina);
            detRut.setEjercicio(eje);
            detRut.setMedidaEsfuerzo(detRutDTO.medidaEsfuerzo());
            detRut.setCantMedida(detRutDTO.cantMedida());
            detRut.setDiaSemana(detRutDTO.diaSemana());
            detRut.setRangoSeries(detRutDTO.rangoSeries());
            detRut.setRangoRep(detRutDTO.rangoRep());
            detRut.setRangoPeso(detRutDTO.rangoPeso());
            detRut.setTiempoEstimado(detRutDTO.tiempoEstimado());
            detalleRepository.save(detRut);

        });
        return new MessageResponse("Rutina actualizada exitosamente.");
    }

    public List<AsignacionResponse> listarAsignaciones_coach() {
        // Obtenemos el email del coach logueado desde el token
        String emailCoach = SecurityContextHolder.getContext().getAuthentication().getName();

        // Usamos el nuevo método del repositorio
        return asignacionRepository.findByCoachMailUs(emailCoach).stream()
                .map(a -> new AsignacionResponse(
                        a.getIdCliCou(),
                        a.getCliente().getNomApe(),
                        a.getCliente().getDniUs(),
                        a.getRutina().getIdRutina(),
                        a.getRutina().getNombreRutina(),
                        a.getFechaPlan(),
                        a.getDuracionPlan()
                )).toList();
    }

}

