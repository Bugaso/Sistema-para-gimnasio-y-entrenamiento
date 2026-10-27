package com.gym.atlas.controller.membresias;

import com.gym.atlas.data.membresia.Membresia;
import com.gym.atlas.dto.MessageResponse;
import com.gym.atlas.dto.membresia.MembresiaResponse;
import com.gym.atlas.dto.membresia.RegistrarMembresiaRequest;
import com.gym.atlas.dto.membresia.RegistrarTipoMembresiaRequest;
import com.gym.atlas.dto.membresia.TipoMembresiaResponse;
import com.gym.atlas.service.membresia.MembresiaService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@RestController
@RequestMapping("/membresia")
public class MembresiaController {

    private final MembresiaService memServ;

    public MembresiaController(MembresiaService memServ){
        this.memServ = memServ;
    }

    @GetMapping()
    public ResponseEntity<ClassPathResource> membresia(){
        ClassPathResource resource = new ClassPathResource("static/admin/membresias.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @PostMapping("registrar")
    public ResponseEntity<Membresia> registrarMembresia(
            @RequestBody
            RegistrarMembresiaRequest request
    ){
        return ResponseEntity.ok(memServ.registrarMembresia(request));
    }

    @GetMapping("listar")
    public ResponseEntity<List<MembresiaResponse>> listarMembresias(){
        return ResponseEntity.ok(memServ.listaMembresias());
    }

    @PutMapping("/{id}/alta")
    public ResponseEntity<MessageResponse> AltaMembresia(@PathVariable Long id) {

        return ResponseEntity.ok(memServ.altaLogicaMembresia(id));
    }

    @PutMapping("/{id}/baja")
    public ResponseEntity<MessageResponse> bajaLogicaMembresia(@PathVariable Long id) {

        return ResponseEntity.ok(memServ.bajaMembresia(id));
    }

    @PostMapping("/tipo-membresia")
    public ResponseEntity<MessageResponse> crearTipoMembresia(@RequestBody RegistrarTipoMembresiaRequest request) {
        // Buscar la membresia por request.idMembresia(), setearla en un nuevo TipoMembresia y guardarlo
        // ... lógica del service

        return ResponseEntity.ok(memServ.registrarTipoMembresia(request));
    }

    @GetMapping("/tipo-membresia/{id}")
    public ResponseEntity<List<TipoMembresiaResponse>> verTipoMembresia(@PathVariable Long id) {
        // Buscar la membresia por request.idMembresia(), setearla en un nuevo TipoMembresia y guardarlo
        // ... lógica del service

        return ResponseEntity.ok(memServ.obtenerTipoMembresia(id));
    }

    @DeleteMapping("baja/{id}")
    public ResponseEntity<MessageResponse> bajaTipoMembresia(@PathVariable Long id) {

        return ResponseEntity.ok(memServ.bajaTipoMembresia(id));
    }


}
