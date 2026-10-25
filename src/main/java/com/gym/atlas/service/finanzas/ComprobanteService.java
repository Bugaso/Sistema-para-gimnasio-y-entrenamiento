package com.gym.atlas.service.finanzas;

import com.gym.atlas.data.CategoriaGasto;
import com.gym.atlas.data.Comprobante;
import com.gym.atlas.dto.finanzas.ComprobanteRequest;
import com.gym.atlas.dto.finanzas.ComprobanteResponse;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.repository.CategoriaGastoRepository;
import com.gym.atlas.repository.ComprobanteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComprobanteService {

    private final ComprobanteRepository comprobanteRepository;
    private final CategoriaGastoRepository categoriaGastoRepository;

    public ComprobanteService(ComprobanteRepository comprobanteRepository, CategoriaGastoRepository categoriaGastoRepository) {
        this.comprobanteRepository = comprobanteRepository;
        this.categoriaGastoRepository = categoriaGastoRepository;
    }

    public List<ComprobanteResponse> obtenerComprobantes() {
        return comprobanteRepository.findAll().stream().map(comp -> new ComprobanteResponse(
                comp.getIdComprobante(),
                comp.getCategoriaGasto().getIdCategoriaGasto(),
                comp.getCategoriaGasto().getNombreCatGasto(),
                comp.getDescripcionGasto(),
                comp.getFechaDelComprobante(),
                comp.getFechaRegistroGasto(),
                comp.getMonto(),
                comp.getEstado()
        )).toList();
    }

    @Transactional
    public MessageResponse crearComprobante(ComprobanteRequest request) {
        Comprobante comprobante = new Comprobante();

        // Asignamos la fecha de registro automáticamente al momento actual
        comprobante.setFechaRegistroGasto(LocalDateTime.now());

        mapearDatos(comprobante, request);
        comprobanteRepository.save(comprobante);
        return new MessageResponse("Comprobante registrado exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarComprobante(Integer id, ComprobanteRequest request) {
        Comprobante comprobante = comprobanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El comprobante no existe."));

        mapearDatos(comprobante, request);
        comprobanteRepository.save(comprobante);
        return new MessageResponse("Comprobante actualizado exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarComprobante(Integer id) {
        if (!comprobanteRepository.existsById(id)) {
            throw new RuntimeException("El comprobante no existe.");
        }
        comprobanteRepository.deleteById(id);
        return new MessageResponse("Comprobante eliminado exitosamente.");
    }

    private void mapearDatos(Comprobante comprobante, ComprobanteRequest request) {
        comprobante.setDescripcionGasto(request.descripcionGasto());
        comprobante.setFechaDelComprobante(request.fechaDelComprobante());
        comprobante.setMonto(request.monto());
        comprobante.setEstado(request.estado());

        CategoriaGasto categoria = categoriaGastoRepository.findById(request.idCatGasto())
                .orElseThrow(() -> new RuntimeException("Categoría de gasto no encontrada."));
        comprobante.setCategoriaGasto(categoria);
    }
}