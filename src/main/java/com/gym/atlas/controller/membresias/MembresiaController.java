package com.gym.atlas.controller.membresias;

import com.gym.atlas.data.Membresia;
import com.gym.atlas.dto.membresia.RegistrarMembresiaRequest;
import com.gym.atlas.service.membresia.MembresiaService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/membresia")
public class MembresiaController {

    private final MembresiaService memServ;

    public MembresiaController(MembresiaService memServ){
        this.memServ = memServ;
    }

    @GetMapping()
    public ResponseEntity<ClassPathResource> membresia(){
        ClassPathResource resource = new ClassPathResource("static/membresia.html");
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
    public ResponseEntity<List<Membresia>> listarMembresias(){
        return ResponseEntity.ok(memServ.listaMembresias());
    }
}
