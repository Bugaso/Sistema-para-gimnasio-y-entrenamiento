package com.gym.atlas.service.membresia;

import com.gym.atlas.data.membresia.Membresia;
import com.gym.atlas.data.membresia.TipoMembresia;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.membresia.*;
import com.gym.atlas.repository.membresia.MembresiaRepository;
import com.gym.atlas.repository.membresia.TipoMembresiaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public Optional<Membresia> obtenerMembresia(Long id){
        return memRep.findById(id);
    }

    public MessageResponse bajaMembresia(Long id){
        Membresia membresia = memRep.findById(id).orElseThrow();
        membresia.setEstado("INACTIVO");
        memRep.save(membresia);
        return new MessageResponse("Membresia dada de baja");
    }
    public List<MembresiaResponse> listaMembresias() {
        List<Membresia> membresias = memRep.findAll();

        return membresias.stream().map(m -> {
            // Mapeamos la lista interna de tipos a TipoMembresiaDTO
            List<TipoMembresiaResponse> tiposDto = m.getTipos() != null ?
                    m.getTipos().stream().map(t -> new TipoMembresiaResponse(
                            t.getId(),
                            t.getDuracionMembresia(),
                            t.getDiasAsistencia(),
                            t.isPlanificacion(),
                            t.getCostoMembresia(),
                            t.isEstado()
                    )).toList() : List.of();

            // Retornamos el DTO principal
            return new MembresiaResponse(
                    m.getIdMembresia(),
                    m.getDescripMembresia(),
                    m.getEstado(),
                    tiposDto
            );
        }).toList();
    }

    public MessageResponse registrarTipoMembresia(RegistrarTipoMembresiaRequest request) {


        Membresia membresia = memRep.findById(request.idMembresia()).orElseThrow();
        if(membresia.getEstado() == "INACTIVO"){
            return new MessageResponse("Membresia inactiva");
        }

        TipoMembresia tipoMembresia;
        MessageResponse mensaje;

        if(request.idTipoMem() == null){
            tipoMembresia = new TipoMembresia();
            tipoMembresia.setEstado(true);
            mensaje = new MessageResponse("Tipo registrado exitosamente");
        }else{
            tipoMembresia = tipoMemRep.findById(request.idTipoMem()).orElseThrow();
            mensaje = new MessageResponse("Tipo modificado exitosamente");
        }

        tipoMembresia.setCostoMembresia(request.costoMembresia());
        tipoMembresia.setDiasAsistencia(request.diasAsistencia());
        tipoMembresia.setPlanificacion(request.planificacion());
        tipoMembresia.setDuracionMembresia(request.duracionDiaMes());
        tipoMembresia.setMembresia(membresia);

        tipoMemRep.save(tipoMembresia);

        return mensaje;
    }

    public MessageResponse modificarTipoMembresia(ModificarTipoMembresiaRequest request) {



        TipoMembresia tipoMembresia;
        MessageResponse mensaje;


        tipoMembresia = tipoMemRep.findById(request.idTipoMem()).orElseThrow();
        mensaje = new MessageResponse("Tipo modificado exitosamente");


        tipoMembresia.setCostoMembresia(request.costoMembresia());
        tipoMembresia.setDiasAsistencia(request.diasAsistencia());
        tipoMembresia.setPlanificacion(request.planificacion());
        tipoMembresia.setDuracionMembresia(request.duracionDiaMes());

        tipoMemRep.save(tipoMembresia);

        return mensaje;
    }

    public List<TipoMembresiaResponse> obtenerTipoMembresia(Long request) {
        Membresia mem = memRep.findById(request).orElseThrow();

        List<TipoMembresia> tipoMemList = mem.getTipos();
        // Verificamos que la lista no sea null y mapeamos cada entidad al DTO
        if (tipoMemList == null || tipoMemList.isEmpty()) {
            return List.of(); // Retornamos lista vacía si no tiene tipos
        }

        return tipoMemList.stream().map(
                tipoMembresia -> new TipoMembresiaResponse(
                            tipoMembresia.getId(),
                            tipoMembresia.getDuracionMembresia(),
                            tipoMembresia.getDiasAsistencia(),
                            tipoMembresia.isPlanificacion(),
                            tipoMembresia.getCostoMembresia(),
                            tipoMembresia.isEstado()
                    )).toList();
    }

    public MessageResponse altaTipoMembresia(Long id) {
        TipoMembresia tipo = tipoMemRep.findById(id).orElseThrow();
        tipo.setEstado(true);
        tipoMemRep.save(tipo);
        return new MessageResponse("Alta exitosa");
    }

    public MessageResponse bajaTipoMembresia(Long id) {
        TipoMembresia tipo = tipoMemRep.findById(id).orElseThrow();
        tipo.setEstado(false);
        tipoMemRep.save(tipo);
        return new MessageResponse("Baja exitosa");
    }


    public MessageResponse altaLogicaMembresia(Long id) {
        Membresia mem = memRep.findById(id).orElseThrow();
        mem.setEstado("ACTIVO");
        memRep.save(mem);
        return new MessageResponse("Alta de membresia exitosa");
    }
}
