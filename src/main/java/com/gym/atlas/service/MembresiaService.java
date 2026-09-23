package com.gym.atlas.service;

import com.gym.atlas.data.Membresia;
import com.gym.atlas.dto.RegistrarMembresiaRequest;
import com.gym.atlas.repository.MembresiaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembresiaService {

    private final MembresiaRepository memRep;

    public MembresiaService (MembresiaRepository memRep){
        this.memRep = memRep;
    }

    public Membresia registrarMembresia(RegistrarMembresiaRequest request){

        if(request == null
                || request.descripMembresia() == null
                || request.descripMembresia().isBlank()
                || request.costoMembresia() == null
                || request.duracionMembresia() == null
                || request.duracionMembresia() <= 0){
            throw new IllegalArgumentException("Los datos de la membresía son obligatorios o no válidos");
        }

        Membresia membresia = new Membresia();
        membresia.setCostoMembresia(request.costoMembresia());
        membresia.setDescripMembresia(request.descripMembresia());
        membresia.setDuracionMembresia(request.duracionMembresia());
        membresia.setDiasMembresia(request.diasMembresia());
        memRep.save(membresia);

        return membresia;
    }

    public List<Membresia> listaMembresias(){
        return memRep.findAll();
    }

}
