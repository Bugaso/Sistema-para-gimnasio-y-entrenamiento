package com.gym.atlas.service.membresia;

import com.gym.atlas.data.membresia.Membresia;
import com.gym.atlas.data.membresia.TipoMembresia;
import com.gym.atlas.dto.membresia.RegistrarMembresiaRequest;
import com.gym.atlas.repository.membresia.MembresiaRepository;
import com.gym.atlas.repository.membresia.TipoMembresiaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembresiaService {

    private final MembresiaRepository memRep;
    private final TipoMembresiaRepository tipoMemRep;

    public MembresiaService (MembresiaRepository memRep, TipoMembresiaRepository tipoMemRep){
        this.memRep = memRep;
        this.tipoMemRep = tipoMemRep;
    }

    public Membresia registrarMembresia(RegistrarMembresiaRequest request){

        if(request == null
                || request.descripMembresia() == null
                || request.descripMembresia().isBlank()
                //|| request.costoMembresia() == null
                //|| request.duracionMembresia() == null
                //|| request.duracionMembresia() <= 0
        )
        {
            throw new IllegalArgumentException("Los datos de la membresía son obligatorios o no válidos");
        }

        Membresia membresia = new Membresia();
        //membresia.setCostoMembresia(request.costoMembresia());
        membresia.setDescripMembresia(request.descripMembresia());
       // membresia.setDuracionMembresia(request.duracionMembresia());
        //membresia.setDiasMembresia(request.diasMembresia());
        membresia.setEstado("ACTIVO");
        memRep.save(membresia);

        return membresia;
    }

    public List<Membresia> listaMembresias(){
        return memRep.findAll();
    }

}
