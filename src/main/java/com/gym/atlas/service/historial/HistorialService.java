package com.gym.atlas.service.historial;

import com.gym.atlas.data.ejercicio.Ejercicio;
import com.gym.atlas.data.rutina.ClienteCoach;
import com.gym.atlas.data.rutina.HistorialRutina;
import com.gym.atlas.data.rutina.HistorialSerie;
import com.gym.atlas.data.rutina.Rutina;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.historial.*;
import com.gym.atlas.repository.ejercicio.EjercicioRepository;
import com.gym.atlas.repository.rutina.ClienteCoachRepository;
import com.gym.atlas.repository.rutina.HistorialRutinaRepository;
import com.gym.atlas.repository.rutina.HistorialSerieRepository;
import com.gym.atlas.repository.rutina.RutinaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HistorialService {

    private final HistorialRutinaRepository historialRutinaRepo;
    private final HistorialSerieRepository historialSerieRepo;
    private final ClienteCoachRepository asignacionRepo;
    private final RutinaRepository rutinaRepo;
    private final EjercicioRepository ejercicioRepo;

    public HistorialService(HistorialRutinaRepository historialRutinaRepo, HistorialSerieRepository historialSerieRepo,
                            ClienteCoachRepository asignacionRepo, RutinaRepository rutinaRepo, EjercicioRepository ejercicioRepo) {
        this.historialRutinaRepo = historialRutinaRepo;
        this.historialSerieRepo = historialSerieRepo;
        this.asignacionRepo = asignacionRepo;
        this.rutinaRepo = rutinaRepo;
        this.ejercicioRepo = ejercicioRepo;
    }

    @Transactional
    public MessageResponse registrarSesion(RegistroSesionRequest request) {
        ClienteCoach asignacion = asignacionRepo.findById(request.idCliCou())
                .orElseThrow(() -> new RuntimeException("Asignación no encontrada."));

        Rutina rutina = rutinaRepo.findById(request.idRutina())
                .orElseThrow(() -> new RuntimeException("Rutina no encontrada."));

        if(historialRutinaRepo.findByAsignacionIdCliCouAndFechaRegistro(
                asignacion.getIdCliCou(),
                request.fechaRegistro())
                .isPresent()){
            new RuntimeException("Ya se registro una sesion en esa fecha");
        }


        // 1. Guardar la cabecera del historial
        HistorialRutina cabecera = new HistorialRutina();
        cabecera.setAsignacion(asignacion);
        cabecera.setRutina(rutina);
        cabecera.setFechaRegistro(request.fechaRegistro() != null ? request.fechaRegistro() : LocalDate.now());

        HistorialRutina cabeceraGuardada = historialRutinaRepo.save(cabecera);

        // 2. Guardar el detalle de las series
        if (request.series() != null && !request.series().isEmpty()) {
            for (SerieRealizadaRequest serieReq : request.series()) {
                HistorialSerie serie = new HistorialSerie();
                serie.setHistorialRutina(cabeceraGuardada);

                Ejercicio ej = ejercicioRepo.findById(serieReq.idEjercicio())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado."));
                serie.setEjercicio(ej);

                serie.setNroSerie(serieReq.nroSerie());
                serie.setNroRepeticiones(serieReq.nroRepeticiones());
                serie.setNroPeso(serieReq.nroPeso());
                serie.setMedidaEsfuerzo(serieReq.medidaEsfuerzo());
                serie.setCantMedida(serieReq.cantMedida());
                serie.setTiempoSegundos(serieReq.tiempoSegundos());

                historialSerieRepo.save(serie);
            }
        }

        return new MessageResponse("Sesión de entrenamiento registrada con éxito.");
    }

    // Obtener lista de fechas en las que el cliente entrenó
    public List<HistorialResumenResponse> obtenerResumenPorAsignacion(Integer idCliCou) {
        return historialRutinaRepo.findByAsignacionIdCliCouOrderByFechaRegistroDesc(idCliCou).stream()
                .map(h -> new HistorialResumenResponse(
                        h.getIdHistRut(),
                        h.getFechaRegistro(),
                        h.getRutina().getNombreRutina()
                )).toList();
    }

    // Obtener el detalle exacto de una sesión para rellenar el formulario de edición
    public HistorialDetalleResponse obtenerDetalleSesion(Integer idHistRut) {
        HistorialRutina cabecera = historialRutinaRepo.findById(idHistRut)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada."));

        List<SerieRealizadaResponse> series = historialSerieRepo.findByHistorialRutinaIdHistRut(idHistRut).stream()
                .map(s -> new SerieRealizadaResponse(
                        s.getIdSerie(),
                        s.getEjercicio().getIdEjercicio(),
                        s.getEjercicio().getNomEjercicio(),
                        s.getNroSerie(),
                        s.getNroRepeticiones(),
                        s.getNroPeso(),
                        s.getMedidaEsfuerzo(),
                        s.getCantMedida(),
                        s.getTiempoSegundos()
                )).toList();

        return new HistorialDetalleResponse(
                cabecera.getIdHistRut(),
                cabecera.getFechaRegistro(),
                cabecera.getRutina().getIdRutina(),
                cabecera.getRutina().getNombreRutina(),
                series
        );
    }

    // Actualizar una sesión (Borra las series viejas y guarda las nuevas)
    @Transactional
    public MessageResponse actualizarSesion(Integer idHistRut, RegistroSesionRequest request) {
        HistorialRutina cabecera = historialRutinaRepo.findById(idHistRut)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada."));

        // Actualizamos la fecha si es que la cambiaron
        if (request.fechaRegistro() != null) {
            cabecera.setFechaRegistro(request.fechaRegistro());
            historialRutinaRepo.save(cabecera);
        }

        // Borramos las series anteriores
        historialSerieRepo.deleteByHistorialRutinaIdHistRut(idHistRut);

        // Insertamos las nuevas series modificadas
        if (request.series() != null && !request.series().isEmpty()) {
            for (SerieRealizadaRequest serieReq : request.series()) {
                HistorialSerie serie = new HistorialSerie();
                serie.setHistorialRutina(cabecera);

                Ejercicio ej = ejercicioRepo.findById(serieReq.idEjercicio())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado."));
                serie.setEjercicio(ej);

                serie.setNroSerie(serieReq.nroSerie());
                serie.setNroRepeticiones(serieReq.nroRepeticiones());
                serie.setNroPeso(serieReq.nroPeso());
                serie.setMedidaEsfuerzo(serieReq.medidaEsfuerzo());
                serie.setCantMedida(serieReq.cantMedida());
                serie.setTiempoSegundos(serieReq.tiempoSegundos());

                historialSerieRepo.save(serie);
            }
        }

        return new MessageResponse("Sesión actualizada correctamente.");
    }

    @Transactional
    public MessageResponse eliminarSesion(Integer idHistRut) {
        HistorialRutina histRut = historialRutinaRepo.findById(idHistRut).orElseThrow();

        historialSerieRepo.deleteByHistorialRutinaIdHistRut(histRut.getIdHistRut());

        historialRutinaRepo.delete(histRut);

        return new MessageResponse("Eliminacion de la sesion exitosa");
    }
}