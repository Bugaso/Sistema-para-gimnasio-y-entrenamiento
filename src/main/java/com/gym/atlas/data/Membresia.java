package com.gym.atlas.data;

import jakarta.persistence.*;

@Entity
@Table(name = "membresia")
public class Membresia {

//    @jakarta.persistence.Id
//    private Long id;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idMembresia")
    private Long idMembresia;

    private String descripMembresia;
    private Long costoMembresia;
    private Long duracionMembresia;

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

    public Long getCostoMembresia() {
        return costoMembresia;
    }

    public void setCostoMembresia(Long costoMembresia) {
        this.costoMembresia = costoMembresia;
    }

    public Long getDuracionMembresia() {
        return duracionMembresia;
    }

    public void setDuracionMembresia(Long duracionMembresia) {
        this.duracionMembresia = duracionMembresia;
    }
}
