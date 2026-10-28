package com.gym.atlas.service.usuario;

import com.gym.atlas.data.usuario.HistorialMedico;
import com.gym.atlas.data.usuario.Usuario;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.usuario.HistorialMedicoRequest;
import com.gym.atlas.dto.usuario.HistorialMedicoResponse;
import com.gym.atlas.repository.usuario.HistorialMedicoRepository;
import com.gym.atlas.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HistorialMedicoService {

    private final HistorialMedicoRepository historialRepository;
    private final UsuarioRepository usuarioRepository;

    public HistorialMedicoService(HistorialMedicoRepository historialRepository, UsuarioRepository usuarioRepository) {
        this.historialRepository = historialRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<HistorialMedicoResponse> obtenerHistoriales() {
        return historialRepository.findAll().stream().map(this::mapearAResponse).toList();
    }

    @Transactional
    public MessageResponse crearHistorial(HistorialMedicoRequest request) {
        HistorialMedico hm = new HistorialMedico();
        hm.setFechaRegHMed(LocalDate.now()); // Requerimiento: Fecha actual del sistema

        Usuario usuario = usuarioRepository.findById(Long.valueOf(request.idUsuario()))
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));
        hm.setUsuario(usuario);

        hm.setAlturaHReg(request.alturaHReg());
        hm.setPesoHReg(request.pesoHReg());
        hm.setCondMed(request.condMed());
        hm.setDescHMed(request.descHMed());

        historialRepository.save(hm);
        return new MessageResponse("Expediente médico creado exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarHistorial(Integer id, HistorialMedicoRequest request) {
        HistorialMedico hm = historialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expediente no encontrado."));

        hm.setAlturaHReg(request.alturaHReg());
        hm.setPesoHReg(request.pesoHReg());
        hm.setCondMed(request.condMed());
        hm.setDescHMed(request.descHMed());

        historialRepository.save(hm);
        return new MessageResponse("Expediente médico actualizado exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarHistorial(Integer id) {
        if (!historialRepository.existsById(id)) {
            throw new RuntimeException("Expediente no encontrado.");
        }
        historialRepository.deleteById(id);
        return new MessageResponse("Expediente eliminado.");
    }

    private HistorialMedicoResponse mapearAResponse(HistorialMedico hm) {
        return new HistorialMedicoResponse(
                hm.getIdHMedico(),
                hm.getUsuario().getIdUsuario(),
                hm.getUsuario().getDniUs(),
                hm.getUsuario().getNomApe(),
                hm.getAlturaHReg(),
                hm.getPesoHReg(),
                hm.getCondMed(),
                hm.getDescHMed(),
                hm.getFechaRegHMed()
        );
    }
}