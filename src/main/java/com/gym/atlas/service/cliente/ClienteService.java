package com.gym.atlas.service.cliente;

import com.gym.atlas.data.ejercicio.Ejercicio;
import com.gym.atlas.data.rutina.ClienteCoach;
import com.gym.atlas.data.rutina.HistorialRutina;
import com.gym.atlas.data.rutina.HistorialSerie;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.cliente.ClienteRutinaResponse;

import com.gym.atlas.dto.cliente.PerfilClienteRequest;
import com.gym.atlas.dto.cliente.PerfilClienteResponse;
import com.gym.atlas.dto.cliente.RegistroSesionClienteRequest;
import com.gym.atlas.dto.ejercicio.*;
import com.gym.atlas.dto.historial.HistorialDetalleResponse;
import com.gym.atlas.dto.historial.SerieRealizadaResponse;
import com.gym.atlas.dto.rutina.DetalleRutinaResponse;
import com.gym.atlas.dto.rutina.RutinaConDetallesResponse;
import com.gym.atlas.dto.rutina.RutinaResponse;
import com.gym.atlas.repository.ejercicio.EjercicioRepository;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    // 1. TODOS los repositorios van aquí arriba
    private final UsuarioRepository usuarioRepository;
    private final ClienteCoachRepository asignacionRepository;
    private final DetalleRutinaRepository detalleRutinaRepository;
    private final HistorialRutinaRepository historialRutinaRepository;
    private final HistorialSerieRepository historialSerieRepository;
    private final EjercicioRepository ejercicioRep;

    // 2. Inyección de dependencias en el constructor único
    public ClienteService(
            UsuarioRepository usuarioRepository,
            ClienteCoachRepository asignacionRepository,
            DetalleRutinaRepository detalleRutinaRepository,
            HistorialRutinaRepository historialRutinaRepository,
            HistorialSerieRepository historialSerieRepository,
            EjercicioRepository ejercicioRep
    ) {
        this.usuarioRepository = usuarioRepository;
        this.asignacionRepository = asignacionRepository;
        this.detalleRutinaRepository = detalleRutinaRepository;
        this.historialRutinaRepository = historialRutinaRepository;
        this.historialSerieRepository = historialSerieRepository;
        this.ejercicioRep = ejercicioRep;
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
    public List<ClienteRutinaResponse> obtenerRutinasActivas() { // Cambiado a List
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Obtiene solo las rutinas activas
        List<ClienteCoach> asignaciones = asignacionRepository.findByClienteMailUsAndEstadoTrue(email);

        if (asignaciones.isEmpty()) {
            throw new RuntimeException("No tienes rutinas asignadas actualmente.");
        }

        // Recorremos todas las asignaciones del usuario y mapeamos cada una
        return asignaciones.stream().map(asignacion -> {
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
                            detalle.getCantMedida(),
                            detalle.getEjercicio().getDirImgEjercicio()
                    ))
                    .toList();

            return new ClienteRutinaResponse(
                    new RutinaResponse(
                            rutina.getIdRutina(),
                            rutina.getNombreRutina(),
                            rutina.getDescripcion(),
                            rutina.getEsPlantilla(),
                            rutina.getFechaCreacion()
                    ),
                    asignacion.getIdCliCou(),
                    detalles
            );
        }).toList(); // Devolvemos la lista completa
    }

    // MÉTODO 2: OBTENER EL HISTORIAL DE SESIÓN POR FECHA
    public List<HistorialRutinaClienteResponse> obtenerHistorialSesionPorFecha(String fechaStr) {
        LocalDate fecha = LocalDate.parse(fechaStr);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        List<ClienteCoach> asignaciones = asignacionRepository.findByClienteMailUs(email);
        if (asignaciones.isEmpty()) return List.of();

        // 1. Recopilar todas las sesiones registradas en esa fecha (soporta múltiples rutinas)
        List<HistorialRutina> historialesDelDia = new ArrayList<>();
        for (ClienteCoach asignacion : asignaciones) {
            List<HistorialRutina> hist = historialRutinaRepository.findByAsignacionIdCliCouOrderByFechaRegistroDesc(asignacion.getIdCliCou());
            historialesDelDia.addAll(hist.stream()
                    .filter(h -> h.getFechaRegistro().equals(fecha))
                    .toList());
        }

        if (historialesDelDia.isEmpty()) return List.of();

        // 2. Mapear cada historial a la clase Response
        return historialesDelDia.stream().map(hr -> {
            List<HistorialSerie> series = historialSerieRepository.findByHistorialRutinaIdHistRut(hr.getIdHistRut());

            // Agrupar las series por el ID del ejercicio
            Map<Integer, List<HistorialSerie>> seriesAgrupadas = series.stream()
                    .collect(Collectors.groupingBy(s -> s.getEjercicio().getIdEjercicio()));

            // Construir los ejercicios con sus series internas
            List<HistorialEjercicioClienteResponse> ejerciciosResponse = seriesAgrupadas.entrySet().stream().map(entry -> {
                HistorialSerie primeraSerie = entry.getValue().get(0);

                List<SerieClienteRealizadoResponse> seriesResp = entry.getValue().stream().map(s -> new SerieClienteRealizadoResponse(
                        s.getIdSerie(),
                        s.getNroSerie(),
                        s.getNroRepeticiones(),
                        s.getNroPeso(),
                        s.getMedidaEsfuerzo(),
                        s.getCantMedida(),
                        s.getTiempoSegundos()
                )).toList();

                return new HistorialEjercicioClienteResponse(
                        primeraSerie.getEjercicio().getIdEjercicio(),
                        primeraSerie.getEjercicio().getNomEjercicio(),
                        seriesResp
                );
            }).toList();

            // Evitar null si la entidad Coach no está cargada
            String nomCoach = "Sin Asignar";
            if (hr.getAsignacion() != null && hr.getAsignacion().getCoach() != null) {
                nomCoach = hr.getAsignacion().getCoach().getNomApe();
            }
            HistorialRutinaClienteResponse histCli = new HistorialRutinaClienteResponse(
                    hr.getIdHistRut(),
                    hr.getAsignacion().getIdCliCou(),
                    hr.getRutina().getIdRutina(),
                    hr.getRutina().getNombreRutina(),
                    nomCoach,
                    hr.getFechaRegistro(),
                    ejerciciosResponse
            );
            System.out.println(histCli.toString());
            return histCli;
        }).toList();
    }

    public EjercicioVerResponse obtenerEjercicio(String nombreEjercicio) {
        Ejercicio ej = ejercicioRep.findByNomEjercicio(nombreEjercicio).orElseThrow();
        return new EjercicioVerResponse(
                ej.getIdEjercicio(),
                ej.getCategoria().getNombreCat(),
                ej.getEquipamiento().getNomEquipamiento(),
                ej.getNomEjercicio(),
                ej.getDescEjercicio(),
                ej.getDirImgEjercicio()
        );
    }

    // Añade esto al final de tu clase ClienteService

    @Transactional
    public MessageResponse registrarSesion(RegistroSesionClienteRequest request) {
        // 1. Validar que el usuario logueado es el dueño de la asignación
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        ClienteCoach asignacion = asignacionRepository.findById(request.idCliCou())
                .orElseThrow(() -> new RuntimeException("Asignación no encontrada."));

        if (!asignacion.getCliente().getMailUs().equals(email)) {
            throw new RuntimeException("No tienes permiso para registrar en esta rutina.");
        }

        // 2. Comprobar si ya existe un registro para esta rutina en este día exacto
        if(historialRutinaRepository.findByAsignacionIdCliCouAndFechaRegistro(
                        asignacion.getIdCliCou(),
                        request.fechaRegistro())
                .isPresent()){
            new RuntimeException("Ya se registro una sesion en esa fecha");
        }

        // 3. Crear cabecera: HistorialRutina
        HistorialRutina nuevoHistorial = new HistorialRutina();
        nuevoHistorial.setAsignacion(asignacion);
        nuevoHistorial.setRutina(asignacion.getRutina());
        nuevoHistorial.setFechaRegistro(request.fechaRegistro());

        HistorialRutina historialGuardado = historialRutinaRepository.save(nuevoHistorial);

        // 4. Crear los detalles de series: HistorialSerie
        List<HistorialSerie> seriesAGuardar = request.series().stream().map(serieReq -> {
            Ejercicio ejercicio = ejercicioRep.findById(serieReq.idEjercicio())
                    .orElseThrow(() -> new RuntimeException("Ejercicio ID " + serieReq.idEjercicio() + " no encontrado"));

            HistorialSerie hs = new HistorialSerie();
            hs.setHistorialRutina(historialGuardado);
            hs.setEjercicio(ejercicio);
            hs.setNroSerie(serieReq.nroSerie());
            hs.setNroRepeticiones(serieReq.nroRepeticiones());
            hs.setNroPeso(serieReq.nroPeso());
            hs.setMedidaEsfuerzo(serieReq.medidaEsfuerzo());
            hs.setCantMedida(serieReq.cantMedida());
            hs.setTiempoSegundos(serieReq.tiempoSegundos());
            return hs;
        }).toList();

        // 5. Guardar todas las series en bloque
        historialSerieRepository.saveAll(seriesAGuardar);

        return new MessageResponse("Sesión registrada exitosamente.");
    }
}