package com.gym.atlas.service.ejercicio;

import com.gym.atlas.data.Equipamiento;
import com.gym.atlas.dto.ejercicio.EquipamientoRequest;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.repository.EquipamientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EquipamientoService {

    private final EquipamientoRepository equipamientoRepository;

    public EquipamientoService(EquipamientoRepository equipamientoRepository) {
        this.equipamientoRepository = equipamientoRepository;
    }

    public List<Equipamiento> obtenerEquipamientos() {
        return equipamientoRepository.findAll();
    }

    @Transactional
    public MessageResponse crearEquipamiento(EquipamientoRequest request) {
        String nombreEquipamiento = request.nomEquipamiento().trim();

        if(equipamientoRepository.existsByNomEquipamientoIgnoreCase(nombreEquipamiento)){
            throw new RuntimeException("El equipamiento '" + nombreEquipamiento + "' ya existe en el sistema.");
        }

        Equipamiento nuevoEquip = new Equipamiento();
        nuevoEquip.setNomEquipamiento(request.nomEquipamiento());
        equipamientoRepository.save(nuevoEquip);
        return new MessageResponse("Equipamiento creado exitosamente.");
    }

    @Transactional
    public MessageResponse actualizarEquipamiento(Integer id, EquipamientoRequest request) {
        Equipamiento equip = equipamientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El equipamiento especificado no existe."));

        String nuevoNombre = request.nomEquipamiento().trim();

        if(!equip.getNomEquipamiento().equalsIgnoreCase(nuevoNombre)
                && equipamientoRepository.existsByNomEquipamientoIgnoreCase(nuevoNombre)) {
                    throw new RuntimeException("El equipamiento '" +nuevoNombre+ "' ya existe");
        }

        equip.setNomEquipamiento(request.nomEquipamiento());
        equipamientoRepository.save(equip);
        return new MessageResponse("Equipamiento actualizado exitosamente.");
    }

    @Transactional
    public MessageResponse eliminarEquipamiento(Integer id) {
        if (!equipamientoRepository.existsById(id)) {
            throw new RuntimeException("El equipamiento especificado no existe.");
        }
        equipamientoRepository.deleteById(id);
        return new MessageResponse("Equipamiento eliminado exitosamente.");
    }
}