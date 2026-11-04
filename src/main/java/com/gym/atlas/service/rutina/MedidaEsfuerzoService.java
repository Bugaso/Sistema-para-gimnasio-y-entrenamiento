package com.gym.atlas.service.rutina;

import com.gym.atlas.data.rutina.MedidaEsfuerzo;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.rutina.MedidaEsfuerzoDTO;
import com.gym.atlas.repository.rutina.MedidaEsfuerzoRepository;

public class MedidaEsfuerzoService {

    private final MedidaEsfuerzoRepository medEsRep;

    public MedidaEsfuerzoService(MedidaEsfuerzoRepository medEsRep) {
        this.medEsRep = medEsRep;
    }

    public MessageResponse crearMedida(MedidaEsfuerzoDTO medEsDTO){
        if(medEsDTO == null){
            return new MessageResponse("Faltan completar los campos");
        }
        MedidaEsfuerzo medEs = new MedidaEsfuerzo();
        medEs.setNombreMedida(medEsDTO.nombreMedida());
        medEs.setCantMedida(medEsDTO.cantMedida());

        medEsRep.save(medEs);
        return new MessageResponse("Nueva medida creada correctamente");
    }

    public MessageResponse borrarMedida(Integer medEsId){
        MedidaEsfuerzo medEs = medEsRep.findById(medEsId).orElseThrow();
        medEsRep.delete(medEs);
        return new MessageResponse("Medida de entrenamiento eliminada correctamente");
    }
}
