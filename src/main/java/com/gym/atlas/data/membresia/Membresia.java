package com.gym.atlas.data.membresia;

import jakarta.persistence.*;

@Entity
(name = "membresia")
public class Membresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idMembresia")
    private Long idMembresia;

    private String descripMembresia;

    private String estado;

    public Membresia(){

    }

    public Long getIdMembresia() {
        return idMembresia;
    }

    public void setIdMembresia(Long idMembresia) {
        this.idMembresia = idMembresia;
    }

    public String getDescripMembresia() {
        return descripMembresia;
    }

    public void setDescripMembresia(String descripMembresia) {
        this.descripMembresia = descripMembresia;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
